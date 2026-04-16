#!/bin/bash

# GAME ASSET MANAGER - CLI TOOL
# Script ini berfungsi untuk mengelola aset game dan
# menjaga sinkronisasi antara folder assets/ dan database
# metadata.csv.
#
# Fitur utama:
# 1. SYNC    : Sinkronisasi folder assets dengan metadata
# 2. LIST    : Menampilkan isi database
# 3. STATS   : Statistik aset
# 4. CREATE  : Membuat file dummy asset
# 5. DELETE  : Menghapus asset
#
# Semua aktivitas dicatat pada activity.log

# KONFIGURASI PATH
ASSET_DIR="assets"  # Folder tempat asset fisik disimpan
DB="metadata.csv"   # Database metadata
LOG="activity.log"  # File log aktivitas
CRONFILE="crontabs" # File untuk menyimpan konfigurasi cronjob

# FUNGSI TIMESTAMP
# Menghasilkan timestamp dengan format:
# YYYY-MM-DD HH:MM:SS
timestamp() {
    date "+%Y-%m-%d %H:%M:%S"
}

# FUNGSI LOGGING
# Digunakan untuk mencatat aktivitas ke activity.log
#
# Parameter:
# $1 : LEVEL  (INFO / ERROR)
# $2 : COMMAND (SYNC, LIST, CREATE, dll)
# $3 : Pesan log
#
# Format log:
# [YYYY-MM-DD HH:MM:SS] [LEVEL] [COMMAND] message
log() {
    echo "[$(timestamp)] [$1] [$2] $3" >> "$LOG"
}

# FUNGSI CHECK_SYSTEM
# Memastikan komponen utama tersedia:
#
# - folder assets/
# - file metadata.csv
# - file activity.log
#
# Jika salah satu tidak ada maka sistem akan berhenti
# dan mencatat error ke log.
check_system() {
    if [[ ! -d "$ASSET_DIR" || ! -f "$DB" || ! -f "$LOG" ]]; then
        log "ERROR" "SYSTEM" "Missing components (assets/, metadata.csv, or activity.log)"
        exit 1
    fi
}

