package com.notes.servlet;

import com.notes.dao.UserDAO;
import com.notes.model.User;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.*;
import java.io.IOException;

/**
 * AuthServlet (Authentication Controller)
 * ---------------------------------------
 * Servlet ini khusus menangani alur Autentikasi pengguna: Login, Register, dan Logout.
 * * URL Mapping: "/auth/*"
 * Menggunakan wildcard (*) artinya Servlet ini akan menangkap semua request
 * yang diawali dengan /auth/, contohnya:
 * - /auth/login
 * - /auth/register
 * - /auth/logout
 */
@WebServlet("/auth/*")
public class AuthServlet extends HttpServlet {
    
    private static final long serialVersionUID = 1L;
    private UserDAO userDAO;

    /**
     * Inisialisasi DAO saat Servlet pertama kali dimuat.
     */
    public void init() { 
        userDAO = new UserDAO(); 
    }

    /**
     * doPost()
     * --------
     * Menangani pengiriman Form (Form Submission).
     * Digunakan untuk proses Login (cek kredensial) dan Register (simpan user baru).
     */
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        // getPathInfo() mengambil bagian URL setelah "/auth".
        // Contoh: Jika URL "/auth/login", maka pathInfo adalah "/login".
        String action = request.getPathInfo();
        
        // === 1. LOGIN LOGIC ===
        if ("/login".equals(action)) {
            // Cek database apakah user ada
            User user = userDAO.authenticate(request.getParameter("username"), request.getParameter("password"));
            
            if (user != null) {
                // --- SESSION MANAGEMENT (PENTING) ---
                // 1. Buat session baru (atau ambil yang sudah ada)
                HttpSession session = request.getSession();
                // 2. Simpan objek user ke dalam session. 
                // Ini adalah "tanda pengenal" bahwa user sudah login.
                session.setAttribute("user", user);
                
                // 3. Redirect ke halaman utama aplikasi
                response.sendRedirect(request.getContextPath() + "/notes");
            } else {
                // Login Gagal: Kembalikan ke halaman login dengan pesan error
                request.setAttribute("error", "Invalid Username or Password");
                request.getRequestDispatcher("/view/login.jsp").forward(request, response);
            }
        } 
        // === 2. REGISTER LOGIC ===
        else if ("/register".equals(action)) {
            User newUser = new User(request.getParameter("username"), request.getParameter("password"));
            
            // Coba simpan ke DB
            if (userDAO.register(newUser)) {
                // Berhasil: Redirect ke login dengan parameter sukses
                response.sendRedirect(request.getContextPath() + "/view/login.jsp?registered=true");
            } else {
                // Gagal (biasanya username kembar): Balik ke form register
                request.setAttribute("error", "Username already taken");
                request.getRequestDispatcher("/view/register.jsp").forward(request, response);
            }
        }
    }

    /**
     * doGet()
     * -------
     * Menangani request via Link atau URL langsung.
     * Utamanya digunakan untuk proses Logout.
     */
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        // === LOGOUT LOGIC ===
        if ("/logout".equals(request.getPathInfo())) {
            // Ambil session jika ada (false = jangan buat baru jika tidak ada)
            HttpSession session = request.getSession(false);
            
            if (session != null) {
                // Hapus Session (Invalidate). 
                // Ini menghapus semua data user yang tersimpan di server.
                session.invalidate();
            }
            
            // Redirect kembali ke halaman login
            response.sendRedirect(request.getContextPath() + "/view/login.jsp");
        }
    }
}