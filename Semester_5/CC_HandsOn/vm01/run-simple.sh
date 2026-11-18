#!/usr/bin/env bash

qemu-system-x86_64  -name test1 -smp 4 -m 2048 -drive "file=lab/images/alpine-base.qcow2,format=qcow2,if=virtio" -nographic
