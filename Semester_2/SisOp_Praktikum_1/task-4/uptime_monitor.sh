#!/bin/bash

curTime=$(date "+%Y%m%d%H")
user=$(whoami)
fileName="/home/$user/metrics/uptime_$curTime.log"

upTm=$(uptime | awk '{printf "%s %s %s", $1, $2, $3}')
load=$(cat /proc/loadavg | awk '{printf "%s,%s,%s", $1, $2, $3}')

echo "uptime,load_avg_1min,load_avg_5min,load_avg_15min" > $fileName
echo "$upTm,$load" >> $fileName
