# Proxy Terbaik di New Eridu

Belle dan Wise adalah Proxy dengan nama Phaethon di Kota New Eridu yang menyamar sebagai warga biasa dengan membuka Toko Video di Sixth Street. Suatu hari, Wise meminta Belle untuk memantau setiap server yang berjalan di PC mereka karena biaya listrik bulanan yang tinggi. Karena Belle terlalu sibuk mengelola Toko Video, ia meminta bantuan kalian (Proxy yang Hebat) untuk membuat program monitoring ini.

Buatlah program untuk memantau sumber daya pada setiap server. Program ini hanya perlu memantau:

- **Penggunaan RAM** menggunakan perintah `free -m`.
- **Ukuran suatu direktori** menggunakan perintah `du -sh <target_path>`.
- **Uptime** menggunakan perintah `uptime` dan ambil bagian yang menunjukkan waktu berjalan.
- **Load average** menggunakan perintah `cat /proc/loadavg` dan ambil tiga nilai pertama (1, 5, dan 15 menit).

Catat semua metrics yang diperoleh dari hasil `free -m`. Untuk hasil `du -sh <target_path>`, catat ukuran dari path direktori tersebut. Direktori yang akan dipantau adalah `/home/{user}/`.

**Persyaratan**

- **Masukkan semua metrics** ke dalam sebuah file log bernama `metrics_{YmdHms}.log`. `{YmdHms}` adalah waktu saat script Bash dijalankan. Contoh: jika dijalankan pada `2025-03-17 19:00:00`, maka file log yang akan dibuat adalah `metrics_20250317190000.log`.

- Script untuk **mencatat metrics** di atas harus berjalan secara otomatis **setiap 5 menit**.

- Kemudian, buat satu script untuk membuat **aggregasi** file log ke satuan jam. Script agregasi akan memiliki info dari file-file yang tergenerate tiap menit. Dalam hasil file aggregasi tersebut, terdapat nilai **minimum, maximum, dan rata-rata** dari tiap-tiap metrics. File aggregasi akan ditrigger untuk dijalankan setiap jam secara otomatis. Berikut contoh nama file hasil aggregasi. Script agregasi akan dijalankan secara otomatis setiap jam. Contoh nama file hasil agregasi adalah `metrics_agg_2025031719.log` dengan format `metrics_agg_{YmdH}.log`.

- Buat script untuk memantau **uptime dan load average server** setiap jam dan menyimpannya dalam file log bernama `uptime_{YmdH}.log`. Uptime harus diambil dari output perintah uptime, sedangkan load average diambil dari `cat /proc/loadavg`.

- Terakhir, untuk menghemat storage, buatlah script untuk **menghapus** file log agregasi yang lebih lama dari **12 jam pertama** setiap hari. Script ini harus dijalankan setiap hari pada pukul 00:00.

- Karena file log bersifat sensitif, pastikan semua file log hanya dapat dibaca oleh **pemilik file**.

**Nama File Script**

| No  | Nama File Script      | Fungsi                                               |
| --- | --------------------- | ---------------------------------------------------- |
| 1   | `minute5_log.sh`      | Script pencatatan metrics setiap 5 menit             |
| 2   | `agg_5min_to_hour.sh` | Script agregasi log per jam                          |
| 3   | `uptime_monitor.sh`   | Script monitoring uptime dan load average setiap jam |
| 4   | `cleanup_log.sh`      | Script penghapusan log lama setiap hari              |

**Lokasi Penyimpanan Log**

Semua file log disimpan di `/home/{user}/metrics`.

**Format Log**

1. **Log Per 5 Menit (`metrics_{YmdHms}.log`)**

   ```
   mem_total,mem_used,mem_free,mem_shared,mem_buff,mem_available,swap_total,swap_used,swap_free,path,path_size
   15949,10067,308,588,5573,4974,2047,43,2004,/home/$USER/test/,74M
   ```

2. **Log Agregasi Per Jam (`metrics_agg_{YmdH}.log`)**

   ```
   type,mem_total,mem_used,mem_free,mem_shared,mem_buff,mem_available,swap_total,swap_used,swap_free,path,path_size
   minimum,15949,10067,223,588,5339,4626,2047,43,1995,/home/$USER/test/,50M
   maximum,15949,10387,308,622,5573,4974,2047,52,2004,/home/$USER/test/,74M
   average,15949,10227,265.5,605,5456,4800,2047,47.5,1999.5,/home/$USER/test/,62M
   ```

3. **Log Uptime Per Jam (`uptime_{YmdH}.log`)**

   ```
   uptime,load_avg_1min,load_avg_5min,load_avg_15min
   17:29:06  up  2:41,0.17,0.12,0.10
   ```

**Contoh Log yang Akan Dihapus pada 2025-03-18 Pukul 00:00**

```
metrics_agg_2025031700.log
metrics_agg_2025031701.log
metrics_agg_2025031702.log
metrics_agg_2025031703.log
metrics_agg_2025031704.log
metrics_agg_2025031705.log
metrics_agg_2025031706.log
metrics_agg_2025031707.log
metrics_agg_2025031708.log
metrics_agg_2025031709.log
metrics_agg_2025031710.log
metrics_agg_2025031711.log
metrics_agg_2025031712.log
```

