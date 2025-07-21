#!/bin/bash

read maxlagu < <(awk -F, '
  BEGIN { max = 0 }  
  NR > 1 && $2 ~ /[0-9]/ { lagu[$3]++ }  
  END {
    for (i in lagu) {
      if (lagu[i] > max) {
        max = lagu[i];
        maxlagu = i;
      }
    }
    print maxlagu; 
  }' newjeans_analysis/DataStreamer.csv
)

read album tahunrilis < <(awk -F, -v lagu="$maxlagu" '
 $2 == lagu { gsub(/ /, "_", $1); print $1, $3 }
' newjeans_analysis/AlbumDetails.csv)

album=$(echo "$album" | sed 's/_/ /g')

echo "Lagu yang paling sering diputar    : $maxlagu"
echo "Lagu $maxlagu berasal dari album     : $album"
echo "Album $album dirilis pada tahun : $tahunrilis"
