package com.notes.dao;

import com.notes.model.User;
import com.notes.util.DB;
import java.sql.*;

/**
 * UserDAO (Data Access Object)
 * ----------------------------
 * Kelas ini bertanggung jawab untuk menangani manajemen data Pengguna (User).
 * Fokus utamanya adalah pada proses Autentikasi (Login) dan Registrasi akun baru.
 * * * CATATAN KEAMANAN:
 * Dalam contoh kode pembelajaran ini, password disimpan dalam bentuk teks biasa (Plain Text).
 * Untuk aplikasi produksi (Real World), password WAJIB di-hash menggunakan algoritma 
 * seperti BCrypt atau Argon2 sebelum disimpan ke database demi keamanan.
 */
public class UserDAO {

    /**
     * Authenticate (Login Logic)
     * --------------------------
     * Memeriksa apakah kombinasi username dan password cocok dengan data di database.
     * * * @param username Username yang diinputkan user.
     * @param password Password yang diinputkan user.
     * @return User Objek User jika login berhasil (data ditemukan), 
     * atau null jika username/password salah.
     */
    public User authenticate(String username, String password) {
        User user = null;
        // Try-with-resources: Otomatis menutup Connection, Statement, dan ResultSet
        try (Connection conn = DB.getConnection();
             // Query SELECT untuk mencari user yang cocok
             PreparedStatement ps = conn.prepareStatement("SELECT * FROM users WHERE username = ? AND password = ?")) {
            
            ps.setString(1, username);
            ps.setString(2, password); // Note: Di sistem nyata, hash password input dulu baru compare
            
            ResultSet rs = ps.executeQuery();
            
            // Jika rs.next() true, berarti user ditemukan
            if (rs.next()) {
                // Mapping data dari SQL ke Object Java User
                user = new User(
                    rs.getInt("id"), 
                    rs.getString("username"), 
                    rs.getString("password")
                );
            }
        } catch (SQLException e) { 
            e.printStackTrace(); 
        }
        return user;
    }

    /**
     * Register (Sign Up Logic)
     * ------------------------
     * Mendaftarkan pengguna baru ke dalam database.
     * * * @param user Objek User baru yang berisi username dan password.
     * @return boolean True jika registrasi berhasil, 
     * False jika gagal (biasanya karena username sudah dipakai).
     */
    public boolean register(User user) {
        try (Connection conn = DB.getConnection();
             PreparedStatement ps = conn.prepareStatement("INSERT INTO users (username, password) VALUES (?, ?)")) {
            
            ps.setString(1, user.getUsername());
            ps.setString(2, user.getPassword());
            
            // Eksekusi insert
            int rowsAffected = ps.executeUpdate();
            
            // Jika ada baris yang bertambah, berarti berhasil
            return rowsAffected > 0;
            
        } catch (SQLException e) { 
            e.printStackTrace();
            // Mengembalikan false jika terjadi error (misal: Duplicate Entry untuk username)
            return false; 
        }
    }
}