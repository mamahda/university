#!/bin/bash

echo "User yang sesuai kriteria :"
echo "-------------------------------"

count=$(awk -F, '
 NR>1 && $2 ~ /2/ && $2 !~ /_/ { printf "%s \n", $2 }
' newjeans_analysis/DataStreamer.csv | sort | tee /dev/tty | wc -l )

echo "-------------------------------"
echo "Total nama: $count user"
