#!/bin/bash

FILE="storage/matchResult.csv"

teams=(
"RealMadrid" "Barcelona" "AtleticoMadrid" "ManchesterCity" "Liverpool"
"Arsenal" "Chelsea" "ManchesterUnited" "BayernMunich" "Dortmund"
"RBLeipzig" "Juventus" "InterMilan" "ACMilan" "Napoli"
"PSG" "Monaco" "Benfica" "Porto" "Ajax"
"Atalanta" "Sevilla" "Tottenham" "Leverkusen"
)

team1=${teams[$RANDOM % ${#teams[@]}]}
team2=${teams[$RANDOM % ${#teams[@]}]}

while [ "$team1" = "$team2" ]; do
team2=${teams[$RANDOM % ${#teams[@]}]}
done

goalTeam1=$((RANDOM % 5))
goalTeam2=$((RANDOM % 5))

totalShotsTeam1=$((RANDOM % 15 + 5))
totalShotsTeam2=$((RANDOM % 15 + 5))

if [ $goalTeam1 -gt $goalTeam2 ]; then
winner=$team1
elif [ $goalTeam2 -gt $goalTeam1 ]; then
winner=$team2
else
winner="Draw"
fi

echo "$team1,$team2,$goalTeam1,$goalTeam2,$totalShotsTeam1,$totalShotsTeam2,$winner" >> "$FILE"