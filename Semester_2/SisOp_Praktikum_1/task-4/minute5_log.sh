#!/bin/bash

curTime=$(date "+%Y%m%d%H%m%s")
user=$(whoami)
logDir="/home/$user/metrics/"
fileName="metrics_$curTime.log"

if [ ! -d $logDir ]; then
    mkdir -p $logDir
fi

memory="$(free -m | awk '/Mem:/ {printf"%s,%s,%s,%s,%s,%s", $2,$3,$4,$5,$6,$7}')"
swap="$(free -m | awk '/Swap:/ {printf"%s,%s,%s", $2,$3,$4}')"
storage="$(du -sh /home/$user/ | awk '{printf"%s,%s", $2,$1}')"


echo "mem_total,mem_used,mem_free,mem_shared,mem_buff,mem_available,swap_total,swap_used,swap_free,path,path_size" > $logDir$fileName
echo "$memory,$swap,$storage" >> $logDir$fileName

chmod 400 $logDir$fileName
