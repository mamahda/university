# Latihan ETS Keamanan Informasi

---

## Soal 1

AES needs 8-bit arithmetic that supports division. Why is GF(2⁸) used instead of arithmetic modulo 256?

*Select one:*

- **a.** Addition modulo 256 is not closed, while addition in GF(2⁸) is closed
- **b.** Every nonzero byte has an inverse in GF(2⁸), but not modulo 256
- **c.** GF(2⁸) contains more elements than there are 8-bit byte values
- **d.** Arithmetic modulo 256 cannot represent the byte values 251 to 255

> ✅ **Jawaban: b**  
> **Penjelasan:** Pembagian membutuhkan invers perkalian. Modulo 256 bukan field karena 256 bukan bilangan prima, sehingga banyak elemen (misalnya semua bilangan genap) tidak punya invers. GF(2⁸) adalah field, jadi setiap byte bukan nol punya invers. Opsi a salah karena penjumlahan modulo 256 juga tertutup. Opsi c salah karena GF(2⁸) punya tepat 256 elemen. Opsi d salah karena modulo 256 mencakup 0 sampai 255.

---

## Soal 2

A student is writing MixColumns in Python and must compute {02} · {87}. What value should the function return?

*Select one:*

- **a.** {0E}
- **b.** {95}
- **c.** {1D}
- **d.** {15}

> ✅ **Jawaban: d**  
> **Penjelasan:** Kalikan {02} berarti geser kiri 1 bit. {87} = 1000 0111, setelah digeser menjadi 1 0000 1110 (0x10E). Bit ke-8 bernilai 1, maka direduksi dengan XOR polinomial irreducible 0x11B: 0x10E XOR 0x11B = **0x15**.

---

## Soal 3

Why is the AES decryption algorithm not identical to the encryption algorithm, unlike in a Feistel cipher?

*Select one:*

- **a.** Its stages are reversed with inverse functions, a result of its structure
- **b.** Its decryption uses a different irreducible polynomial for the field
- **c.** Its rounds process one half of the State while the other half waits
- **d.** Its round keys are derived from a second, independently expanded key

> ✅ **Jawaban: a**  
> **Penjelasan:** AES adalah cipher substitusi-permutasi, bukan Feistel. Seluruh State diproses tiap round, sehingga dekripsi harus memakai fungsi invers (InvSubBytes, InvShiftRows, InvMixColumns) dengan urutan dibalik. Pada Feistel, struktur yang sama bisa dipakai untuk enkripsi dan dekripsi hanya dengan membalik urutan round key.

---

## Soal 4

How does the symmetric encryption notation C = E(M, K) relate to the decryption process?

*Select one:*

- **a.** The same key K is reused, so that M = D(C, K)
- **b.** Decryption does not require knowledge of K at all
- **c.** The notation only applies to asymmetric encryption schemes
- **d.** A different key K' must be used, so that M = D(C, K')

> ✅ **Jawaban: a**  
> **Penjelasan:** Enkripsi simetris memakai kunci rahasia yang sama untuk enkripsi dan dekripsi, sehingga M = D(C, K).

---

## Soal 5

What is the plaintext block size of AES?

*Select one:*

- **a.** 192 bits
- **b.** 128 bits
- **c.** 64 bits
- **d.** 256 bits

> ✅ **Jawaban: b**  
> **Penjelasan:** Blok AES selalu 128 bit (16 byte). Yang bervariasi hanya panjang kunci: 128, 192, atau 256 bit.

---

## Soal 6

How many rounds does AES perform with a 128-bit key?

*Select one:*

- **a.** 12 rounds
- **b.** 14 rounds
- **c.** 10 rounds
- **d.** 8 rounds

> ✅ **Jawaban: c**  
> **Penjelasan:** AES-128 memakai 10 round, AES-192 memakai 12 round, dan AES-256 memakai 14 round.

---

## Soal 7

How many elements does the finite field GF(2ⁿ) contain?

*Select one:*

- **a.** 2ⁿ
- **b.** 2n
- **c.** n²
- **d.** 2ⁿ − 1

> ✅ **Jawaban: a**  
> **Penjelasan:** Elemen GF(2ⁿ) adalah polinomial berderajat maksimal n−1 dengan koefisien biner, sehingga ada 2ⁿ elemen.

---

## Soal 8 (muncul 2 kali)

Why does a CTR implementation of AES need less code than a CBC implementation?

*Select one:*

- **a.** Only the encryption function and its key schedule have to be built
- **b.** Only the final round of the cipher has to run for each block of data
- **c.** Only one counter value is needed for the whole message that is sent
- **d.** Only half of the round keys are needed, so the schedule is shorter

> ✅ **Jawaban: a**  
> **Penjelasan:** CTR mengenkripsi nilai counter lalu meng-XOR hasilnya dengan plaintext. Dekripsi memakai operasi yang sama, sehingga fungsi dekripsi blok AES tidak perlu dibuat. CBC membutuhkan fungsi enkripsi dan dekripsi.

---

## Soal 9

An application stores the CBC initialization vector unauthenticated in a file header, so a user can edit it. What can an attacker do with this?

*Select one:*

- **a.** Recover the encryption key by comparing the IV with the first block
- **b.** Reorder the ciphertext blocks without the receiver noticing any change
- **c.** Decrypt every block of the file, since the IV acts as a second key
- **d.** Flip chosen bits of the first plaintext block by flipping those IV bits

> ✅ **Jawaban: d**  
> **Penjelasan:** Dekripsi CBC: P1 = D(C1) XOR IV. Membalik bit tertentu pada IV membalik bit yang sama pada P1. IV bukan kunci, jadi penyerang tidak bisa memulihkan kunci atau mendekripsi seluruh blok.

---

## Soal 10

Which comparison of PRNGs and TRNGs is correct?

*Select one:*

- **a.** PRNGs are efficient, deterministic and periodic; TRNGs are none of these
- **b.** PRNGs are inefficient but aperiodic; TRNGs are efficient and deterministic
- **c.** PRNGs are efficient and aperiodic; TRNGs are slow but fully deterministic
- **d.** PRNGs and TRNGs are both periodic, but only TRNGs can be reproduced

