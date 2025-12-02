package com.notes.servlet;

import com.notes.dao.NoteDAO;
import com.notes.model.Note;
import com.notes.model.User;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.*;
import java.io.IOException;
import java.util.List;

/**
 * NoteServlet (Main Controller)
 * -----------------------------
 * Kelas ini bertindak sebagai "Front Controller" untuk fitur utama aplikasi Notes.
 * Semua request (kecuali auth) akan melewati servlet ini terlebih dahulu.
 * * Fitur Utama:
 * 1. Security Gatekeeper: Memastikan hanya user yang sudah Login yang bisa mengakses.
 * 2. Routing: Mengarahkan URL ke logika bisnis yang tepat (List, Add, Edit, Delete).
 * 3. User Isolation: Meneruskan ID User ke DAO agar data antar pengguna tidak tercampur.
 * 4. Static Resource Handler: Menangani request untuk file CSS/Aset.
 * * @WebServlet("/") menangani root path dan semua sub-path yang tidak didefinisikan lain.
 */
@WebServlet("/")
public class NoteServlet extends HttpServlet {
    
    private static final long serialVersionUID = 1L;
    private NoteDAO noteDAO;

    /**
     * init()
     * ------
     * Method lifecycle servlet. Dijalankan satu kali saat server start.
     * Digunakan untuk menginisialisasi koneksi DAO.
     */
    public void init() { 
        noteDAO = new NoteDAO(); 
    }

    /**
     * Helper: Mendapatkan User dari Session.
     * -------------------------------------
     * @param request Objek request HTTP.
     * @return User Objek user jika sedang login, atau null jika belum login/session habis.
     * * Catatan: getSession(false) berarti "Ambil session jika ada, jangan buat baru jika tidak ada".
     */
    private User getSessionUser(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        return (session != null) ? (User) session.getAttribute("user") : null;
    }

    /**
     * doGet()
     * -------
     * Pusat Logika Routing. Menangani semua request GET (dan POST yang di-delegate ke sini).
     */
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        String action = request.getServletPath();

        // ==========================================
        // 1. STATIC ASSET HANDLING (CSS/JS/IMAGES)
        // ==========================================
        // Karena servlet ini mapped ke "/", dia akan menangkap request CSS juga.
        // Kita harus bypass request yang diawali "/css/" ke Default Servlet Tomcat
        // agar file statis bisa dimuat browser.
        if (action.startsWith("/css/")) {
            request.getServletContext().getNamedDispatcher("default").forward(request, response);
            return; // Stop eksekusi di sini
        }

        // ==========================================
        // 2. AUTHENTICATION CHECK (SECURITY)
        // ==========================================
        // Cek apakah user ada di session.
        User user = getSessionUser(request);
        
        // Jika user BELUM login DAN user tidak sedang mengakses halaman auth (login/register),
        // maka tendang (redirect) paksa ke halaman login.
        if (user == null && !action.startsWith("/auth")) {
            response.sendRedirect(request.getContextPath() + "/view/login.jsp");
            return; // Stop eksekusi agar kode di bawah tidak jalan (mencegah error NullPointer)
        }

