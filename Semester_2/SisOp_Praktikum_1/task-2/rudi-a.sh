#!/bin/bash

awk -F' ' '{
	countIP[$1]++
	countSC[$9]++
}
END {
	print "Total request masing-masing IP: "
	for(IP in countIP) {
		print IP, countIP[IP]
	}
	print "Jumlah dari masing masing status code: "
	for(SC in countSC) {
		print SC, countSC[SC]
	}
}' access.log