> ✅ **Jawaban: a**  
> **Penjelasan:** PRNG memakai algoritma deterministik: cepat, dapat direproduksi dari seed yang sama, dan akhirnya berulang (periodik). TRNG mengambil keacakan dari sumber fisik, sehingga tidak deterministik dan tidak periodik, serta umumnya lebih lambat.

---

## Soal 11 (muncul 2 kali)

A message is encrypted using the Caesar cipher, and an analyst simply tries all twenty-five possible shifts to recover the plaintext. Which attack strategy is being used, and why is it feasible here?

*Select one:*

- **a.** Chosen-ciphertext attack, feasible because the algorithm is public
- **b.** Frequency analysis, feasible because letter frequencies are known
- **c.** Brute-force attack, feasible because the key space is very small
- **d.** Known-plaintext attack, feasible because plaintext samples exist

> ✅ **Jawaban: c**  
> **Penjelasan:** Mencoba semua kemungkinan kunci adalah brute-force. Caesar cipher hanya punya 25 kunci bermakna, sehingga semuanya mudah dicoba.

---

## Soal 12

Where are the first four bytes of a 128-bit plaintext placed when the State array is loaded?

*Select one:*

- **a.** On the main diagonal of the State
- **b.** In the first row of the State
- **c.** In the first column of the State
- **d.** In the last column of the State

> ✅ **Jawaban: c**  
> **Penjelasan:** State diisi per kolom (column-major): byte 0 sampai 3 mengisi kolom pertama, byte 4 sampai 7 kolom kedua, dan seterusnya.

---

## Soal 13

How does the BBS generator obtain each output bit from its internal value Xi?

*Select one:*

- **a.** It takes the final bit of the seed s after squaring it modulo n
- **b.** It takes the parity of all bits of Xi after squaring modulo n
- **c.** It takes the most significant bit of Xi after squaring modulo n
- **d.** It takes the least significant bit of Xi after squaring modulo n

> ✅ **Jawaban: d**  
> **Penjelasan:** Blum Blum Shub: X(i) = X(i−1)² mod n, lalu output B(i) = X(i) mod 2, yaitu bit paling tidak signifikan (LSB) dari X(i).

---

## Soal 14

Why is ECB unsuitable for long, highly structured messages?

*Select one:*

- **a.** Each block needs its own key, so key management becomes unwieldy
- **b.** Repeated plaintext blocks yield repeated ciphertext, exposing patterns
- **c.** Each block depends on the previous one, so one error ruins the rest
- **d.** Repeated plaintext blocks make the last block impossible to pad

> ✅ **Jawaban: b**  
> **Penjelasan:** ECB mengenkripsi tiap blok secara independen dengan kunci yang sama. Plaintext identik menghasilkan ciphertext identik, sehingga pola pesan bocor.

---

## Soal 15

How does the final AES round differ from the earlier full rounds?

*Select one:*

- **a.** It has five stages, adding a second SubBytes
- **b.** It has only two stages, omitting two key XORs
- **c.** It has only three stages, omitting ShiftRows
- **d.** It has only three stages, omitting MixColumns

> ✅ **Jawaban: d**  
> **Penjelasan:** Round penuh: SubBytes, ShiftRows, MixColumns, AddRoundKey. Round terakhir tidak memiliki MixColumns, jadi hanya SubBytes, ShiftRows, dan AddRoundKey.

---

## Soal 16

How does a pseudorandom function differ from a pseudorandom number generator?

*Select one:*

- **a.** A PRF is built from block ciphers, while a PRNG is purpose-built code
- **b.** A PRF is deterministic, while a PRNG draws on a true entropy source
- **c.** A PRF returns a fixed-length string; a PRNG returns an open-ended one
- **d.** A PRF needs no seed value at all, while a PRNG always requires one

> ✅ **Jawaban: c**  
> **Penjelasan:** Menurut Stallings, PRF menghasilkan string bit pseudorandom dengan panjang tertentu, sedangkan PRNG menghasilkan aliran bit yang bisa diteruskan tanpa batas.

---

## Soal 17

A cryptanalyst suspects a Vigenere cipher was used and finds that assuming a longer key makes the attack progressively harder. What underlying reason explains this difficulty?

*Select one:*

- **a.** A longer key converts the cipher into a stream cipher
- **b.** A longer key removes the need for frequency analysis entirely
- **c.** A longer key repeats less often, reducing repeated ciphertext patterns
- **d.** A longer key makes the encryption algorithm secret

> ✅ **Jawaban: c**  
> **Penjelasan:** Serangan pada Vigenere (misalnya Kasiski) memanfaatkan pengulangan kunci untuk menemukan panjang kunci. Makin panjang kunci, makin jarang berulang, sehingga pola statistik ciphertext makin lemah.

---

## Soal 18

Why does the AES-128 key schedule contain 44 words?

*Select one:*

- **a.** It supplies 11 round keys of 4 words: one per round plus the initial key
- **b.** It supplies 22 round keys of 2 words, one per half of each of 11 rounds
- **c.** It supplies 10 round keys of 4 words plus 4 words of padding at the end
- **d.** It supplies 11 round keys of 4 words, one per round plus a final check

> ✅ **Jawaban: a**  
> **Penjelasan:** AES-128 punya 10 round ditambah AddRoundKey awal, jadi butuh 11 round key. Tiap round key 128 bit = 4 word, sehingga 11 × 4 = 44 word.

---

## Soal 19

What input does a pseudorandom number generator use to produce its output sequence?

*Select one:*

- **a.** A stream of true random bits
- **b.** A fixed value called the seed
- **c.** A block of plaintext data
- **d.** A public certificate value

> ✅ **Jawaban: b**  
> **Penjelasan:** PRNG adalah algoritma deterministik yang menghasilkan barisan keluaran dari satu nilai awal tetap yang disebut seed. Seed yang sama menghasilkan barisan yang sama.

---

## Soal 20

How are two elements of GF(2ⁿ) added when each is represented as an n-bit string?

*Select one:*

- **a.** By a bitwise OR of the two strings
- **b.** By a bitwise AND of the two strings
- **c.** By integer addition modulo 2ⁿ
- **d.** By a bitwise XOR of the two strings

> ✅ **Jawaban: d**  
> **Penjelasan:** Elemen GF(2ⁿ) adalah polinomial dengan koefisien biner. Penjumlahan koefisien dilakukan modulo 2, yang sama dengan XOR bit demi bit.

---

