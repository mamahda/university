<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html>
<head>
    <title>Page Not Found</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <link rel="stylesheet" href="${pageContext.request.contextPath}/css/404.css">
</head>
<body>

<div class="container error-container">
    <div class="icon-404">
        <i class="far fa-file-excel"></i>
    </div>
    <h1 class="error-title">404</h1>
    <p class="mb-4">Oops! Halaman ini tidak ditemukan.</p>
    
    <a href="<%=request.getContextPath()%>/notes" class="btn-back shadow-sm">
        <i class="fas fa-arrow-left me-2"></i> Back to Notes
    </a>
</div>

</body>
</html>