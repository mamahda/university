<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<%@ page isELIgnored="false" %>
<!DOCTYPE html>
<html>
<head>
    <title>My Notes</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <link rel="stylesheet" href="${pageContext.request.contextPath}/css/home.css">
</head>
<body>
<div class="container">
    
    <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
            <h2 class="fw-bold text-dark mb-0">Notes</h2>
            <small class="text-muted">Hi, ${sessionScope.user.username}</small>
        </div>
        <div>
            <a href="deleteAll" class="btn btn-outline-danger btn-sm me-2" onclick="return confirm('Hapus semua?')">Clear All</a>
            <a href="${pageContext.request.contextPath}/auth/logout" class="btn btn-dark btn-sm">Logout</a>
        </div>
    </div>

    <form action="search" method="get" class="mb-4">
        <div class="input-group">
            <span class="input-group-text bg-white border-end-0"><i class="fas fa-search text-muted"></i></span>
            <input type="text" name="keyword" class="form-control border-start-0" placeholder="Search notes...">
        </div>
    </form>

    <div class="row g-3">
        <c:forEach var="note" items="${listNotes}">
            <div class="col-md-4 col-sm-6 mb-3">
                <div class="card note-card ${note.pinned ? 'pinned' : ''}">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <h5 class="note-title text-truncate w-75 mb-0">${note.title}</h5>
                        <div>
                            <a href="pin?id=${note.id}" class="text-warning me-2"><i class="${note.pinned ? 'fas' : 'far'} fa-star"></i></a>
                            <a href="delete?id=${note.id}" class="text-danger" onclick="return confirm('Delete?')"><i class="far fa-trash-alt"></i></a>
                        </div>
                    </div>
                    <a href="edit?id=${note.id}" class="text-decoration-none">
                        <p class="note-excerpt">${note.content}</p>
                        <div class="note-date">${note.updatedAt}</div>
                    </a>
                </div>
            </div>
        </c:forEach>
    </div>
    
    <a href="new" class="btn-fab text-decoration-none"><i class="fas fa-plus"></i></a>
</div>
</body>
</html>