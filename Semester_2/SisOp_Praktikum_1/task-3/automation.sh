#!/bin/bash

logdir="/home/blackcurrent/Kuliah_Semester_2/SisOp_Praktikum_1/task-3/cloud_storage/cloud_log.txt"

status=$(awk '($3 ~ "LOGIN:" || $3 ~ "LOGOUT:") && $4 !~ "ERROR" {print $3, $6}' "$logdir" | head -n 1)
action=$(echo "$status" | awk '{print $1}')
user=$(echo "$status" | awk '{print $2}')

if [[ "$action" == "LOGIN:" ]]; then
  activeuser="$user"
else
  activeuser=""
fi

if [[ -z "$activeuser" ]]; then
  massage="$(date '+%y/%m/%d %H:%M:%S') AUTOMATION: INFO no user active" 
  echo -e "$massage"
  echo -e "$massage\n$(cat $logdir)" > $logdir
  (crontab -l | grep -v -E "download.sh|archive.sh") | crontab
else
  massage="$(date '+%y/%m/%d %H:%M:%S') AUTOMATION: INFO $activeuser is active"
  echo -e "$massage"
  echo -e "$massage\n$(cat $logdir)" > $logdir
  crontabfile="/home/blackcurrent/Kuliah_Semester_2/SisOp_Praktikum_1/task-3/crontabs"

  if [[ -f "$crontabfile" ]]; then
    crontab "$crontabfile"
    massage="$(date '+%y/%m/%d %H:%M:%S') AUTOMATION: INFO executing crontab download and archive"
    echo -e "$massage"
    echo -e "$massage\n$(cat $logdir)" > $logdir
  else
    echo "ERROR: Crontab file not found!" >&2
  fi
fi