## Soal 21

Why does the RC4 state vector S always hold a permutation of the values 0 through 255?

*Select one:*

- **a.** The key is copied into the vector T, which is never written back to S
- **b.** The vector is reinitialised in ascending order before every output byte
- **c.** The only operation applied to its entries is a swap of two of them
- **d.** Each entry is replaced modulo 256, so no value can appear two times

> ✅ **Jawaban: c**  
> **Penjelasan:** S diinisialisasi dengan 0 sampai 255, lalu hanya dimodifikasi dengan menukar (swap) dua entri. Pertukaran tidak menambah atau menghilangkan nilai, sehingga S selalu berupa permutasi.

---

## Soal 22

Which classical cipher shifts every letter of the alphabet by a fixed number of positions, originally three places forward?

*Select one:*

- **a.** Vigenere cipher
- **b.** Monoalphabetic cipher
- **c.** One-time pad cipher
- **d.** Caesar cipher

> ✅ **Jawaban: d**  
> **Penjelasan:** Caesar cipher menggeser setiap huruf sejauh k posisi tetap (aslinya 3). Vigenere memakai beberapa pergeseran berbeda sesuai kata kunci.

---

## Soal 23

What is fed back into the encryption function in OFB, and how does this differ from CFB?

*Select one:*

- **a.** OFB feeds back the counter value; CFB feeds back the nonce value
- **b.** OFB feeds back the plaintext block; CFB feeds back the round key
- **c.** OFB feeds back the encryption output; CFB feeds back the ciphertext
- **d.** OFB feeds back the ciphertext unit; CFB feeds back the XOR output

> ✅ **Jawaban: c**  
> **Penjelasan:** Pada OFB, keluaran fungsi enkripsi (sebelum di-XOR dengan plaintext) menjadi masukan berikutnya. Pada CFB, yang diumpan balik adalah ciphertext. Karena itu OFB tidak menyebarkan error bit ke blok berikutnya.

---

## Soal 24

What makes the ANSI X9.17 generator strong, given that it uses three EDE operations per output?

*Select one:*

- **a.** Two independent keys are used, and a new key is derived for each output
- **b.** Two independent inputs drive it, and an extra EDE protects the next seed
- **c.** Three separate seeds are mixed, and the date value is kept fully secret
- **d.** Three separate hash functions condition the output of the DES modules

> ✅ **Jawaban: b**  
> **Penjelasan:** X9.17 digerakkan oleh dua masukan pseudorandom, yaitu nilai tanggal/waktu dan seed. Satu EDE tambahan dipakai untuk membentuk seed berikutnya, sehingga meskipun keluaran bocor, seed berikutnya sulit ditebak.

---

## Soal 25

Which mode needs no padding when the final plaintext block is shorter than the block size?

*Select one:*

- **a.** CBC, because the last short block is XORed with the whole IV
- **b.** ECB, because the last short block is encrypted under its own key
- **c.** CTR, because only the needed bits of the encrypted counter are used
- **d.** 3DES, because its 64-bit blocks always divide a message evenly

> ✅ **Jawaban: c**  
> **Penjelasan:** CTR bekerja seperti stream cipher: keluaran enkripsi counter di-XOR dengan plaintext, dan untuk blok terakhir yang pendek cukup dipakai bit yang dibutuhkan. ECB dan CBC memerlukan blok penuh sehingga butuh padding.

---

## Soal 26

Both the final encryption round and the final decryption round contain only three stages. What is the reason for this?

*Select one:*

- **a.** It is required by the AES structure to keep the cipher reversible
- **b.** It reduces the total running time of the cipher by roughly a tenth
- **c.** It prevents the last round key from being exposed in the ciphertext
- **d.** It compensates for the extra key XOR applied before the first round

> ✅ **Jawaban: a**  
> **Penjelasan:** Menurut Stallings, round terakhir tanpa MixColumns (dan InvMixColumns) adalah konsekuensi struktur AES agar enkripsi dan dekripsi tetap dapat dibalik. Alasannya bukan kecepatan.

---

## Soal 27

In computer security terminology, which term describes a weakness in a system that could be exploited by a threat?

*Select one:*

- **a.** Asset
- **b.** Vulnerability
- **c.** Risk
- **d.** Countermeasure

> ✅ **Jawaban: b**  
> **Penjelasan:** Vulnerability adalah kelemahan pada sistem yang dapat dieksploitasi oleh ancaman. Asset adalah yang dilindungi, risk adalah kemungkinan dampak, countermeasure adalah tindakan pencegahan.

---

## Soal 28

How is the AddRoundKey stage reversed in AES decryption?

*Select one:*

- **a.** The round key is passed through the inverse S-box first
- **b.** The block is multiplied by the inverse of the round key
- **c.** The same round key is XORed with the block once more
- **d.** The round key is XORed with its own bitwise complement

> ✅ **Jawaban: c**  
> **Penjelasan:** XOR adalah inversnya sendiri: (A XOR K) XOR K = A. Jadi cukup meng-XOR blok dengan round key yang sama sekali lagi.

---

## Soal 29

An attacker who intercepted an encrypted message notices the letter mapping is fixed for the whole message and that English letter frequencies are well known. Which classical cipher is most likely being attacked here?

*Select one:*

- **a.** Monoalphabetic cipher
- **b.** Stream cipher
- **c.** One-time pad
- **d.** Vigenere cipher

> ✅ **Jawaban: a**  
> **Penjelasan:** Pemetaan huruf yang tetap sepanjang pesan adalah ciri monoalphabetic cipher, sehingga dapat diserang dengan analisis frekuensi huruf.

---

## Soal 30

Which two criteria are used to validate that a sequence of numbers is random in a statistical sense?

*Select one:*

- **a.** Secrecy of the seed value and independence of the subsequences
- **b.** Uniform distribution of bits and independence of subsequences
- **c.** Secrecy of the seed value and a large modulus in the generator
- **d.** Uniform distribution of bits and a short period of repetition

> ✅ **Jawaban: b**  
> **Penjelasan:** Dua kriteria keacakan statistik menurut Stallings adalah distribusi seragam (frekuensi 0 dan 1 hampir sama) dan independensi (tidak ada subsequence yang dapat disimpulkan dari yang lain).

---

## Soal 31

What does backward unpredictability require of a pseudorandom sequence?

