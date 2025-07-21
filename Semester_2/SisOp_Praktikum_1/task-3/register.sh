#!/bin/bash

while true; do
  read -p "username: " username

  if grep -q "^$username:" cloud_storage/users.txt; then
    massage="$(date '+%y/%m/%d %H:%M:%S') REGISTER: ERROR User already exists"
    echo -e "$massage\n"
    echo -e "$massage\n$(cat cloud_storage/cloud_log.txt)" > cloud_storage/cloud_log.txt
    continue
  else
    echo -e "Username valid!\n"
    break
  fi
done

while true; do
  read -p "password: " password
  passwordinvalid=""

  if [[ ${#password} -lt 8 ]]; then
    passwordinvalid="Password harus lebih dari 8 karakter" 
  elif [[ ! "$password" =~ [A-Z] ]]; then
    passwordinvalid="Password harus mengandung huruf kapital"
  elif [[ ! "$password" =~ [0-9] ]]; then
    passwordinvalid="Password harus mengandung angka"
  elif [[ ! "$password" =~ [[:punct:]] ]]; then
    passwordinvalid="Password harus mengandung karakter spesial"
   elif [[ "$password" == "$username" ]]; then
    passwordinvalid="Password tidak boleh sama dengan username"
  elif [[ "$password" =~ [sS][tT][oO][rR][aA][gG][eE] || "$password" =~ [cC][lL][oO][uU][dD] ]]; then
    passwordinvalid="Password tidak boleh mengandung kata cloud atau storage"
  fi  

  if [[ -n "$passwordinvalid" ]]; then
    massage="$(date '+%y/%m/%d %H:%M:%S') REGISTER: ERROR {$passwordinvalid}"
    echo -e "$massage\n"
    echo -e "$massage\n$(cat cloud_storage/cloud_log.txt)" > cloud_storage/cloud_log.txt
    continue  
  fi
  break 
done

if [[ -z "$passwordinvalid" ]]; then
  massage="$(date '+%y/%m/%d %H:%M:%S') REGISTER: INFO $username registered successfully"
  echo -e "Password valid!"
  echo -e "$massage"
  echo -e "$massage\n$(cat cloud_storage/cloud_log.txt)" > cloud_storage/cloud_log.txt
  echo "$username:$password" >> cloud_storage/users.txt
else
  echo "unexpected error"
fi
