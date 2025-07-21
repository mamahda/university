#!/bin/bash

dir="/home/blackcurrent/Kuliah_Semester_2/SisOp_Praktikum_1/task-3/cloud_storage"

link=("https://ugm.ac.id/wp-content/uploads/2021/12/09122116390430331217170805.jpg" "https://res-1.cloudinary.com/jnto/image/upload/w_750,h_1100,c_fill,f_auto,fl_lossy,q_auto/v1/media/filer_public/b4/df/b4df55a0-8e8a-446f-b93f-3ecbdba0b9af/image2_wvwrvh" "https://ik.imagekit.io/tvlk/blog/2020/01/keindahan-alam-indonesia-1-Wikipedia-scaled.jpg?tr=q-70,c-at_max,w-500,h-300,dpr-2" "https://i.pinimg.com/originals/2b/25/36/2b2536b030d93426eac7db88abadcfc8.jpg" "https://www.suarakalbar.co.id/wp-content/uploads/2023/12/IMG_20231205_021419.jpg")

username=$(awk -F" " '$3 ~ "AUTOMATION:" && $5 !~ "executing" {print $5}' "$dir/cloud_log.txt" | head -n 1)

if [[ "$username" == "no" ]]; then
  massage="$(date '+%y/%m/%d %H:%M:%S') DOWNLOAD: ERROR no user active"
  echo "$massage"
  echo -e "$massage\n$(cat $dir/cloud_log.txt)" > $dir/cloud_log.txt
  exit 1
fi

massage="$(date '+%y/%m/%d %H:%M:%S') DOWNLOAD: INFO user active found, begin downloading.."
echo "$massage"
echo -e "$massage\n$(cat $dir/cloud_log.txt)" > $dir/cloud_log.txt

mkdir -p "$dir/downloads/$username"

date=$(date '+%H-%M_%d-%m-%Y')

random=$(shuf -i 0-4 -n 1)
curl -s -l "${link[$random]}" -o "$dir/downloads/$username/$date.jpg"

zipname="$dir/downloads/$username/$date.zip"

cd "$dir/downloads/$username"
zip -q -r "$zipname" *.jpg
cd "$dir"
cd ..

if [[ ! -f  "$zipname" ]]; then
  massage="$(date '+%y/%m/%d %H:%M:%S') DOWNLOAD: ERROR failed to download image"
  echo "$massage"
  echo -e "$massage\n$(cat $dir/cloud_log.txt)" > $dir/cloud_log.txt
  exit 1
fi

massage="$(date '+%y/%m/%d %H:%M:%S') DOWNLOAD: INFO image downloaded successfully"
echo "$massage"
echo -e "$massage\n$(cat $dir/cloud_log.txt)" > $dir/cloud_log.txt

rm -rf "$dir"/downloads/"$username"/*.jpg