*Select one:*

- **a.** The seed cannot be deduced from any of the values generated from it
- **b.** The next bit cannot be guessed from the earlier bits of the stream
- **c.** The sequence cannot repeat itself before the key has been changed
- **d.** The sequence cannot be reproduced even when the seed is known

> ✅ **Jawaban: a**  
> **Penjelasan:** Backward unpredictability berarti tidak layak menentukan seed dari nilai-nilai yang dihasilkan. Opsi b menggambarkan forward unpredictability, dan opsi d salah karena PRNG deterministik sehingga dapat direproduksi dari seed yang sama.

---

## Soal 32

In classical cryptography, what does the term plaintext refer to?

*Select one:*

- **a.** The coded message
- **b.** The secret key value
- **c.** The encryption algorithm
- **d.** The original message

> ✅ **Jawaban: d**  
> **Penjelasan:** Plaintext adalah pesan asli sebelum dienkripsi. Pesan yang sudah dikodekan disebut ciphertext.

---

## Soal 33

A security incident report identifies a former employee with intent to leak confidential files as the party responsible for the breach. Which computer security term best describes this party?

*Select one:*

- **a.** Vulnerability
- **b.** Adversary
- **c.** Countermeasure
- **d.** Asset

> ✅ **Jawaban: b**  
> **Penjelasan:** Adversary (threat agent) adalah pihak yang melakukan atau berniat melakukan serangan. Vulnerability adalah kelemahan, countermeasure adalah pengamanan, dan asset adalah yang dilindungi.

---

## Soal 34

Why is the raw output of a hardware entropy source usually passed through a hash function or a block cipher?

*Select one:*

- **a.** To remove bias and raise the entropy rate towards one bit per bit
- **b.** To slow the output down so that it matches the speed of the consumer
- **c.** To make the sequence reproducible later from the same seed material
- **d.** To extend the output, since a hash accepts an input of any length at all

> ✅ **Jawaban: a**  
> **Penjelasan:** Keluaran mentah sumber entropi fisik sering bias. Pemrosesan dengan hash atau block cipher (conditioning) menghilangkan bias dan meningkatkan entropi per bit mendekati 1.

---

## Soal 35

A developer reuses the same stream cipher key for two file transfers to save a handshake. What can an attacker do with the two ciphertexts?

*Select one:*

- **a.** Nothing useful, unless the attacker also recovers the seed of the generator
- **b.** Nothing useful, because each transfer uses a different initial state vector
- **c.** XOR them to obtain the XOR of the plaintexts and exploit known structure
- **d.** XOR them to obtain the encryption key directly, since the keystreams cancel

> ✅ **Jawaban: c**  
> **Penjelasan:** Jika keystream sama, C1 XOR C2 = P1 XOR P2, karena keystream saling menghilangkan. Penyerang lalu memanfaatkan struktur plaintext yang dikenal (crib dragging). Kunci tidak langsung terbuka (opsi d salah).

---

## Soal 36

An organization publishes its encryption algorithm's full specification but keeps only the key secret, and security experts endorse this design choice. Which principle supports this practice?

*Select one:*

- **a.** The CIA triad
- **b.** The cost-of-security trade-off
- **c.** Sufficient key-space principle
- **d.** Kerckhoffs' principle

> ✅ **Jawaban: d**  
> **Penjelasan:** Prinsip Kerckhoffs menyatakan keamanan sistem harus bergantung hanya pada kerahasiaan kunci, bukan kerahasiaan algoritma.

---

## Soal 37

Why does a monoalphabetic cipher remain vulnerable even when its letter mapping is unknown to an attacker?

*Select one:*

- **a.** Its key space is smaller than that of the Caesar cipher
- **b.** The frequency distribution of letters in the language is still preserved
- **c.** It requires a shared secure channel for every message
- **d.** It always uses a block cipher structure internally

> ✅ **Jawaban: b**  
> **Penjelasan:** Substitusi satu huruf ke satu huruf menjaga pola frekuensi huruf bahasa aslinya, sehingga bisa dipecahkan dengan analisis frekuensi. Ruang kuncinya (26!) justru jauh lebih besar dari Caesar, jadi opsi a salah.

---

## Soal 38

Which statement about subtraction in GF(2ⁿ) is correct?

*Select one:*

- **a.** It is identical to addition, because every element is its own negative
- **b.** It is undefined, since GF(2ⁿ) only supports addition and division
- **c.** It is identical to multiplication by the additive inverse of one
- **d.** It needs a borrow chain, just like subtraction of ordinary integers

> ✅ **Jawaban: a**  
> **Penjelasan:** Karena karakteristiknya 2, a + a = 0, sehingga setiap elemen adalah negatif dirinya sendiri. Pengurangan sama dengan penjumlahan, yaitu XOR, tanpa borrow. Opsi c memang benar secara matematis (−1 = 1), tetapi pernyataan yang menjelaskan sifat khas GF(2ⁿ) adalah opsi a.

---

## Soal 39

A hospital system encrypts fixed-format patient records block by block in ECB mode with one key. Which risk should an auditor report first?

*Select one:*

- **a.** Records shorter than one block cannot be encrypted at all in this mode
- **b.** Identical field values give identical ciphertext, and blocks can be swapped
- **c.** Each record needs a fresh key, so the key store will run out of key space
- **d.** A single transmission error will corrupt every record stored after that one

> ✅ **Jawaban: b**  
> **Penjelasan:** ECB mengenkripsi tiap blok secara independen dengan kunci yang sama. Nilai field yang identik pada record berformat tetap menghasilkan ciphertext identik sehingga pola bocor, dan blok bisa ditukar atau disalin tanpa terdeteksi. Opsi a salah karena record pendek tinggal di-padding. Opsi c salah karena satu kunci cukup. Opsi d salah karena error pada ECB hanya merusak blok yang terkena, bukan record sesudahnya.

---

## Soal 40

A fleet of sensors reboots and restarts its CTR counter from the same initial value under the same key. Why is this a serious problem?

*Select one:*

- **a.** The counter overflows sooner, so the final blocks are transmitted unencrypted
- **b.** Blocks sharing a counter share a keystream, so one known block reveals others
- **c.** The key schedule is rebuilt each time, so the round keys become predictable
- **d.** Blocks sharing a counter cannot be decrypted, so the data is lost for good

