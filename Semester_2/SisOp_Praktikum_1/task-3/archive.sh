#!/bin/bash

dir="/home/blackcurrent/Kuliah_Semester_2/SisOp_Praktikum_1/task-3/cloud_storage"

for user in "$dir/downloads/"*; do
  if [[ -d "$user" ]]; then
    username=$(basename "$user")

    mkdir -p "$dir/archives/$username"

    date="archive_$(date '+%H-%d-%m-%Y')"
    zipname="$dir/archives/$username/$date.zip"

    cd "$user"
    zip -q -r "$zipname" *
    cd "$dir"
    cd ..

    if [[ ! -f "$zipname" ]]; then
      message="$(date '+%y/%m/%d %H:%M:%S') ARCHIVE: ERROR failed to archive files for $username"
      echo "$message"
      echo -e "$message\n$(cat $dir/cloud_log.txt)" > "$dir/cloud_log.txt"
      continue
    fi

    message="$(date '+%y/%m/%d %H:%M:%S') ARCHIVE: INFO files for $username archived successfully"
    echo "$message"
    echo -e "$message\n$(cat $dir/cloud_log.txt)" > "$dir/cloud_log.txt"

    rm -rf "$user"/*.jpg
  fi
done

