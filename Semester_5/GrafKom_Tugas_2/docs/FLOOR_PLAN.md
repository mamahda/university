# Tata Letak Scene

**Denah ini konseptual dan belum diukur.** Semua posisi dan ukuran di bawah adalah perkiraan dari foto dan keterangan tim. Nilainya dipusatkan di `INTERIOR_LAYOUT` (`src/models/interior/interior.js`), `WORKSPACE_LAYOUT` (`furniture.js`), `CAFE_LAYOUT` (`cafeCounter.js`), `EXHIBITION_LAYOUT` (`exhibition.js`), dan `TRAIN_CONFIG`, `MOTORCYCLE_CONFIG`, `ROBOT_CONFIG` di `src/models/exhibits/`.

## Denah (dilihat dari atas; X ke kanan, Z ke bawah = sisi fasad depan)

```text
        barat (-X)                                              timur (+X)
 z=-5.7 ┌────────────────────────────────────────────────────────────────┐
        │ kafe (konter, kulkas, rak)   meja utara   │ motor listrik     ┌─┤
        │ ▒▒▒▒▒▒▒                       ▭ ▭         │ [platform]        │K│
        │ ▒ konter ▒         ▭▭ meja tengah         │                   │E│
 z=0    ┤ pintu samping     ▭▭                       │                   │R│
        │ mural (dinding barat)                      │ lengan robot      │E│
        │ sofa    ▭ ▭ ▭ meja selatan                 │ [platform]        │T│
 z=+5.7 └──────────────────────────┬─────────────────┴───────────────────┴─┘
                                   pintu masuk (x = 0, fasad depan z = +6)
```

Dinding dalam: x = ±11,95 dan z = ±5,7 (tebal dinding 0,3 m, perkiraan). Lantai di y = 0,6 (tinggi alas gedung); plafon di y = 6,6 (perkiraan, di bawah tepi atap 7,2 m).

## Bukti dan asumsi

| Elemen | Dasar | Status |
|---|---|---|
| Ruang memanjang dengan jendela di kedua sisi, plafon tinggi dengan balok, lampu rel hitam, lantai kayu gelap | `interior-lorong-ruang-kerja`, `interior-ruang-kerja-mural` | Terlihat di foto; ukuran perkiraan |
| Jendela bawah berteralis dan deret jendela atas di kedua dinding panjang | Foto interior dan fasad | Terlihat di foto; letak mengikuti bukaan fasad luar |
| Dinding barat dengan mural kutipan dan pintu kaca di tengah | `interior-ruang-kerja-mural`, `interior-meja-kasir-kantin` | Teks kutipan terbaca di foto; bentuk awan disederhanakan |
| Kafe di dekat pintu barat: konter depan, konter belakang, kulkas, rak, keranjang camilan, banner menu | `interior-meja-kasir-kantin`, `interior-lorong-ruang-kerja` | Elemen terlihat di foto; letak persisnya perkiraan |
| Meja panjang dengan sekat abu-abu di sisi jendela, kursi putar kuning/abu/hitam/salmon, sofa | Foto interior | Terlihat di foto; jumlah dan letak perkiraan |
| Mockup kereta di ujung timur, menghadap ruang, merah atas, jendela gelap, pintu putih, tulisan "HST 01 JAKARTA" dan "DEMU 1 0 25 01" | `interior-pameran-kereta` | Terlihat di foto. **Bukan** pameran Whoosh resmi sebelum tim memastikannya; tidak ada spesifikasi kereta yang diasumsikan |
| Mockup kereta memakan ±3/7 panjang ruangan dan hampir selebar ruangan | Keterangan tim | Tidak terukur dan agak ambigu; model memakai panjang 9,6 m sepanjang sisi Z dan kedalaman 3 m (`TRAIN_CONFIG`) |
| Motor listrik dan lengan robot di platform masing-masing | Keterangan tugas | **Tidak ada foto**; bentuk generik, letak dan ukuran asumsi |

Yang harus dipastikan tim di lokasi: ukuran ruangan, tinggi plafon, posisi dan ukuran kereta, letak kafe, meja dan sofa, serta tampilan motor dan lengan robot yang sebenarnya.