> ✅ **Jawaban: b**  
> **Penjelasan:** Pada CTR, keystream = E(K, counter). Counter dan kunci yang sama menghasilkan keystream yang sama, sehingga C1 XOR C2 = P1 XOR P2. Jika satu plaintext diketahui, plaintext lainnya terbuka. Counter tidak boleh dipakai ulang di bawah kunci yang sama.

---

## Soal 41

A hospital's patient database can be modified by any staff member without approval, and a disgruntled employee later alters several patient records. Which security concept was mainly missing, allowing this to happen?

*Select one:*

- **a.** Application of Kerckhoffs' principle to the system
- **b.** Sufficient key-space for the encryption algorithm used
- **c.** Use of a stream cipher rather than a block cipher
- **d.** An adequate security policy or access control over data changes

> ✅ **Jawaban: d**  
> **Penjelasan:** Masalahnya adalah tidak ada kebijakan keamanan atau kontrol akses atas perubahan data, sehingga integritas data tidak terjaga. Kerckhoffs, ruang kunci, dan jenis cipher berkaitan dengan kekuatan enkripsi, bukan siapa yang berhak mengubah data.

---

## Soal 42

What is the key difference between a threat and a vulnerability in computer security terminology?

*Select one:*

- **a.** A threat is always intentional, a vulnerability is always accidental
- **b.** A threat only applies to hardware, a vulnerability only to software
- **c.** A threat is a potential danger, a vulnerability is an exploitable weakness
- **d.** A threat is a weakness, while a vulnerability is a potential danger

> ✅ **Jawaban: c**  
> **Penjelasan:** Threat adalah potensi bahaya (sesuatu yang dapat mengeksploitasi), sedangkan vulnerability adalah kelemahan pada sistem yang dapat dieksploitasi. Opsi d membalik definisinya.

---

## Soal 43

Why is Kerckhoffs' principle important when designing an encryption method?

*Select one:*

- **a.** Security should rely on avoiding key distribution altogether
- **b.** Security should rely on the secrecy of the key, not the algorithm
- **c.** Security should rely on hiding the encryption algorithm itself
- **d.** Security should rely on making the key space as small as possible

> ✅ **Jawaban: b**  
> **Penjelasan:** Menurut prinsip Kerckhoffs, keamanan harus bergantung pada kerahasiaan kunci, bukan kerahasiaan algoritma. Algoritma dianggap bisa diketahui musuh.

---

## Soal 44

An IoT company upgrades its devices from AES-128 to AES-256. Which change should the engineering team expect?

*Select one:*

- **a.** Rounds fall from 14 to 10, while the block size stays at 128 bits
- **b.** Rounds stay at 10, while the block size grows from 128 to 256 bits
- **c.** Rounds rise from 10 to 14, while the block size stays at 128 bits
- **d.** Rounds rise from 10 to 14, and the block size grows to 256 bits

> ✅ **Jawaban: c**  
> **Penjelasan:** AES-128 memakai 10 round dan AES-256 memakai 14 round. Ukuran blok AES tetap 128 bit untuk semua panjang kunci.

---

## Soal 45

An IoT device seeds its PRNG with the boot-time clock value because it has no entropy source. Why do its session keys end up weak?

*Select one:*

- **a.** The clock value is public, so the PRNG output no longer passes the tests
- **b.** The generator becomes aperiodic, so repeated keys appear within a session
- **c.** The space of possible seeds is small, so keys can be searched exhaustively
- **d.** The clock value changes too quickly, so the generator never reaches a seed

> ✅ **Jawaban: c**  
> **Penjelasan:** Nilai jam saat boot mudah ditebak dan rentangnya sempit, sehingga ruang seed kecil. Penyerang dapat mencoba semua seed (brute-force) lalu menurunkan kunci sesi yang sama.

---

## Soal 46

An analyst trying to break a suspected monoalphabetic cipher starts by counting how often each ciphertext letter appears. What should be the analyst's very next step, and why?

*Select one:*

- **a.** Compare the counted frequencies to known language letter frequencies to guess the mapping
- **b.** Assume the cipher is unbreakable and stop the analysis
- **c.** Convert the ciphertext into binary before further analysis
- **d.** Try all possible keys exhaustively, since the key space is small

> ✅ **Jawaban: a**  
> **Penjelasan:** Langkah berikutnya pada analisis frekuensi adalah membandingkan frekuensi huruf ciphertext dengan frekuensi huruf bahasa asli untuk menebak pemetaan. Opsi d salah karena ruang kunci monoalphabetic besar (26!), bukan kecil.

---

## Soal 47

Why is a TRNG normally used to seed a PRNG rather than to generate a keystream directly?

*Select one:*

- **a.** A TRNG is too slow, and its whole output would have to be shared securely
- **b.** A TRNG is deterministic, so its output would repeat once the period ended
- **c.** A TRNG cannot produce binary output, so it must be converted by the PRNG
- **d.** A TRNG needs a seed itself, which only a PRNG is able to supply to it

> ✅ **Jawaban: a**  
> **Penjelasan:** TRNG relatif lambat dan keluarannya tidak dapat direproduksi, sehingga seluruh keystream harus dikirim aman ke penerima. Dengan PRNG, cukup seed pendek yang dibagikan, lalu kedua pihak membangkitkan keystream yang sama. Opsi b, c, d salah.

---

## Soal 48

A messaging app encrypts each character of a chat message as it is typed and sent, rather than waiting to encrypt a fixed-size group of characters. Which encryption approach does this best describe?

*Select one:*

- **a.** Transposition cipher
- **b.** Monoalphabetic cipher
- **c.** Stream cipher
- **d.** Block cipher

> ✅ **Jawaban: c**  
> **Penjelasan:** Stream cipher mengenkripsi data bit atau byte secara kontinu, satu per satu. Block cipher menunggu blok berukuran tetap.

---

## Soal 49

Which AES stage is a simple permutation rather than a substitution?

*Select one:*

- **a.** ShiftRows
- **b.** SubBytes
- **c.** AddRoundKey
- **d.** MixColumns

> ✅ **Jawaban: a**  
> **Penjelasan:** ShiftRows hanya menggeser posisi byte pada baris (permutasi sederhana). SubBytes dan MixColumns adalah substitusi, dan AddRoundKey adalah XOR dengan kunci.

