#!/usr/bin/env bash
# build.sh [hub|spoke|all] - build images/hub.qcow2 and/or images/spoke.qcow2 with Packer.
# Needs: packer, qemu-system-x86_64, internet. Run ./cluster.sh init first (lab PC SSH key).
#
# Shows progress from two sources while Packer runs:
#   packer: ...   Packer's own stages          (full output: logs/build/<role>.packer.log)
#   [ n] ...      steps of the Alpine installer (serial console: logs/build/<role>.console.log)
# and files the installer's command journal ("CMD <tool> ..." on the console) under
#   logs/build/<role>-commands/<tool>.log + all.log
set -euo pipefail
cd "$(dirname "$(readlink -f "$0")")"
# shellcheck source=../cluster.conf
. ../cluster.conf
LOGD=$(readlink -f ..)/logs/build
mkdir -p "$LOGD"

roles=${1:-all}
[ "$roles" = all ] && roles="hub spoke"
for r in $roles; do case $r in hub|spoke) ;; *) echo "usage: $0 [hub|spoke|all]"; exit 1 ;; esac; done
[ -f ../state/id_lab.pub ] || { echo "error: run ./cluster.sh init first"; exit 1; }
command -v packer >/dev/null || { echo "error: packer not installed"; exit 1; }

# rebuilding a base image under linked clones would corrupt them
for r in $roles; do
  if grep -lx "ROLE=$r" ../state/vms/*.env >/dev/null 2>&1 && [ "${FORCE:-0}" != 1 ]; then
    echo "error: $r VMs exist in state/vms (linked clones depend on images/$r.qcow2)."
    echo "       remove them (./cluster.sh rm NAME) or FORCE=1 $0 $*"
    exit 1
  fi
done

echo "### staging kit for the installer"
rm -rf http && mkdir -p http/kit
cp alpine-install.sh http/
cp -r ../common ../hub ../spoke ../cluster.conf http/kit/
cp ../state/id_lab.pub http/kit/authorized_keys
tar -C http/kit -czf http/kit.tar.gz .
rm -rf http/kit

accel=kvm
[ -w /dev/kvm ] || { accel=tcg; echo "warning: no /dev/kvm, building with TCG (slow)"; }
packer init alpine.pkr.hcl >"$LOGD/packer-init.log" 2>&1 ||
  { echo "error: packer init failed, see $LOGD/packer-init.log"; exit 1; }
mkdir -p ../images

el() { local s=$((SECONDS - t0)); printf '%2d:%02d' $((s / 60)) $((s % 60)); }

# complete lines FROM+1..TO of FILE (TO = line count taken just before)
lines() { if [ "$3" -gt "$2" ]; then sed -n "$(($2 + 1)),$3p" "$1"; fi; }

PID=""
trap '[ -n "$PID" ] && kill "$PID" 2>/dev/null; rm -rf http' EXIT

for r in $roles; do
  plog=$LOGD/$r.packer.log clog=$LOGD/$r.console.log cdir=$LOGD/$r-commands
  : >"$plog"; : >"$clog"; rm -rf "$cdir"; mkdir -p "$cdir"
  rm -rf "out-$r"
  t0=$SECONDS
  echo "### building $r"
  echo "    packer log:        $plog"
  echo "    installer console: $clog"
  packer build -force -color=false \
    -var "role=$r" -var "alpine_version=$ALPINE_VERSION" -var "disk_size=$DISK_SIZE" \
    -var "accelerator=$accel" -var "output_dir=out-$r" -var "console_log=$clog" \
    alpine.pkr.hcl >"$plog" 2>&1 &
  PID=$!
  pp=0 cp=0 step=0 failed=""
  while :; do
    alive=1; kill -0 "$PID" 2>/dev/null || alive=0
    pn=$(wc -l <"$plog") cn=$(wc -l <"$clog")
    while IFS= read -r l; do
      printf '  %s %-5s packer: %s\n' "$(el)" "$r" "$l"
    done < <(lines "$plog" "$pp" "$pn" | sed -nE 's/^==> qemu\.alpine: //p'); pp=$pn
    while IFS= read -r l; do
      step=$((step + 1))
      printf '  %s %-5s [%2d] %s\n' "$(el)" "$r" "$step" "$l"
      case $l in FAILED*) failed=$l ;; esac
    done < <(lines "$clog" "$cp" "$cn" | tr -d '\r' | sed -nE 's/.*### (.*)/\1/p')
    lines "$clog" "$cp" "$cn" | tr -d '\r' | sed -nE 's/^.*CMD ([A-Za-z0-9._-]+) (.*)$/\1 \2/p' |
      while read -r tool rec; do
        printf '%s\n' "$rec" >>"$cdir/$tool.log"; printf '%s\n' "$rec" >>"$cdir/all.log"
      done
    cp=$cn
    if [ -n "$failed" ] && [ $alive = 1 ]; then
      kill "$PID" 2>/dev/null || true
    fi
    [ $alive = 1 ] || break
    sleep 2
  done
  rc=0; wait "$PID" || rc=$?; PID=""
  if [ -n "$failed" ] || [ $rc -ne 0 ] || [ ! -f "out-$r/$r.qcow2" ]; then
    echo "### $r FAILED after $(el) (packer exit $rc)"
    echo "    last installer lines:"; tail -n 15 "$clog" | tr -d '\r' | sed 's/^/      | /'
    echo "    last packer lines:";    tail -n 8 "$plog" | sed 's/^/      | /'
    exit 1
  fi
  mv "out-$r/$r.qcow2" "../images/$r.qcow2"
  rm -rf "out-$r"
  echo "### images/$r.qcow2 ready ($(du -h "../images/$r.qcow2" | cut -f1)) in $(el)"
  echo "    commands run by the installer: $(grep -c ' \$ ' "$cdir/all.log" 2>/dev/null || echo 0) in logs/build/$r-commands/"
done
