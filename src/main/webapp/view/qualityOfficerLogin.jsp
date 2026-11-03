<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<!DOCTYPE html>
<html lang="ko">
<head>
<%@ include file="common/head.jsp" %>

<title>모두의온실 - 품질담당자 로그인</title>

<!-- 로그인 CSS -->
<link rel="stylesheet" href="${pageContext.request.contextPath}/resources/css/login.css">
</head>

<body class="login-page">

	<main class="login-wrap">
		<section class="login-panel" aria-labelledby="loginTitle">
			<div class="login-brand">
				<div class="login-logo">logo</div>
				<p class="login-system-name">모두의온실</p>
			</div>

			<h1 id="loginTitle" class="login-title">품질담당자 로그인</h1>

			<form action="${pageContext.request.contextPath}/controller" class="login-form" onsubmit="return login();">
				<div class="login-field">
					<label for="loginId">아이디</label>
					<input type="text" id="loginId" name="loginId" value="quality01" required autocomplete="username">
				</div>

				<div class="login-field">
					<label for="loginPassword">비밀번호</label>
					<div class="password-input-wrap">
						<input type="password" id="loginPassword" name="loginPassword" value="quality1234" required autocomplete="current-password">
						<button type="button" class="password-toggle" onclick="showPassword();">보이기</button>
					</div>
				</div>

				<button type="submit" class="login-submit">로그인</button>
			</form>
		</section>
	</main>

	<script src="${pageContext.request.contextPath}/resources/js/login.js?v=20261007"></script>

</body>
</html>
