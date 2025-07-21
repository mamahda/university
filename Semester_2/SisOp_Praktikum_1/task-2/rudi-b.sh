#!/bin/bash

read -p "MM/DD/YYYY :" tanggal
read -p "192.168.1.X :" IPaddress

IPlast=$(cut -d '.' -f 4 <<< "$IPaddress")
nama=$(grep -E "^$tanggal,$IPlast," peminjaman_computer.csv | cut -d ',' -f 3)

if [ -n "$nama" ]; then
	echo "Pengguna saat itu adalah $nama"
	echo "Log Aktivitas $nama"

	tanggalTr=$(tr -d / <<< "$tanggal")
	currentTime=$(date +%H%M%S)
	dir="./backup"
	fileLoc="./${dir}/${nama}_${tanggalTr}_${currentTime}.log"

	mkdir -p "$dir"

	DDMonthYYYY=$(date -d ${tanggal} "+%d/%b/%Y")
	DDMMYYYY=$(date -d ${tanggal} "+%d/%m/%Y")

	(grep -E "^$IPaddress" access.log | grep -E "$DDMonthYYYY" | awk -F' ' -v t="$DDMMYYYY" '{
		sub(/^[^:]+:/, "", $4)
		print "[" t ":" $4 "]: " $6 " " $7 " " $8 " " $9
	}') >> "$fileLoc"

	# cat "$fileLoc"
	
else
	echo "Data yang kamu cari tidak ada"
fi
