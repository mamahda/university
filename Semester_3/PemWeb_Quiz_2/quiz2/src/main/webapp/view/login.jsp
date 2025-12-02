<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<%@ page isELIgnored="false" %>
<!DOCTYPE html>
<html>
<head>
    <title>Login</title>
    <link rel="stylesheet" href="${pageContext.request.contextPath}/css/auth.css">
</head>
<body>
    <div class="auth-card">
        <h2>Welcome Back</h2>
        <c:if test="${not empty error}"><span class="error-msg">${error}</span></c:if>
        <c:if test="${param.registered}"><span style="color:green;display:block;margin-bottom:15px">Registration Successful! Please Login.</span></c:if>
        
        <form action="${pageContext.request.contextPath}/auth/login" method="post">
            <input type="text" name="username" class="auth-input" placeholder="Username" required>
            <input type="password" name="password" class="auth-input" placeholder="Password" required>
            <button type="submit" class="auth-btn">Login</button>
        </form>
        <a href="${pageContext.request.contextPath}/view/register.jsp" class="auth-link">
            Create an account
        </a>
    </div>
</body>
</html>