---

## Soal 50

What is {3C} + {A5} in the AES field?

*Select one:*

- **a.** {99}
- **b.** {24}
- **c.** {E1}
- **d.** {BD}

> ✅ **Jawaban: a**  
> **Penjelasan:** Penjumlahan di GF(2⁸) adalah XOR. 0x3C = 0011 1100 dan 0xA5 = 1010 0101, sehingga XOR-nya 1001 1001 = **0x99**.

---

## Soal 51

In CBC encryption, what is XORed with the first plaintext block before encryption?

*Select one:*

- **a.** The initialization vector
- **b.** The first ciphertext block
- **c.** The encrypted counter
- **d.** The last plaintext block

> ✅ **Jawaban: a**  
> **Penjelasan:** CBC: C1 = E(K, P1 XOR IV). Blok berikutnya di-XOR dengan ciphertext blok sebelumnya.

---

## Soal 52

In which mode of operation is each block of plaintext encrypted independently under the same key?

*Select one:*

- **a.** Cipher Block Chaining (CBC)
- **b.** Output Feedback (OFB)
- **c.** Cipher Feedback (CFB)
- **d.** Electronic Codebook (ECB)

> ✅ **Jawaban: d**  
> **Penjelasan:** ECB mengenkripsi setiap blok secara terpisah dengan kunci yang sama. Mode lain memakai umpan balik atau chaining.

---

## Soal 53

Which function of the block cipher is used to decrypt in Cipher Feedback mode?

*Select one:*

- **a.** The key expansion function
- **b.** The encryption function
- **c.** The decryption function
- **d.** The inverse MixColumns

> ✅ **Jawaban: b**  
> **Penjelasan:** CFB (seperti OFB dan CTR) mengubah block cipher menjadi stream cipher. Baik enkripsi maupun dekripsi memakai fungsi enkripsi untuk menghasilkan keystream yang di-XOR dengan data.

---

## Soal 54

Which AES stage is the only one that makes use of the key?

*Select one:*

- **a.** MixColumns
- **b.** SubBytes
- **c.** AddRoundKey
- **d.** ShiftRows

> ✅ **Jawaban: c**  
> **Penjelasan:** Hanya AddRoundKey yang melibatkan kunci (XOR State dengan round key). SubBytes, ShiftRows, dan MixColumns tidak memakai kunci.

---

## Soal 55

Which statement about parallel processing of blocks is correct?

*Select one:*

- **a.** No mode can be parallelised, because each of them uses feedback paths
- **b.** CBC allows both operations in parallel; CTR encryption cannot be split
- **c.** CTR allows both operations in parallel; CBC encryption cannot be split
- **d.** Only CFB allows parallel work, because it processes s bits at a time

> ✅ **Jawaban: c**  
> **Penjelasan:** Pada CTR, setiap blok memakai counter sendiri sehingga enkripsi dan dekripsi bisa paralel. Pada CBC, enkripsi bergantung pada ciphertext blok sebelumnya sehingga tidak bisa dibagi paralel (dekripsinya bisa).

---

## Soal 56

In Counter mode, what is XORed with each plaintext block?

*Select one:*

- **a.** The previous ciphertext block of the message
- **b.** The decrypted counter value for that block
- **c.** The initialization vector used for that block
- **d.** The encrypted counter value for that block

> ✅ **Jawaban: d**  
> **Penjelasan:** CTR: Ci = Pi XOR E(K, counter_i). Yang di-XOR dengan plaintext adalah nilai counter yang sudah dienkripsi.

---

## Soal 57

Why is AES built by alternating AddRoundKey with the other three stages?

*Select one:*

- **a.** The XOR alone is weak and the keyless stages alone give no security
- **b.** The XOR alone is secure, and the keyless stages only add padding
- **c.** The keyless stages alone are secure, and the XOR only adds speed
- **d.** Both parts are secure alone, and combining them lowers key size

> ✅ **Jawaban: a**  
> **Penjelasan:** Menurut Stallings, XOR kunci saja lemah, sedangkan tahap tanpa kunci (SubBytes, ShiftRows, MixColumns) tidak memberi keamanan karena tidak bergantung pada kunci. Kombinasi bergantian memberikan keamanan yang efektif.

---

## Soal 58

How does the AES decryption algorithm use the expanded key?

*Select one:*

- **a.** It uses only the first four words of it
- **b.** It uses the round keys in reverse order
- **c.** It uses the round keys in the same order
- **d.** It uses a separately expanded second key

> ✅ **Jawaban: b**  
> **Penjelasan:** Dekripsi memakai kunci hasil ekspansi yang sama, tetapi round key dipakai dalam urutan terbalik (dari round terakhir ke awal).

---

## Soal 59

A security team is deciding whether to invest heavily in advanced defenses for a low-value, easily replaceable asset. Which trade-off should most influence their decision?

*Select one:*

- **a.** The application of Kerckhoffs' principle
- **b.** The cost of security versus the cost of failure and recovery
- **c.** The choice between block and stream ciphers
- **d.** The ease-of-use versus security trade-off

> ✅ **Jawaban: b**  
> **Penjelasan:** Untuk aset bernilai rendah dan mudah diganti, biaya pengamanan yang besar tidak sebanding dengan biaya kegagalan dan pemulihan. Inilah trade-off biaya keamanan terhadap biaya kegagalan.

---

## Soal 60

During decryption, how is the effect of an AddRoundKey stage undone?

*Select one:*

- **a.** By applying the inverse S-box to the round key before use
- **b.** By multiplying the State with the inverse of the round key
- **c.** By XORing the State with the same round key once again
- **d.** By XORing the State with the bitwise complement of the key

> ✅ **Jawaban: c**  
> **Penjelasan:** XOR adalah inversnya sendiri: (S XOR K) XOR K = S. Soal ini mirip dengan Soal 28 dan jawabannya sama.

---

## Soal 61

A product still offers RC4 in its TLS configuration because it is fast and compact. How should a reviewer assess this choice?

*Select one:*

- **a.** Keystream biases allow recovery of repeatedly sent plaintext, and RFC 7465 bars it
- **b.** RC4 should stay enabled, since AES in software is slower on every platform
- **c.** RC4 is sound for keys of 128 bits, so the setting can stay for older clients
- **d.** RC4 is sound, and the earlier WEP failure was caused only by its short period

