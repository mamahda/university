#!/bin/bash

user="$(whoami)"

curTime=$(date "+%Y%m%d%H")
user=$(whoami)
logDir="/home/$user/metrics/"
fileName="metrics_$curTime.log"

maxMemTotal=$(cat $logDir"metrics_"$curTime*.log | grep /home/ | awk -F, '{print $1}' | sort -r | head -1)
minMemTotal=$(cat $logDir"metrics_"$curTime*.log | grep /home/ | awk -F, '{print $1}' | sort | head -1)
avgMemTotal=$(cat $logDir"metrics_"$curTime*.log | grep /home/ | awk -F, '{ total += $1; count++ } END { print total/count }')
avgMemTotal=${avgMemTotal/,/.}

maxMemUsed=$(cat $logDir"metrics_"$curTime*.log | grep /home/ | awk -F, '{print $2}' | sort -r | head -1)
minMemUsed=$(cat $logDir"metrics_"$curTime*.log | grep /home/ | awk -F, '{print $2}' | sort | head -1)
avgMemUsed=$(cat $logDir"metrics_"$curTime*.log | grep /home/ | awk -F, '{ total += $2; count++ } END { print total/count }')
avgMemUsed=${avgMemUsed/,/.}

maxMemFree=$(cat $logDir"metrics_"$curTime*.log | grep /home/ | awk -F, '{print $3}' | sort -r | head -1)
minMemFree=$(cat $logDir"metrics_"$curTime*.log | grep /home/ | awk -F, '{print $3}' | sort | head -1)
avgMemFree=$(cat $logDir"metrics_"$curTime*.log | grep /home/ | awk -F, '{ total += $3; count++ } END { print total/count }')
avgMemFree=${avgMemFree/,/.}

maxMemShared=$(cat $logDir"metrics_"$curTime*.log | grep /home/ | awk -F, '{print $4}' | sort -r | head -1)
minMemShared=$(cat $logDir"metrics_"$curTime*.log | grep /home/ | awk -F, '{print $4}' | sort | head -1)
avgMemShared=$(cat $logDir"metrics_"$curTime*.log | grep /home/ | awk -F, '{ total += $4; count++ } END { print total/count }')
avgMemShared=${avgMemShared/,/.}

maxMemBuff=$(cat $logDir"metrics_"$curTime*.log | grep /home/ | awk -F, '{print $5}' | sort -r | head -1)
minMemBuff=$(cat $logDir"metrics_"$curTime*.log | grep /home/ | awk -F, '{print $5}' | sort | head -1)
avgMemBuff=$(cat $logDir"metrics_"$curTime*.log | grep /home/ | awk -F, '{ total += $5; count++ } END { print total/count }')
avgMemBuff=${avgMemBuff/,/.}

maxMemAvail=$(cat $logDir"metrics_"$curTime*.log | grep /home/ | awk -F, '{print $6}' | sort -r | head -1)
minMemAvail=$(cat $logDir"metrics_"$curTime*.log | grep /home/ | awk -F, '{print $6}' | sort | head -1)
avgMemAvail=$(cat $logDir"metrics_"$curTime*.log | grep /home/ | awk -F, '{ total += $6; count++ } END { print total/count }')
avgMemAvail=${avgMemAvail/,/.}

maxSwapTotal=$(cat $logDir"metrics_"$curTime*.log | grep /home/ | awk -F, '{print $7}' | sort -r | head -1)
minSwapTotal=$(cat $logDir"metrics_"$curTime*.log | grep /home/ | awk -F, '{print $7}' | sort | head -1)
avgSwapTotal=$(cat $logDir"metrics_"$curTime*.log | grep /home/ | awk -F, '{ total += $7; count++ } END { print total/count }')
avgSwapTotal=${avgSwapTotal/,/.}

maxSwapUsed=$(cat $logDir"metrics_"$curTime*.log | grep /home/ | awk -F, '{print $8}' | sort -r | head -1)
minSwapUsed=$(cat $logDir"metrics_"$curTime*.log | grep /home/ | awk -F, '{print $8}' | sort | head -1)
avgSwapUsed=$(cat $logDir"metrics_"$curTime*.log | grep /home/ | awk -F, '{ total += $8; count++ } END { print total/count }')
avgSwapUsed=${avgSwapUsed/,/.}

maxSwapFree=$(cat $logDir"metrics_"$curTime*.log | grep /home/ | awk -F, '{print $9}' | sort -r | head -1)
minSwapFree=$(cat $logDir"metrics_"$curTime*.log | grep /home/ | awk -F, '{print $9}' | sort | head -1)
avgSwapFree=$(cat $logDir"metrics_"$curTime*.log | grep /home/ | awk -F, '{ total += $9; count++ } END { print total/count }')
avgSwapFree=${avgSwapFree/,/.}

maxPathSize=$(cat $logDir"metrics_"$curTime*.log | grep /home/ | awk -F, '{print $11}' | sort -r | head -1)
minPathSize=$(cat $logDir"metrics_"$curTime*.log | grep /home/ | awk -F, '{print $11}' | sort | head -1)
avgPathSize=$(cat $logDir"metrics_"$curTime*.log | grep /home/ | awk -F, '{ total += $11; count++ } END { print total/count }')
avgPathSize=${avgPathSize/,/.}

echo "type,mem_total,mem_used,mem_free,mem_shared,mem_buff,mem_available,swap_total,swap_used,swap_free,path,path_size" > $logDir"metrics_agg_"$curTime.log

echo "minimum,$minMemTotal,$minMemUsed,$minMemFree,$minMemShared,$minMemBuff,$minMemAvail,$minSwapTotal,$minSwapUsed,$minSwapFree,/home/$user/,$minPathSize" >> $logDir"metrics_agg_"$curTime.log

echo "maximum,$maxMemTotal,$maxMemUsed,$maxMemFree,$maxMemShared,$maxMemBuff,$maxMemAvail,$maxSwapTotal,$maxSwapUsed,$maxSwapFree,/home/$user/,$minPathSize" >> $logDir"metrics_agg_"$curTime.log

echo "average,$avgMemTotal,$avgMemUsed,$avgMemFree,$avgMemShared,$avgMemBuff,$avgMemAvail,$avgSwapTotal,$avgSwapUsed,$avgSwapFree,/home/$user/,$minPathSize" >> $logDir"metrics_agg_"$curTime.log

chmod 400 $logDir"metrics_agg_"$curTime.log
