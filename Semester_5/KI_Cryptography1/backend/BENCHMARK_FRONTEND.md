# Benchmark backend: panduan menjalankan dan integrasi frontend

Dokumen ini adalah kontrak handoff untuk dashboard benchmark superadmin. Implementasi CLI: `backend/benchmark.py`. Kontrak TypeScript sudah diperbarui di `frontend/src/api/types.ts`; client yang dipakai tetap `apiClient.admin.getBenchmarks()`.

## 1. Menghasilkan pengukuran

Dari folder `backend`, setelah dependency backend terpasang:

```bash
python benchmark.py --csv data/benchmark-samples.csv
```

Tanpa `--database`, tujuan mengikuti `DATABASE_PATH` pada konfigurasi backend/.env, sehingga dashboard membaca database yang sama. Konfigurasi aplikasi tetap memerlukan `JWT_SECRET_KEY`. Kunci untuk benchmark dibuat sementara di RAM; skrip tidak memakai atau menyimpan ROOT_KEY aplikasi.

Untuk mencoba skrip dengan beban kecil dan database terpisah:

```bash
python benchmark.py --database data/benchmark-demo.db --sizes 100 1024 --repeats 30 --warmup 3 --csv data/benchmark-demo.csv
```

Ukuran pada `--sizes` adalah **byte**. Database terpisah tidak muncul di dashboard aplikasi kecuali aplikasi juga diarahkan ke database itu. Gunakan contoh pertama untuk mengisi dashboard.

Default pengukuran:

| Parameter | Nilai |
| --- | --- |
| Cipher | AES-256-CTR, DES-CTR, RC4-drop3072; ketiganya dengan HMAC-SHA256 |
| Ukuran | 100 B, 524288 B, 2097152 B, 5242880 B, 104857600 B |
| Warm-up | 3 per cipher dan ukuran; tidak disimpan |
| Pengulangan | 30 per cipher dan ukuran; CLI menolak nilai di bawah 30 |
| Urutan | Cipher digilir pada setiap pengulangan |
| Timer | `time.perf_counter_ns()` |
| Sumber | `controlled` |

Data acak disiapkan di RAM sebelum timer. Cipher diukur melalui modul kripto yang sama dengan aplikasi. Pengukuran `enc`/`dec` termasuk pembuatan objek cipher, transformasi data dan, untuk RC4, pembuangan 3072 byte awal. Tidak termasuk HMAC, pembangkitan kunci data, SQLite, CSV, jaringan, atau I/O file.

`hmac` mengukur pembuatan tag saat encrypt dan verifikasi tag saat decrypt. `wrap` mengukur pembungkusan kunci AES-GCM, termasuk pembuatan nonce pembungkus; bukan pembukaan kunci. Hash SHA-256 hasil decrypt diperiksa setelah timer berhenti. Manipulasi ciphertext, pemindahan konteks item, dan enkripsi ulang diperiksa sebelum rangkaian pengukuran.

Per ukuran dan cipher, 30 pengulangan menghasilkan `enc=30`, `dec=30`, `wrap=30`, dan `hmac=60` sampel. Total default: **2250 baris**. Seluruh run disimpan dalam satu transaksi setelah pengukuran berhasil; CSV berisi sampel mentah tanpa kunci, plaintext, atau ciphertext. Proses mengeluarkan JSON ringkas berisi `run_id` dan parameter pengujian. Angka untuk data kecil dapat dipengaruhi overhead timer; jangan menarik kesimpulan dari satu sampel.

Default video 100 MiB membutuhkan RAM beberapa kali ukuran input karena benchmark ini bekerja dengan bytes di RAM. Jangan menjalankan benchmark terkontrol sambil melakukan pengukuran live untuk kesimpulan kinerja; beban CPU benchmark dapat mengganggu hasil live.

## 2. Data live

Alur simpan/baca item otomatis mencatat waktu operasi yang benar-benar dijalankan ke `benchmark_runs`, dengan `source=live`. Pembacaan mengikuti cipher yang dipilih aplikasi; jumlah sampel dekripsi antar-cipher tidak selalu sama. Tidak ada sampel fiktif untuk operasi yang tidak dijalankan.

Run live dikelompokkan per proses server dan profil parameter kripto; restart menghasilkan run baru. Ciphertext AES lama dengan nonce 12 byte dan RC4 lama tetap bisa dibaca. RC4 baru memakai HMAC dan drop3072; RC4 lama tanpa HMAC tetap merupakan format legacy. Pengukuran legacy dipisahkan dari parameter baru melalui run berbeda dan tercantum dalam `env.parameters`.

## 3. Endpoint frontend

```http
GET /api/admin/benchmarks?source=controlled&operation=enc&run_id=<id>
```

Autentikasi: sesi role **superadmin**, cookie ikut dikirim (`credentials: include`). GET tidak memerlukan header CSRF. Tidak ada endpoint HTTP untuk memulai benchmark CPU berat; jalankan melalui CLI.