# FUNGSI SYNC_ASSETS
#
# Tujuan:
# Menjaga sinkronisasi antara folder assets dan metadata.csv
#
# Proses:
# 1. Detect new files
#    - File ada di assets tapi tidak ada di metadata
#    - Akan ditambahkan otomatis ke database
#
# 2. Cleanup missing files
#    - Metadata ada tetapi file fisik tidak ada
#    - Metadata akan dihapus
sync_assets() {
    check_system

    # DETECT NEW FILES
    for file in "$ASSET_DIR"/*; do
        # Skip jika bukan file
        [[ -f "$file" ]] || continue

        # Ambil nama file tanpa path
        name=$(basename "$file")

        # Cek apakah file sudah ada di database
        if ! grep -q "^$name," "$DB"; then
            # Ambil ukuran file dalam bytes
            size=$(stat -c%s "$file")

            # Ambil ekstensi file
            ext="${name##*.}"

            # Timestamp pembuatan metadata
            created=$(date "+%Y-%m-%d_%H:%M:%S")

            # Tambahkan metadata baru
            echo "$name,$size,$ext,$created" >> "$DB"

            # Catat log
            log "INFO" "SYNC" "Added new file $name"
        fi
    done

    # CLEAN UP MISSING FILES
    # Membaca metadata.csv baris per baris
    while IFS=, read -r filename size ext created
    do
        # Jika file tidak ada di folder assets
        if [[ ! -f "$ASSET_DIR/$filename" ]]; then
            # Hapus metadata file tersebut
            grep -v "^$filename," "$DB" > temp && mv temp "$DB"

            # Catat log
            log "INFO" "SYNC" "Removed missing file $filename from database"
        fi
    done < "$DB"
}

# FUNGSI LIST_ASSETS
#
# Menampilkan isi metadata.csv dalam bentuk tabel.
#
# Fitur:
# --sort=name
# --sort=size
# --ext=<extension>
list_assets() {
    check_system

    # Membaca seluruh database
    data=$(cat "$DB")
    ext_filter=""
    sort_mode=""

    # Parsing argument
    for arg in "$@"
    do
        case $arg in
            --sort=name)
            sort_mode="name"
            ;;
            --sort=size)
            sort_mode="size"
            ;;
            --ext=*)
            ext_filter="${arg#*=}"
            ;;
        esac
    done

    # FILTER EXTENSION
    if [[ "$ext_filter" != "" ]]; then
        data=$(echo "$data" | awk -F',' -v ext="$ext_filter" '$3==ext')
    fi

    # SORTING
    if [[ "$sort_mode" == "name" ]]; then
        data=$(echo "$data" | sort -t',' -k1)
    elif [[ "$sort_mode" == "size" ]]; then
        data=$(echo "$data" | sort -t',' -k2 -n)

    fi

    # HANDLE EMPTY RESULT
    if [[ -z "$data" ]]; then
        log "INFO" "LIST" "Query returned empty result"
        echo "No result"
        exit
    fi

    # PRINT TABLE
    printf "%-20s %-10s %-10s %-20s\n" "FILENAME" "SIZE" "EXT" "CREATED"
    echo "$data" | awk -F',' '{printf "%-20s %-10s %-10s %-20s\n",$1,$2,$3,$4}'

    log "INFO" "LIST" "Displayed database content"
}

# FUNGSI STATS_ASSETS
#
# Menampilkan statistik aset:
# - total file
# - total size
# - average size
# - largest asset
# - smallest asset
# - jumlah file berdasarkan ekstensi
stats_assets() {
    check_system

    # Jika database kosong
    if [[ ! -s "$DB" ]]; then
        log "INFO" "STATS" "Accessed empty database"
        echo "Database empty"
        exit
    fi

    # Total file
    total=$(wc -l < "$DB")

    # Total ukuran file
    total_size=$(awk -F',' '{sum+=$2} END{print sum}' "$DB")

    # Rata-rata ukuran
    avg=$((total_size/total))

    # Asset terbesar
    largest=$(sort -t',' -k2 -nr "$DB" | head -n1)

    # Asset terkecil
    smallest=$(sort -t',' -k2 -n "$DB" | head -n1)

    echo "Total assets: $total"
    echo "Total size: $total_size bytes"
    echo "Average size: $avg bytes"

    echo
    echo "Largest asset:"
    echo "$largest"

    echo
    echo "Smallest asset:"
    echo "$smallest"

    echo
    echo "Files by extension:"
    awk -F',' '{count[$3]++} END {for (e in count) print e, count[e]}' "$DB"

    log "INFO" "STATS" "Generated statistics"
}

# FUNGSI CREATE_ASSET
#
# Membuat file dummy di folder assets
# dan otomatis menambahkan metadata.
#
# Command:
# ./script.sh create <filename> <size>
create_asset() {
    check_system

    filename=$1
    size=$2

    # Validasi argumen
    if [[ -z "$filename" || -z "$size" ]]; then
        log "ERROR" "CREATE" "Missing arguments"
        exit
    fi

    # Validasi size harus angka
    if ! [[ "$size" =~ ^[0-9]+$ ]]; then
        log "ERROR" "CREATE" "Invalid size: $size"
        exit
    fi

    # Cek apakah file sudah ada
    if [[ -f "$ASSET_DIR/$filename" ]]; then
        log "ERROR" "CREATE" "File $filename already exists"
        exit
    fi

    # Membuat file dummy
    dd if=/dev/zero of="$ASSET_DIR/$filename" bs=1 count="$size" &>/dev/null

    # Ambil ekstensi file
    ext="${filename##*.}"

    # Timestamp metadata
    created=$(date "+%Y-%m-%d_%H:%M:%S")

    # Tambahkan metadata
    echo "$filename,$size,$ext,$created" >> "$DB"

    log "INFO" "CREATE" "Created file $filename ($size bytes)"
}

# FUNGSI DELETE_ASSET
#
# Menghapus file dari folder assets
# dan menghapus metadata dari database.
#
# Command:
# ./script.sh delete <filename>
delete_asset() {
    check_system

    filename=$1

    # Validasi input
    if [[ -z "$filename" ]]; then
        log "ERROR" "DELETE" "No filename provided"
        exit
    fi

    # Jika file tidak ditemukan
    if [[ ! -f "$ASSET_DIR/$filename" ]]; then
        log "ERROR" "DELETE" "$filename not found"
        exit
    fi

    # Hapus file
    rm "$ASSET_DIR/$filename"

    # Hapus metadata
    grep -v "^$filename," "$DB" > temp && mv temp "$DB"

    log "INFO" "DELETE" "Deleted $filename"
}

# MAIN PROGRAM
#
# Mengatur command CLI:
# ./script.sh sync
# ./script.sh autosync
# ./script.sh list
# ./script.sh stats
# ./script.sh create
# ./script.sh delete
case "$1" in
    sync)
        sync_assets
        ;;
    autosync)
        install_autosync
        ;;
    list)
        shift
        list_assets "$@"
        ;;
    stats)
        stats_assets
        ;;
    create)
        create_asset "$2" "$3"
        ;;
    delete)
        delete_asset "$2"
        ;;
    *)
        echo "Usage:"
        echo "./script.sh sync"
        echo "./script.sh autosync"
        echo "./script.sh list [--sort=name|size] [--ext=ext]"
        echo "./script.sh stats"
        echo "./script.sh create <filename> <size>"
        echo "./script.sh delete <filename>"
        ;;
esac
