package com.notes.model;

/**
 * Model: User (Pengguna)
 * ----------------------
 * Kelas ini merepresentasikan entitas data 'User' dari tabel 'users' di database.
 * Berfungsi sebagai objek yang menyimpan informasi kredensial pengguna (Authentication).
 * * * Peran dalam Aplikasi:
 * 1. Saat Login: Menampung data user yang ditemukan di database untuk disimpan di Session.
 * 2. Saat Register: Menampung input form dari user sebelum disimpan ke database.
 */
public class User {
    
    // ===========================
    // FIELDS (Atribut Data)
    // ===========================

    /** ID unik pengguna (Primary Key). Auto-increment dari Database. */
    private int id;

    /** Username untuk login (Bersifat Unik/Unique di Database). */
    private String username;

    /** * Password pengguna.
     * * CATATAN KEAMANAN:
     * Dalam class model ini, password disimpan sebagai String biasa.
     * Namun, sebelum data ini masuk ke database (di UserDAO), sebaiknya password
     * sudah di-hash (dienkripsi satu arah) untuk keamanan.
     */
    private String password;

    // ===========================
    // CONSTRUCTORS
    // ===========================

    /**
     * 1. Default Constructor (No-Args).
     * ---------------------------------
     * Wajib ada untuk standar JavaBeans.
     * Memungkinkan pembuatan objek User kosong: 'User user = new User();'
     */
    public User() {}

    /**
     * 2. Constructor Lengkap (Full All-Args).
     * ---------------------------------------
     * Digunakan oleh 'UserDAO.authenticate()'.
     * Saat user berhasil login, data mentah dari database (termasuk ID)
     * diambil dan dibungkus menggunakan constructor ini.
     * * @param id ID dari database.
     * @param username Username dari database.
     * @param password Password dari database.
     */
    public User(int id, String username, String password) {
        this.id = id;
        this.username = username;
        this.password = password;
    }

    /**
     * 3. Constructor untuk REGISTRASI (Tanpa ID).
     * -------------------------------------------
     * Digunakan oleh 'AuthServlet' saat menerima input form Register.
     * Saat user baru mendaftar, mereka belum punya ID (karena ID dibuat otomatis oleh DB).
     * Jadi kita hanya butuh Username dan Password.
     * * @param username Username baru yang diinput.
     * @param password Password baru yang diinput.
     */
    public User(String username, String password) {
        this.username = username;
        this.password = password;
    }

    // ===========================
    // GETTERS & SETTERS
    // ===========================

    /** Mengambil ID User. */
    public int getId() { return id; }
    /** Mengubah ID User. */
    public void setId(int id) { this.id = id; }

    /** Mengambil Username. */
    public String getUsername() { return username; }
    /** Mengubah Username. */
    public void setUsername(String username) { this.username = username; }

    /** Mengambil Password. */
    public String getPassword() { return password; }
    /** Mengubah Password. */
    public void setPassword(String password) { this.password = password; }
}