**Konfigurasi Cron**

Konfigurasi cron untuk menjalankan script ini disimpan dalam file **crontabs**.

Dengan mengikuti instruksi di atas, kalian akan membantu Belle dan Wise dalam mengelola penggunaan sumber daya server mereka dan mengoptimalkan biaya listrik yang digunakan!

---

# Best Proxy in New Eridu

Belle and Wise are Proxies with the name Phaethon in New Eridu City who disguise themselves as ordinary citizens by opening a Video Store on Sixth Street. One day, Wise asked Belle to monitor every server running on their PC because of the high monthly electricity costs. Because Belle is too busy managing the Video Store, she asks for your help (Great Proxy) to create this monitoring program.

Create a program to monitor system resources on each server. This program should monitor RAM usage, the size of a directory, server uptime, and server load average.

- **RAM usage** using the `free -m` command.
- **Size of a directory** using the `du -sh <target_path>` command.
- **Uptime** using the `uptime` command and take the part that shows the running time.
- **Load average** using the `cat /proc/loadavg` command and take the first three values (1, 5, and 15 minutes).

Record all metrics obtained from the `free -m` results. For the `du -sh <target_path>` results, record the size of the directory path. The directory to be monitored is `/home/{user}/`.

**Requirements**

- **Store all metrics** into a log file named `metrics_{YmdHms}.log`. `{YmdHms}` is the time when the Bash script is executed. For example: if executed at `2025-03-17 19:00:00`, the log file created will be `metrics_20250317190000.log`.

- The script to **record the metrics** above must run automatically **every 5 minutes**.

- Then, create a script to **aggregate** log files to the hour unit. The aggregation script will have info from the files generated every minute. In the resulting aggregation file, there are **minimum, maximum, and average** values of each metric. The aggregation file will be triggered to run every hour automatically. Here is an example of the resulting aggregation file name. The aggregation script will run automatically every hour. An example of the resulting aggregation file name is `metrics_agg_2025031719.log` with the format `metrics_agg_{YmdH}.log`.

- Create a script to monitor **server uptime and load average** every hour and save it in a log file named `uptime_{YmdH}.log`. Uptime must be taken from the output of the uptime command, while the load average is taken from `cat /proc/loadavg`.

- Finally, to save storage, create a script to **delete** aggregation log files older than the **first 12 hours** every day. This script must run every day at 00:00.

- Because log files are sensitive, make sure all log files can only be read by the **file owner**.

**File Script Name**

| No  | Script File Name      | Function                                                 |
| --- | --------------------- | -------------------------------------------------------- |
| 1   | `minute5_log.sh`      | Script for recording metrics every 5 minutes             |
| 2   | `agg_5min_to_hour.sh` | Script for aggregating logs per hour                     |
| 3   | `uptime_monitor.sh`   | Script for monitoring uptime and load average every hour |
| 4   | `cleanup_log.sh`      | Script for deleting old logs every day                   |

**Log Storage Location**

All log files are stored in `/home/{user}/metrics`.

**Log Format**

1. **Log Per 5 Minutes (`metrics_{YmdHms}.log`)**

   ```
   mem_total,mem_used,mem_free,mem_shared,mem_buff,mem_available,swap_total,swap_used,swap_free,path,path_size
   15949,10067,308,588,5573,4974,2047,43,2004,/home/$USER/test/,74M
   ```

2. **Log Aggregation Per Hour (`metrics_agg_{YmdH}.log`)**

   ```
   type,mem_total,mem_used,mem_free,mem_shared,mem_buff,mem_available,swap_total,swap_used,swap_free,path,path_size
   minimum,15949,10067,223,588,5339,4626,2047,43,1995,/home/$USER/test/,50M
   maximum,15949,10387,308,622,5573,4974,2047,52,2004,/home/$USER/test/,74M
   average,15949,10227,265.5,605,5456,4800,2047,47.5,1999.5,/home/$USER/test/,62M
   ```

3. **Uptime Log Per Hour (`uptime_{YmdH}.log`)**

   ```
   uptime,load_avg_1min,load_avg_5min,load_avg_15min
   17:29:06  up  2:41,0.17,0.12,0.10
   ```

**Example of Logs to be Deleted on 2025-03-18 at 00:00**

```
metrics_agg_2025031700.log
metrics_agg_2025031701.log
metrics_agg_2025031702.log
metrics_agg_2025031703.log
metrics_agg_2025031704.log
metrics_agg_2025031705.log
metrics_agg_2025031706.log
metrics_agg_2025031707.log
metrics_agg_2025031708.log
metrics_agg_2025031709.log
metrics_agg_2025031710.log
metrics_agg_2025031711.log
metrics_agg_2025031712.log
```

**Cron Configuration**

The cron configuration to run this script is stored in the **crontabs** file.

By following the instructions above, you will help Belle and Wise in managing the use of their server resources and optimizing the electricity costs they use!
