#!/bin/bash

ASSETS_DIR="assets"
mkdir -p "$ASSETS_DIR"

for i in $(seq 1 "$1"); do
    filename=$(head -c 16 /dev/urandom | sha256sum | cut -c1-16)."$2"

    size=$((RANDOM % 1024 + 1))

    truncate -s "$size" "$ASSETS_DIR/$filename"

    echo "Created $filename ($size bytes)"
done
