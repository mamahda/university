#!/bin/bash

read max maxlagu < <(awk -F, '
  BEGIN {
    max = 0;
    maxlagu = "";
  }
  NR > 1 && $2 ~ /[0-9]/ { lagu[$3]++ }
  END { for (i in lagu) print lagu[i], i }
  ' newjeans_analysis/DataStreamer.csv | sort -nr | head -n 1)

printf "Lagu yang paling banyak diputar : %s\n" "$maxlagu";
printf "Total streaming lagu %-10s : %d\n" "$maxlagu" "$max";

if [[ "$max" -ge 24 ]]; then
  echo "Keren, Minji! Kamu hebat <3!"
else
  echo "Maaf, Minji, total streamingnya tidak sesuai harapan :("
fi
