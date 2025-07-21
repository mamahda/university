#!/bin/bash

user="$(whoami)"

curTime=$(date "+%Y%m%d%H")
user=$(whoami)
logDir="/home/$user/metrics/"
fileName="metrics_$curTime.log"

chmod 700 $logDir"metrics_agg_"*.log

rm $logDir"metrics_agg_"*.log
