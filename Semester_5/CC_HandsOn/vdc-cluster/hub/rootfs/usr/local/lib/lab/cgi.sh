#!/bin/sh
# CGI glue: busybox httpd runs this as user labweb; the only privileged step is
# "doas hubctl _api ACTION REMOTE_ADDR" (see /etc/doas.d/lab.conf). The caller's
# address comes from the TCP connection, never from the request body.
printf 'Content-Type: text/plain\r\n\r\n'
if [ "${REQUEST_METHOD:-}" != POST ]; then echo "ERROR use-POST"; exit 0; fi
len=${CONTENT_LENGTH:-0}
case $len in ''|*[!0-9]*) len=0 ;; esac
[ "$len" -le 4096 ] || { echo "ERROR too-large"; exit 0; }
head -c "$len" | doas -n /usr/local/sbin/hubctl _api "$1" "${REMOTE_ADDR:-}" 2>&1