> ✅ **Jawaban: a**  
> **Penjelasan:** Keystream RC4 memiliki bias statistik sehingga plaintext yang dikirim berulang (misalnya cookie) dapat dipulihkan. RFC 7465 melarang penggunaan RC4 di TLS. Panjang kunci tidak menghilangkan bias, dan AES tidak lebih lambat di semua platform.

---

## Soal 62

A developer writes a custom cipher that multiplies bytes using (a * b) % 256 and decrypts by dividing. What problem will appear?

*Select one:*

- **a.** Results can exceed 255, so they no longer fit into a single byte
- **b.** Multiplication becomes non-commutative, so round order is lost
- **c.** Every byte then has two inverses, so decryption is ambiguous
- **d.** Bytes such as {02} have no inverse, so some blocks cannot be decrypted

> ✅ **Jawaban: d**  
> **Penjelasan:** Modulo 256 bukan field, sehingga byte yang tidak koprima dengan 256 (semua bilangan genap, misalnya 2) tidak punya invers perkalian. Akibatnya tidak semua hasil dapat didekripsi. Opsi a salah karena hasil sudah di-mod 256.

---

## Soal 63

How is multiplication of a byte by {02} carried out in the AES field?

*Select one:*

- **a.** Shift right by one bit, then XOR with {1B} if the original top bit was 1
- **b.** Shift left by one bit, then XOR with {1B} if the original low bit was 1
- **c.** Shift left by one bit, then XOR with {1B} if the original top bit was 1
- **d.** Shift left by one bit, then always XOR the result with the value {1B}

> ✅ **Jawaban: c**  
> **Penjelasan:** Kali {02} adalah geser kiri 1 bit. Jika bit paling atas (bit ke-7) semula 1, terjadi overflow sehingga hasilnya di-XOR dengan {1B} (reduksi oleh polinomial 0x11B).

---

## Soal 64

Why must the initialization vector used in OFB be a nonce?

*Select one:*

- **a.** The IV is added to the counter, so reuse would overflow that counter
- **b.** The IV is sent in the clear, so reuse would disclose it to an opponent
- **c.** The keystream depends only on key and IV, so reuse repeats it exactly
- **d.** The keystream depends on the plaintext, so reuse would stop decryption

> ✅ **Jawaban: c**  
> **Penjelasan:** Keystream OFB hanya ditentukan oleh kunci dan IV. IV yang dipakai ulang menghasilkan keystream identik, sehingga C1 XOR C2 = P1 XOR P2 dan plaintext bocor. Karena itu IV harus nonce (unik).

---

## Soal 65

Which term describes the process of converting plaintext into ciphertext?

*Select one:*

- **a.** Steganography
- **b.** Encryption
- **c.** Cryptanalysis
- **d.** Decryption

> ✅ **Jawaban: b**  
> **Penjelasan:** Enkripsi adalah proses mengubah plaintext menjadi ciphertext. Dekripsi adalah kebalikannya, kriptanalisis adalah upaya memecahkan cipher, dan steganografi menyembunyikan keberadaan pesan.

---

## Soal 66

In the block-cipher PRNGs of SP 800-90A and X9.82, how is the value V updated in CTR mode compared with OFB mode?

*Select one:*

- **a.** CTR replaces V with the key value; OFB replaces V with the entropy input
- **b.** CTR increments V by one; OFB replaces V with the preceding input block
- **c.** CTR increments V by one; OFB replaces V with the preceding output block
- **d.** CTR replaces V with the output block; OFB increments V by one each time

> ✅ **Jawaban: c**  
> **Penjelasan:** Pada mode CTR, V dinaikkan 1 setiap putaran. Pada mode OFB, V diganti dengan blok keluaran enkripsi sebelumnya.

---

## Soal 67

To save time, a programmer removes the final AddRoundKey from their AES implementation. How should this change be assessed?

*Select one:*

- **a.** Decryption becomes impossible, because the key schedule is now one word too short
- **b.** Security improves, because fewer round keys are exposed in the output ciphertext
- **c.** An attacker can undo the keyless final stages, so the last round adds no security
- **d.** Performance improves without any loss, because ten keys have already been added

> ✅ **Jawaban: c**  
> **Penjelasan:** Tanpa AddRoundKey terakhir, tahap SubBytes dan ShiftRows terakhir tidak memakai kunci, sehingga penyerang dapat membalikkannya tanpa mengetahui kunci. Round terakhir pun tidak menambah keamanan.

---

## Soal 68

A company's website goes down during a scheduled sale, preventing customers from making purchases. Which CIA property is most directly compromised, and why?

*Select one:*

- **a.** Integrity, because transaction records were altered
- **b.** Confidentiality, because customer data was disclosed
- **c.** Accountability, because the sale cannot be traced
- **d.** Availability, because authorized users cannot access the service

> ✅ **Jawaban: d**  
> **Penjelasan:** Availability berarti sistem dan layanan dapat diakses pengguna sah saat dibutuhkan. Situs yang mati membuat pelanggan tidak bisa mengakses layanan.

---

## Soal 69

Why must the seed of a cryptographic PRNG be kept secret and be unpredictable?

*Select one:*

- **a.** The seed is XORed with each output block, so a known seed reveals the key
- **b.** The algorithm is deterministic, so the seed fixes the whole output stream
- **c.** The algorithm uses the seed as a counter, so a known seed halts the output
- **d.** The seed sets the period, so a predictable seed makes the period very short

> ✅ **Jawaban: b**  
> **Penjelasan:** PRNG bersifat deterministik, sehingga seed menentukan seluruh barisan keluaran. Jika penyerang mengetahui atau dapat menebak seed, ia dapat membangkitkan keluaran yang sama persis.

---

## Soal 70

How is the keystream combined with the plaintext in a stream cipher?

*Select one:*

- **a.** With a modular multiplication
- **b.** With a bitwise AND operation
- **c.** With a permutation of the bits
- **d.** With a bitwise XOR operation

> ✅ **Jawaban: d**  
> **Penjelasan:** Stream cipher meng-XOR keystream dengan plaintext bit demi bit. Dekripsi dilakukan dengan XOR keystream yang sama.

---

## Soal 71

Why is a linear congruential generator unsuitable for cryptographic use?

*Select one:*

