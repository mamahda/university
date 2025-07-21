#!/bin/bash

awk -F'[, ]' '
NR==FNR {
    if(NR > 1) {
        user[$1][$2]=$3
    }
    next
}

{
    if($9 == 500) {
        split($1, ip, ".")
        
        split($4, timeStamp, ":")
        gsub(/\[/, "", timeStamp[1])

        split(timeStamp[1], tanggal, "/")

        bulanNum["Jan"] = "01"; bulanNum["Feb"] = "02"; bulanNum["Mar"] = "03";
        bulanNum["Apr"] = "04"; bulanNum["May"] = "05"; bulanNum["Jun"] = "06";
        bulanNum["Jul"] = "07"; bulanNum["Aug"] = "08"; bulanNum["Sep"] = "09";
        bulanNum["Oct"] = "10"; bulanNum["Nov"] = "11"; bulanNum["Dec"] = "12";

        tanggalFormatted=bulanNum[tanggal[2]] "/" tanggal[1] "/" tanggal[3]

        if (tanggalFormatted in user && ip[4] in user[tanggalFormatted]) {
            print user[tanggalFormatted][ip[4]]
        }

    }
}' peminjaman_computer.csv access.log | sort | uniq -c | sort -r | head -1 | awk -F' ' '{print "Paling banyak: " $2 "\nError 500 sebanyak: " $1}'
