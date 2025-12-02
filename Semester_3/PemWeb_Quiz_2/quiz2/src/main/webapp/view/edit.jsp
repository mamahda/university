<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<%@ page isELIgnored="false" %>

<!DOCTYPE html>
<html>
<head>
    <title>Edit Note</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="${pageContext.request.contextPath}/css/edit.css">
</head>
<body>

<div class="container">
    <form action="save" method="post">
        <input type="hidden" name="id" value="${note.id}">
        
        <div class="d-flex justify-content-between align-items-center mb-4">
            <a href="./notes" class="text-warning text-decoration-none fw-bold fs-5">&lt; Notes</a>
            <button type="submit" class="btn btn-link text-warning text-decoration-none fw-bold fs-5">Save</button>
        </div>

        <input type="text" name="title" class="input-title" value="${note.title}" placeholder="Title" required autocomplete="off">

        <textarea name="content" class="input-content" placeholder="Type something...">${note.content}</textarea>
    </form>
</div>

</body>
</html>