- **a.** Its outputs are not uniformly spread over the range from 0 to m − 1
- **b.** A few observed outputs reveal the modulus, but never the multiplier
- **c.** A few observed outputs let an opponent solve for the parameters used
- **d.** Its outputs repeat after at most 32 values, whatever parameters are set

> ✅ **Jawaban: c**  
> **Penjelasan:** LCG linear: X(n+1) = (aXn + c) mod m. Dengan beberapa keluaran berurutan, penyerang dapat menyelesaikan persamaan untuk memperoleh parameter a, c, m, lalu memprediksi seluruh keluaran. Distribusi LCG sebenarnya cukup seragam, jadi opsi a salah.

---

## Soal 72

In GF(2³) defined by x³ + x + 1 with generator g, which power of g equals g¹⁰?

*Select one:*

- **a.** g²
- **b.** g⁴
- **c.** g¹
- **d.** g³

> ✅ **Jawaban: d**  
> **Penjelasan:** GF(2³) punya 2³ − 1 = 7 elemen bukan nol, sehingga g⁷ = 1. Maka g¹⁰ = g⁷ · g³ = g³.

---

## Soal 73

NIST SP 800-22 requires uniformity, scalability and consistency. What does consistency mean?

*Select one:*

- **a.** The generator must produce the same output whenever a seed is repeated
- **b.** The generator must keep an equal count of zeros and ones in each block
- **c.** The generator must pass each of the fifteen listed tests on every attempt
- **d.** The generator must behave the same way across different starting values

> ✅ **Jawaban: d**  
> **Penjelasan:** Menurut Stallings, consistency berarti perilaku generator harus konsisten untuk seed (nilai awal) yang berbeda, bukan hanya baik pada satu seed tertentu.

---

## Soal 74

A single bit error occurs while transmitting the first ciphertext unit. How do OFB and CFB compare?

*Select one:*

- **a.** OFB corrupts only P1, while CFB also corrupts later plaintext units
- **b.** OFB corrupts every later unit, while CFB corrupts only the unit P1
- **c.** Both corrupt all later units, because both of them use feedback paths
- **d.** Both corrupt only P1, because both of them behave as stream ciphers

> ✅ **Jawaban: a**  
> **Penjelasan:** Pada OFB, yang diumpan balik adalah keluaran enkripsi (bukan ciphertext), sehingga error hanya merusak P1. Pada CFB, ciphertext yang error masuk ke shift register dan merusak unit plaintext berikutnya sampai error keluar dari register.

---

## Soal 75

A web application issues session tokens from a linear congruential generator seeded at start-up. A tester collects several consecutive tokens. What is the realistic outcome?

*Select one:*

- **a.** The parameters can be solved for, so every later token can be predicted
- **b.** Tokens stay safe, because the modulus is close to the largest integer
- **c.** Only tokens issued before the collected ones can be reconstructed by it
- **d.** Tokens stay safe, as long as the seed is reseeded from the system clock

> ✅ **Jawaban: a**  
> **Penjelasan:** Beberapa keluaran berurutan LCG cukup untuk menyelesaikan parameternya, sehingga token berikutnya dapat diprediksi. Modulus besar atau reseed dari jam tidak mengatasi kelemahan linear ini.

---

## Soal 76

Which expression recovers plaintext block Pj (j > 1) in CBC mode?

*Select one:*

- **a.** Pj = D(K, Cj ⊕ Cj−1)
- **b.** Pj = E(K, Cj) ⊕ Cj−1
- **c.** Pj = D(K, Cj) ⊕ Cj+1
- **d.** Pj = D(K, Cj) ⊕ Cj−1

> ✅ **Jawaban: d**  
> **Penjelasan:** Enkripsi CBC: Cj = E(K, Pj ⊕ Cj−1). Dekripsi: Pj = D(K, Cj) ⊕ Cj−1.

---

## Soal 77

Telemetry is sent over a satellite link where single-bit errors are common and cannot be retransmitted. Which mode best limits the damage, and why?

*Select one:*

- **a.** CBC, because the chaining lets the receiver correct the corrupted bit later
- **b.** OFB, because a ciphertext bit error affects only the matching plaintext bit
- **c.** ECB, because each block is separate and errors are repaired during padding
- **d.** CFB, because the shift register absorbs the error before the next segment

> ✅ **Jawaban: b**  
> **Penjelasan:** OFB tidak menyebarkan error: satu bit ciphertext yang salah hanya memengaruhi bit plaintext yang bersesuaian. Mode lain tidak mengoreksi error, dan CBC/CFB justru menyebarkan error ke blok berikutnya.

---

## Soal 78

On what problem does the security of the Blum Blum Shub generator rest?

*Select one:*

- **a.** The difficulty of solving the discrete logarithm in a finite field GF(p)
- **b.** The difficulty of inverting the AES encryption function without a key
- **c.** The difficulty of finding collisions in a cryptographic hash function
- **d.** The difficulty of factoring the modulus n into its two prime factors

> ✅ **Jawaban: d**  
> **Penjelasan:** BBS memakai n = p × q (p dan q prima besar). Keamanannya bertumpu pada sulitnya memfaktorkan n menjadi p dan q.

---

## Soal 79

What trade-off is illustrated when a system becomes very secure but increasingly difficult to use?

*Select one:*

- **a.** Threat versus vulnerability
- **b.** Ease-of-use versus security
- **c.** Cost of security versus cost of recovery
- **d.** Confidentiality versus availability

> ✅ **Jawaban: b**  
> **Penjelasan:** Makin ketat pengamanan (misalnya autentikasi berlapis), sistem biasanya makin sulit dipakai. Inilah trade-off ease-of-use versus security.

---

## Soal 80

Why is a longer, less-repeated key generally harder to attack in a Vigenere cipher?

*Select one:*

- **a.** It converts letters into binary before encryption is applied
- **b.** It reduces the chance that identical plaintext segments produce identical ciphertext
- **c.** It changes the cipher into a block cipher structure
- **d.** It removes the need for a shared secret key altogether

> ✅ **Jawaban: b**  
> **Penjelasan:** Kunci yang lebih panjang dan jarang berulang mengurangi kemungkinan segmen plaintext yang sama dienkripsi dengan bagian kunci yang sama, sehingga pola berulang di ciphertext (yang dipakai Kasiski) makin sedikit.