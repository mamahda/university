package com.notes.model;

import java.sql.Timestamp;

/**
 * Model: Note (Catatan)
 * ---------------------
 * Kelas ini adalah representasi objek (POJO - Plain Old Java Object) dari tabel 'notes' di database.
 * Kelas ini berfungsi sebagai wadah data (Data Carrier) yang membawa informasi catatan
 * dari Database -> DAO -> Servlet -> JSP (View).
 * * Konsep:
 * 1. Encapsulation: Semua variabel bersifat private untuk keamanan data.
 * 2. JavaBeans: Memiliki constructor kosong dan getter/setter standar.
 * 3. Constructor Overloading: Memiliki banyak constructor untuk kebutuhan CRUD yang berbeda.
 */
public class Note {
    
    // ===========================
    // FIELDS (Atribut Data)
    // ===========================

    /** ID unik catatan (Primary Key). Dibuat otomatis (Auto Increment) oleh Database. */
    private int id;

    /** Judul dari catatan. */
    private String title;

    /** Isi konten utama dari catatan. */
    private String content;

    /** * Status pin (Favorit). 
     * true = Catatan disematkan di atas.
     * false = Catatan biasa.
     */
    private boolean isPinned;

    /** Waktu kapan catatan pertama kali dibuat. */
    private Timestamp createdAt;

    /** * Waktu kapan catatan terakhir kali diedit.
     * Database akan otomatis mengupdate kolom ini saat ada perubahan.
     */
    private Timestamp updatedAt;

    // ===========================
    // CONSTRUCTORS (Pencipta Objek)
    // ===========================

    /**
     * 1. Default Constructor (No-Args).
     * ---------------------------------
     * Wajib ada agar kelas ini memenuhi standar JavaBean.
     * Digunakan jika ingin membuat objek kosong lalu mengisinya satu per satu menggunakan Setter.
     */
    public Note() {}

    /**
     * 2. Constructor Lengkap (Full All-Args).
     * ---------------------------------------
     * Digunakan oleh DAO (Data Access Object) pada method 'mapResultSetToNote'.
     * Berfungsi untuk mengubah baris data mentah dari database (ResultSet) 
     * menjadi objek Java yang utuh saat proses SELECT (Read).
     * * @param id ID dari database.
     * @param title Judul catatan.
     * @param content Isi catatan.
     * @param isPinned Status pin.
     * @param createdAt Waktu pembuatan.
     * @param updatedAt Waktu update terakhir.
     */
    public Note(int id, String title, String content, boolean isPinned, Timestamp createdAt, Timestamp updatedAt) {
        this.id = id;
        this.title = title;
        this.content = content;
        this.isPinned = isPinned;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    /**
     * 3. Constructor untuk INSERT (Membuat Baru).
     * ------------------------------------------
     * Digunakan oleh Servlet saat menerima input form "New Note".
     * Kita TIDAK memasukkan 'id', 'createdAt', atau 'updatedAt' di sini karena
     * ketiga data tersebut akan di-generate otomatis oleh MySQL.
     * * @param title Judul baru.
     * @param content Isi baru.
     * @param isPinned Status pin awal (biasanya false).
     */
    public Note(String title, String content, boolean isPinned) {
        this.title = title;
        this.content = content;
        this.isPinned = isPinned;
    }

    /**
     * 4. Constructor untuk UPDATE (Mengedit Konten).
     * ---------------------------------------------
     * Digunakan oleh Servlet saat memproses form "Edit Note".
     * - Kita butuh 'id' untuk memberitahu database catatan mana yang diedit (WHERE id = ?).
     * - Kita butuh 'title' dan 'content' yang baru.
     * - Kita TIDAK mengubah status pin atau waktu create di sini.
     * * @param id ID catatan yang akan diedit.
     * @param title Judul revisi.
     * @param content Isi revisi.
     */
    public Note(int id, String title, String content) {
        this.id = id;
        this.title = title;
        this.content = content;
    }

    // ===========================
    // GETTERS & SETTERS
    // ===========================
    
    /** Mengambil ID catatan. */
    public int getId() { return id; }
    /** Mengubah ID catatan. */
    public void setId(int id) { this.id = id; }
    
    /** Mengambil judul catatan. */
    public String getTitle() { return title; }
    /** Mengubah judul catatan. */
    public void setTitle(String title) { this.title = title; }
    
    /** Mengambil isi konten. */
    public String getContent() { return content; }
    /** Mengubah isi konten. */
    public void setContent(String content) { this.content = content; }
    
    /** * Mengecek apakah catatan di-pin. 
     * (Penamaan getter boolean menggunakan 'is' bukan 'get').
     */
    public boolean isPinned() { return isPinned; }
    /** Mengubah status pin. */
    public void setPinned(boolean pinned) { isPinned = pinned; }

    /** Mengambil waktu pembuatan. */
    public Timestamp getCreatedAt() { return createdAt; }
    /** Mengubah waktu pembuatan. */
    public void setCreatedAt(Timestamp createdAt) { this.createdAt = createdAt; }

    /** Mengambil waktu update terakhir. */
    public Timestamp getUpdatedAt() { return updatedAt; }
    /** Mengubah waktu update terakhir. */
    public void setUpdatedAt(Timestamp updatedAt) { this.updatedAt = updatedAt; }
}