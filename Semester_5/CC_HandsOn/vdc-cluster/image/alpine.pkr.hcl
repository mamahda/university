# Alpine role images for vdc-cluster: role = hub | spoke  (driven by build.sh)
packer {
  required_plugins {
    qemu = {
      source  = "github.com/hashicorp/qemu"
      version = ">= 1.1.0"
    }
  }
}

variable "role"           { type = string }
variable "alpine_version" { type = string }
variable "disk_size"      { type = string }
variable "output_dir"     { type = string }
variable "console_log"    { type = string }
variable "accelerator"    {
  type    = string
  default = "kvm"
}

locals {
  branch  = join(".", slice(split(".", var.alpine_version), 0, 2))
  iso_url = "https://dl-cdn.alpinelinux.org/alpine/v${local.branch}/releases/x86_64/alpine-virt-${var.alpine_version}-x86_64.iso"
}

source "qemu" "alpine" {
  iso_url          = local.iso_url
  iso_checksum     = "file:${local.iso_url}.sha256"
  output_directory = var.output_dir
  vm_name          = "${var.role}.qcow2"
  format           = "qcow2"
  disk_size        = var.disk_size
  disk_interface   = "virtio"
  disk_compression = true
  net_device       = "virtio-net"
  accelerator      = var.accelerator
  memory           = 1024
  cpus             = 2
  headless         = true
  http_directory   = "http"
  # installer progress ("### ...") lands here; build.sh follows it
  qemuargs         = [["-serial", "file:${var.console_log}"]]

  # the install script powers the VM off when it is done
  communicator     = "none"
  shutdown_timeout = "40m"

  boot_wait = "25s"
  boot_command = [
    "root<enter><wait3>",
    "ifconfig eth0 up && udhcpc -i eth0 -q<enter><wait8>",
    "wget -qO /tmp/i.sh http://{{ .HTTPIP }}:{{ .HTTPPort }}/alpine-install.sh && sh /tmp/i.sh ${var.role} http://{{ .HTTPIP }}:{{ .HTTPPort }}<enter>"
  ]
}

build {
  sources = ["source.qemu.alpine"]
}