        // ==========================================
        // 3. ROUTING LOGIC (SWITCH-CASE)
        // ==========================================
        switch (action) {
            // --- Form Views ---
            case "/new": showNewForm(request, response); break;
            case "/edit": showEditForm(request, response, user); break;
            
            // --- Database Actions ---
            case "/save": saveNote(request, response, user); break;       // Create & Update (Upsert)
            case "/delete": deleteNote(request, response, user); break;   // Delete One
            case "/deleteAll": deleteAllNotes(request, response, user); break; // Delete All
            case "/pin": togglePin(request, response, user); break;       // Toggle Favorite
            case "/search": searchNotes(request, response, user); break;  // Search
            
            // --- Default View (Home) ---
            case "/notes":
            case "/":
            case "":
                listNotes(request, response, user); break;
            
            // --- 404 Handling ---
            default: 
                // Pastikan bukan route auth sebelum melempar 404
                if (!action.startsWith("/auth")) show404(request, response);
                break;
        }
    }

    /**
     * doPost()
     * --------
     * Meneruskan semua request POST (dari Form) ke doGet() agar logic terpusat.
     */
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        doGet(request, response);
    }

    // ============================================================
    // LOGIC METHODS (PRIVATE)
    // Semua method ini menerima parameter 'User' untuk Data Isolation
    // ============================================================

    /**
     * Menampilkan daftar catatan milik user yang sedang login.
     */
    private void listNotes(HttpServletRequest request, HttpServletResponse response, User user) throws ServletException, IOException {
        // PENTING: Kita kirim user.getId() ke DAO.
        // Ini memastikan query SQL menggunakan "WHERE user_id = ...".
        List<Note> listNotes = noteDAO.selectAllNotes(user.getId());
        
        request.setAttribute("listNotes", listNotes);
        request.getRequestDispatcher("view/home.jsp").forward(request, response);
    }

    /**
     * Mencari catatan berdasarkan keyword, khusus milik user tersebut.
     */
    private void searchNotes(HttpServletRequest request, HttpServletResponse response, User user) throws ServletException, IOException {
        String keyword = request.getParameter("keyword");
        List<Note> listNotes = noteDAO.searchNotes(keyword, user.getId());
        
        request.setAttribute("listNotes", listNotes);
        request.getRequestDispatcher("view/home.jsp").forward(request, response);
    }

    /**
     * Menampilkan form tambah baru.
     * Tidak butuh objek User karena formnya kosong.
     */
    private void showNewForm(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        request.getRequestDispatcher("view/add.jsp").forward(request, response);
    }

    /**
     * Menampilkan form edit.
     * Mengambil data note lama berdasarkan ID Note DAN ID User (Security Check).
     */
    private void showEditForm(HttpServletRequest request, HttpServletResponse response, User user) throws ServletException, IOException {
        int id = Integer.parseInt(request.getParameter("id"));
        
        // DAO akan cek: SELECT * FROM notes WHERE id = ? AND user_id = ?
        // Jika user mencoba mengedit ID punya orang lain, hasilnya null.
        Note existingNote = noteDAO.selectNote(id, user.getId());
        
        request.setAttribute("note", existingNote);
        request.getRequestDispatcher("view/edit.jsp").forward(request, response);
    }

    /**
     * Logic UPSERT (Update or Insert).
     * Menentukan apakah ini simpan baru atau update lama berdasarkan keberadaan ID.
     */
    private void saveNote(HttpServletRequest request, HttpServletResponse response, User user) throws IOException {
        String idStr = request.getParameter("id");
        String title = request.getParameter("title");
        String content = request.getParameter("content");

        // Jika ID kosong/null -> 0 (Insert). Jika ada -> Parse Int (Update).
        int id = (idStr == null || idStr.isEmpty()) ? 0 : Integer.parseInt(idStr);
        
        Note note = new Note(id, title, content);

        // Serahkan ke DAO untuk disimpan sesuai User ID
        noteDAO.saveNote(note, user.getId());
        
        // Redirect (bukan Forward) untuk mencegah Double Submission saat refresh
        response.sendRedirect("notes");
    }

    /**
     * Menghapus satu catatan.
     */
    private void deleteNote(HttpServletRequest request, HttpServletResponse response, User user) throws IOException {
        int id = Integer.parseInt(request.getParameter("id"));
        noteDAO.deleteNote(id, user.getId());
        response.sendRedirect("notes");
    }

    /**
     * Menghapus SEMUA catatan milik user tersebut saja.
     */
    private void deleteAllNotes(HttpServletRequest request, HttpServletResponse response, User user) throws IOException {
        noteDAO.deleteAllNotes(user.getId());
        response.sendRedirect("notes");
    }

    /**
     * Mengubah status Pin (Favorit).
     */
    private void togglePin(HttpServletRequest request, HttpServletResponse response, User user) throws IOException {
        int id = Integer.parseInt(request.getParameter("id"));
        noteDAO.togglePin(id, user.getId());
        response.sendRedirect("notes");
    }

    /**
     * Menangani URL yang salah ketik/tidak ada.
     */
    private void show404(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setStatus(HttpServletResponse.SC_NOT_FOUND);
        request.getRequestDispatcher("view/404.jsp").forward(request, response);
    }
}