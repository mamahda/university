#!/bin/zsh
#! 1
#! a,b
echo "Data proposal PKM yang memiliki judul lebih dari 20 kata"
echo "--------------------------------------------------------"
awk -F '\t' 'NR>1 {gsub(/_/, " ", $2); split($5, word, " "); if(length(word) > 20) print $1, $2, $7}' DataPKM.tsv
#! c
echo "\nData mahasiswa yang memiliki lebih dari satu judul proposal"
echo "-----------------------------------------------------------"
awk -F '\t' 'NR>1 {gsub(/_/, " ", $2); count[$2]++; pembimbing[$2] = (pembimbing[$2]) ? substr(pembimbing[$2], 1, length(pembimbing[$2])-1) ", " $6 : $6} END {for(mhs in count) if (count[mhs] > 1) print "Mahasiswa: " mhs, "\nJumlah Ajuan Proposal: " count[mhs] "\nPembimbing: " pembimbing[mhs]}' DataPKM.tsv
