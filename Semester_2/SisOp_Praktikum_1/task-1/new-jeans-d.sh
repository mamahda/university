#!/bin/bash

awk -F, '
  BEGIN {
    maxcount = 0;
    maxtime = 0;
    maxloyalty = 0;
    devicecount = "";
    devicetime = "";
    deviceloyal = "";
    print "Device       User    treamtime";
    print "------------------------------------";
  } 
  NR > 1 {
    gsub(/\r/, "", $7);
    device[$7] += 1;
    streamtime[$7] += $4;
  } 
  END {
    for (i in device) {
      printf "%-8s %8d %11d detik\n", i, device[i], streamtime[i];
      loyalty = streamtime[i] / device[i];

      if (device[i] > maxcount) {
        maxcount = device[i];
        devicecount = i;
      }
      if (streamtime[i] > maxtime) {
        maxtime = streamtime[i];
        devicetime = i;
      }
      if (loyalty > maxloyalty) {
        maxloyalty = loyalty;
        deviceloyal = i;
      }
    }
    print "------------------------------------";
    printf "user terbanyak          : %s (%d user)\n", devicecount, maxcount;
    printf "total streaming terlama : %s (%d detik)\n", devicetime, maxtime;
    printf "loyalitas tertinggi     : %s (%.2f detik/user)\n", deviceloyal, maxloyalty;
  }
' newjeans_analysis/DataStreamer.csv
