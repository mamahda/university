runc merupakan low level container runtime

spec: untuk membuat spec dalam config.json runc spec

edit config.json:

process sh, -c, while true;do sleep 1000;done

userid --> 0 adalah root

groupid

terminal --> false, agar container bisa didetach

rootfs : readonly --> false agar bisa ditulisi

bydefault direktori rootfs harus disiapkan

untuk mempersiapkan rootfs dapat mengekstrak dari container yang ada di docker hub

#mkdir -p rootfs #docker export $(docker run -d alpine:3.18) | tar -C rootfs -xv

run container

runc run -d
show container list

runc list
exec dengan user tertentu

runc exec -t --user 1000:1000 /bin/sh jika tanpa --user makan akan menggunakan default yang ada di config.json
mematikan proses

runc kill KILL
menghapus container

runc delete
