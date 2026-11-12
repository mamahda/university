# shellcheck shell=sh
# /usr/local/lib/lab/lib.sh - helpers shared by hub and spoke (sourced, POSIX sh)
if [ -r /etc/lab/cluster.env ]; then . /etc/lab/cluster.env; fi
: "${HUB_IP:=10.20.0.2}" "${API_PORT:=8080}" "${TENANT_MTU:=1500}" "${POLL:=10}"
LAB_STATE=${LAB_STATE:-/var/lib/lab}

LAB_LOG=${LAB_LOG:-/var/log/lab}

# command journal: provisioning tools run through lab-trace (/var/log/lab/commands/<tool>.log)
LAB_TRACE=/usr/local/lib/lab/lab-trace
TRACE_BIN=/usr/local/lib/lab/trace.d
if [ "${TRACE:-changes}" != off ] && [ -d "$TRACE_BIN" ]; then
  case ":$PATH:" in *":$TRACE_BIN:"*) ;; *) PATH=$TRACE_BIN:$PATH ;; esac
  export PATH TRACE TRACE_OUTPUT
fi
LAB_TRACE_CTX=${LAB_TRACE_CTX:-${0##*/}}
export LAB_TRACE_CTX
# why the next commands run (shown as "# ..." in the journal)
step() { LAB_STEP=$*; export LAB_STEP; }
# record a config file a script just wrote
trace_file() { if [ -x "$LAB_TRACE" ]; then "$LAB_TRACE" --file "$@" || true; fi; }

log() { echo "$(date '+%F %T') $*"; }
# progress line on the serial console; the lab PC follows these ("LAB: ...")
con() { echo "LAB: $*" >/dev/console 2>/dev/null || true; }
die() { echo "error: $*" >&2; exit 1; }

# kv KEY  <  "key=value" lines   -> value of the first KEY
kv() { sed -n "s/^$1=//p" | head -n 1; }

is_name()  { printf '%s' "$1" | grep -Eq '^[a-z][a-z0-9]{0,7}$'; }    # node (goes into g<VNI>-<node>, max 15 chars)
is_tname() { printf '%s' "$1" | grep -Eq '^[a-z][a-z0-9-]{0,15}$'; }  # tenant / guest
is_vni()   { printf '%s' "$1" | grep -Eq '^[0-9]{1,5}$' && [ "$1" -ge 1 ] && [ "$1" -le 65535 ]; }
is_ip4()   { printf '%s' "$1" | grep -Eq '^([0-9]{1,3}\.){3}[0-9]{1,3}$'; }
is_mac()   { printf '%s' "$1" | grep -Eq '^([0-9a-f]{2}:){5}[0-9a-f]{2}$'; }

# IPv4 arithmetic for the tenant IPAM
ip2int() { echo "$1" | awk -F. '{print (($1 * 256 + $2) * 256 + $3) * 256 + $4}'; }
int2ip() { echo "$(($1 >> 24 & 255)).$(($1 >> 16 & 255)).$(($1 >> 8 & 255)).$(($1 & 255))"; }
is_cidr() {   # a.b.c.d/len, network address aligned, len 16..29
  printf '%s' "$1" | grep -Eq '^([0-9]{1,3}\.){3}[0-9]{1,3}/[0-9]{1,2}$' || return 1
  _l=${1#*/}; [ "$_l" -ge 16 ] && [ "$_l" -le 29 ] || return 1
  _n=$(ip2int "${1%/*}"); [ $(( _n & ((1 << (32 - _l)) - 1) )) -eq 0 ]
}
is_num() { printf '%s' "$1" | grep -Eq '^[0-9]{1,6}$'; }

randhex() { head -c "${1:-16}" /dev/urandom | od -An -tx1 | tr -d ' \n'; }

# SMBIOS type 11 OEM string "KEY=value" (QEMU: -smbios type=11,value=KEY=value)
smbios_get() {
  command -v dmidecode >/dev/null 2>&1 || return 0
  dmidecode -t 11 2>/dev/null | sed -n "s/^[[:space:]]*String [0-9]*: $1=//p" | head -n 1
}

# The ensure_* helpers only change what differs, so a reconcile pass that finds
# everything in place runs read-only commands only (and leaves the journal quiet).
link_conf() {   # DEV MTU [MASTER]
  cur=$(ip -o link show "$1" 2>/dev/null) || return 1
  case $cur in *" mtu $2 "*) ;; *) ip link set "$1" mtu "$2" ;; esac
  if [ -n "${3:-}" ]; then case $cur in *" master $3 "*) ;; *) ip link set "$1" master "$3" ;; esac; fi
  if ! printf '%s' "$cur" | grep -q '[<,]UP[,>]'; then ip link set "$1" up; fi
}

ensure_bridge() {   # BR
  if ! ip link show "$1" >/dev/null 2>&1; then
    step "tenant bridge $1"
    ip link add "$1" type bridge
  fi
  link_conf "$1" "$TENANT_MTU"
}

ensure_geneve() {   # DEV VNI REMOTE BRIDGE
  if ! ip -d link show "$1" 2>/dev/null | grep -q "geneve id $2 remote $3 "; then
    step "Geneve tunnel $1: VNI $2 to $3, port of $4"
    if ip link show "$1" >/dev/null 2>&1; then ip link del "$1"; fi    # wrong VNI/remote: rebuild
    ip link add "$1" type geneve id "$2" remote "$3"
  fi
  link_conf "$1" "$TENANT_MTU" "$4"
}

libvirt_ready() { virsh -q version >/dev/null 2>&1; }

# libvirt view of a tenant: network tenant-<NAME> = existing bridge br-t<VNI>
ensure_tenant_net() {   # TENANT VNI
  n=tenant-$1
  step "libvirt network $n on bridge br-t$2"
  if virsh net-info "$n" >/dev/null 2>&1 &&
     ! virsh net-dumpxml "$n" | grep -q "name='br-t$2'"; then
    virsh -q net-destroy "$n" >/dev/null 2>&1 || true
    virsh -q net-undefine "$n" >/dev/null
  fi
  if ! virsh net-info "$n" >/dev/null 2>&1; then
    f=$(mktemp)
    printf "<network>\n  <name>%s</name>\n  <forward mode='bridge'/>\n  <bridge name='br-t%s'/>\n</network>\n" "$n" "$2" >"$f"
    virsh -q net-define "$f" >/dev/null
    rm -f "$f"
    virsh -q net-autostart "$n" >/dev/null
  fi
  if ! virsh net-info "$n" 2>/dev/null | grep -Eq '^Active:[[:space:]]+yes'; then
    virsh -q net-start "$n" >/dev/null
  fi
}

# make libvirt's tenant-* networks match FILE ("NAME VNI" lines)
sync_tenant_nets() {
  libvirt_ready || return 0
  if virsh net-info default >/dev/null 2>&1; then          # no NAT'd default net in this lab
    step "remove libvirt's NAT default network"
    virsh -q net-destroy default >/dev/null 2>&1 || true
    virsh -q net-undefine default >/dev/null 2>&1 || true
  fi
  while read -r t v _; do
    if [ -n "$t" ]; then ensure_tenant_net "$t" "$v"; fi
  done <"$1"
  for n in $(virsh net-list --all --name); do
    case $n in
      tenant-*)
        if ! awk -v t="${n#tenant-}" '$1==t {f=1} END {exit !f}' "$1"; then
          step "tenant ${n#tenant-} is gone: remove its libvirt network"
          virsh -q net-destroy "$n" >/dev/null 2>&1 || true
          virsh -q net-undefine "$n" >/dev/null
        fi ;;
    esac
  done
}
