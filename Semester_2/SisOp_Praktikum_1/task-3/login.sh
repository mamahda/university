#!/bin/bash

login() {
  status=$(awk '($3 ~ "LOGIN:" || $3 ~ "LOGOUT:") && $4 !~ "ERROR" {print $3, $6}' cloud_storage/cloud_log.txt | head -n 1)
  action=$(echo "$status" | awk '{print $1}')
  user=$(echo "$status" | awk '{print $2}')

  if [[ "$action" == "LOGIN:" ]]; then
    massage="$(date '+%y/%m/%d %H:%M:%S') LOGIN: ERROR User $user already logged in"
    echo -e "$massage"
    echo -e "$massage\n$(cat cloud_storage/cloud_log.txt)" > cloud_storage/cloud_log.txt
    exit 1
  fi

  read -p "Masukkan username: " username
  read -s -p "Masukkan password: " password
  if grep -q "$username:$password" cloud_storage/users.txt; then
    massage="$(date '+%y/%m/%d %H:%M:%S') LOGIN: INFO User $username logged in"
    echo -e "$massage\n"
    echo -e "$massage\n$(cat cloud_storage/cloud_log.txt)" > cloud_storage/cloud_log.txt
  else
    massage="$(date '+%y/%m/%d %H:%M:%S') LOGIN: ERROR Failed login attempt on user $username"
    echo -e "$massage\n"
    echo -e "$massage\n$(cat cloud_storage/cloud_log.txt)" > cloud_storage/cloud_log.txt
  fi
}

logout(){
  status=$(awk '($3 ~ "LOGIN:" || $3 ~ "LOGOUT:") && $4 !~ "ERROR" {print $3, $6}' cloud_storage/cloud_log.txt | head -n 1)
  action=$(echo "$status" | awk '{print $1}')
  user=$(echo "$status" | awk '{print $2}')

  if [[ "$action" == "LOGOUT:" ]]; then
    massage="$(date '+%y/%m/%d %H:%M:%S') LOGOUT: ERROR User $user already logged out"
    echo -e "$massage"
    echo -e "$massage\n$(cat cloud_storage/cloud_log.txt)" > cloud_storage/cloud_log.txt
    exit 1
  fi

  read -p "Masukkan username: " username
  if [[ "$username" == "$user" ]]; then
    massage="$(date '+%y/%m/%d %H:%M:%S') LOGOUT: INFO User $username logged out"
    echo -e "$massage\n"
    echo -e "$massage\n$(cat cloud_storage/cloud_log.txt)" > cloud_storage/cloud_log.txt
  else
    massage="$(date '+%y/%m/%d %H:%M:%S') LOGOUT: ERROR Failed logout attempt on user $username"
    echo -e "$massage\n"
    echo -e "$massage\n$(cat cloud_storage/cloud_log.txt)" > cloud_storage/cloud_log.txt
  fi
}

echo -e "1. Login\n2. Logout"
read -p "Pilih: " pilih
if [[ "$pilih" == "1" ]]; then
  login
elif [[ "$pilih" == "2" ]]; then
  logout
else
  echo "Pilihan tidak valid"
  exit 1
fi
