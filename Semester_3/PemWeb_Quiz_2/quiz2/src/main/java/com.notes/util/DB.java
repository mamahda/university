package com.notes.util;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

/**
 * DB (Database Utility)
 * ---------------------
 * Kelas utilitas (Helper Class) yang berfungsi sebagai pusat manajemen koneksi database.
 * Kelas ini menggunakan pola "Static Factory Method" untuk menyediakan objek koneksi 
 * ke seluruh bagian aplikasi (DAO) tanpa perlu menulis ulang konfigurasi JDBC berulang kali.
 * * <p>Konfigurasi:</p>
 * <ul>
 * <li>Database: MySQL</li>
 * <li>Driver: MySQL Connector/J 8.0+</li>
 * <li>Schema: notesdb</li>
 * </ul>
 */
public class DB {
    
    // ===========================
    // KONFIGURASI DATABASE
    // ===========================
    
    /**
     * JDBC Connection URL.
     * Format: jdbc:mysql://[HOST]:[PORT]/[NAMA_DB]
     */
    private static final String URL = "jdbc:mysql://localhost:3306/notesdb";
    
    /** Username database MySQL (Default XAMPP/MAMP biasanya 'root'). */
    private static final String USER = "root";
    
    /** * Password database MySQL.
     * PERINGATAN KEAMANAN: 
     * Menyimpan password hardcoded seperti ini hanya aman untuk tahap Development/Belajar.
     * Untuk Production, gunakan Environment Variable atau Configuration File yang terenkripsi.
     */
    private static final String PASS = "221122"; 

    /**
     * Mendapatkan koneksi aktif ke database.
     * Method ini melakukan dua hal utama:
     * 1. Memuat driver JDBC ke dalam memori (Class Loading).
     * 2. Membuka jalur komunikasi (Socket) ke server database.
     * * @return Connection Objek koneksi java.sql yang siap digunakan.
     * @throws RuntimeException Jika driver tidak ditemukan atau autentikasi gagal. 
     * Kita membungkus 'SQLException' (Checked Exception) menjadi 'RuntimeException' (Unchecked)
     * agar kode DAO lebih bersih dan error langsung mematikan proses saat itu juga (Fail Fast).
     */
    public static Connection getConnection() {
        Connection connection = null;
        try {
            // 1. Load Driver JDBC
            // Memberitahu Java untuk memuat class driver MySQL ke memori.
            // "com.mysql.cj.jdbc.Driver" adalah nama class untuk MySQL Connector/J versi 8 ke atas.
            // (Versi lama 5.x menggunakan "com.mysql.jdbc.Driver")
            Class.forName("com.mysql.cj.jdbc.Driver"); 
            
            // 2. Establish Connection
            // DriverManager meminta driver yang sudah di-load untuk login ke database
            connection = DriverManager.getConnection(URL, USER, PASS);
            
        } catch (Exception e) {
            // Mencetak jejak error ke terminal/log server (penting untuk debugging)
            e.printStackTrace();
            
            // Melempar ulang error ke layer di atasnya (DAO/Servlet) dengan pesan yang jelas.
            // Ini penting agar jika koneksi mati, kita melihat pesan "GAGAL KONEKSI" di browser/log,
            // bukan sekadar NullPointerException.
            throw new RuntimeException("GAGAL KONEKSI KE DB: " + e.getMessage(), e);
        }
        return connection;
    }
}