| Query | Opsional | Perilaku |
| --- | --- | --- |
| `source` | Ya | `controlled` atau `live`; default **controlled** |
| `operation` | Ya | `enc`, `dec`, `hmac`, `wrap`; jika kosong mengembalikan semua operasi |
| `run_id` | Ya | Run pada source tersebut; default run terbaru |

Data controlled dan live, run berbeda, serta lingkungan berbeda tidak digabung dalam satu statistik. `runs` selalu berisi daftar run untuk source terpilih, meskipun query operation hanya memilih satu operasi.

Contoh pemanggilan:

```ts
const result = await apiClient.admin.getBenchmarks({
  source: 'controlled',
  operation: 'enc',
  // run_id: selectedRunId, // hilangkan untuk run terbaru
})
```

Response tanpa data:

```json
{
  "run_id": null,
  "source": "controlled",
  "env": null,
  "rows": [],
  "runs": []
}
```

Response yang berisi data mengikuti interface berikut; definisi lengkap tersedia di `frontend/src/api/types.ts`:

```ts
interface BenchmarkResponse {
  run_id: string | null
  source: 'controlled' | 'live'
  env: BenchmarkEnv | null
  runs: { run_id: string; created_at: string; sample_count: number }[]
  rows: {
    cipher: 'aes' | 'des' | 'rc4'
    operation: 'enc' | 'dec' | 'hmac' | 'wrap'
    size_bytes: number
    n: number
    median_ns: number
    q1_ns: number
    q3_ns: number
    median_mb_s: number | null
    q1_mb_s: number | null
    q3_mb_s: number | null
    sufficient_samples: boolean
  }[]
}
```

`env` memuat CPU, dukungan AES-NI (`null` jika tidak dapat dideteksi), versi Python/PyCryptodome, OS, protokol pengukuran, serta parameter tiap cipher. Untuk controlled juga memuat `repeats`, `warmup`, dan `sizes_bytes`. AES menggunakan pemilihan akselerasi otomatis bawaan library; deteksi AES-NI menunjukkan kemampuan CPU. Run lama yang dibuat di luar skrip mungkin tidak mempunyai seluruh metadata ini.

## 4. Aturan tampilan dan satuan

- Grafik X: `size_bytes`, sebaiknya skala logaritmik. Warna/seri: `cipher`.
- Grafik throughput Y: `median_mb_s`. Rentang error bar: **`q1_mb_s` hingga `q3_mb_s`**.
- **MB/s memakai 1 MB = 1000000 byte.** Ukuran data default tertentu memakai kelipatan MiB (1048576 byte); label ukuran harus konsisten.
- Waktu ditampilkan sebagai mikrodetik dengan `median_ns / 1000`; rentang waktunya `q1_ns / 1000` sampai `q3_ns / 1000`.
- Kuartil dihitung dari sampel mentah dengan metode inclusive. Kuartil throughput dihitung dari throughput setiap sampel, bukan membalik kuartil durasi.
- `wrap` tidak memiliki throughput data yang bermakna: ketiga field MB/s **null**. Tampilkan durasi mikrodetik, bukan grafik MB/s.
- `sufficient_samples=false` berarti `n<30`; tampilkan penanda sampel belum cukup. Kuartil untuk satu sampel sama dengan sampelnya dan tidak menunjukkan keyakinan statistik.
- `sample_count` pada run adalah total seluruh operasi/ukuran/cipher, bukan jumlah pengulangan satu titik grafik. Gunakan `row.n` untuk setiap titik.
- Tidak ada data: tampilkan “Belum ada data benchmark”. Jika operation tidak mempunyai sampel, rows kosong walaupun env/run tersedia.
- Saat filter source berubah, hapus pilihan run_id lama. Isi dropdown dari `runs`, dan refetch setelah CLI selesai atau saat pengguna menekan refresh. Jangan menjumlahkan n antar-run secara manual.

## 5. Error

Error mengikuti envelope API `{error: {code, message, details?}}`.

| Status | Arti |
| --- | --- |
| 400 | Nilai query source/operation tidak valid |
| 401 | Belum login/sesi tidak valid |
| 403 | Bukan superadmin |
| 404 | run_id tidak ditemukan pada source terpilih |
| 409 | Satu run mempunyai metadata lingkungan yang tidak konsisten |

## 6. Batas cakupan

Implementasi ini mengukur fase kripto dan merekam sampel live, bukan durasi request HTTP lengkap, memori puncak proses, atau overhead SQLite/filesystem. Uji end-to-end HTTP dan memori puncak yang disebut PRD perlu dilakukan sebagai pengujian terpisah. Eksperimen mematikan AES-NI dan menonaktifkan garbage collector belum ditambahkan. Tampilan dashboard tidak dibuat dalam perubahan ini; API, client TypeScript, dan kontrak ini siap digunakan tim frontend.
