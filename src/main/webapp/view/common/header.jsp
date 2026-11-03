<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%-- 로그인 연결 전까지 담당자 표시는 기존 샘플입니다. --%>
<header class="top-header"><div class="header-inner">
<a class="logo" href="${pageContext.request.contextPath}/main.html"><div class="logo-icon">logo</div><span>모두의온실</span></a>
<div class="header-right"><span class="user-name">품질담당자 이*규님</span><a class="logout-btn" href="${pageContext.request.contextPath}/controller?cmd=qualityOfficerLogout">로그아웃</a></div>
</div></header>
<nav class="html-menu" aria-label="주요 메뉴">
<div class="html-menu-inner">
    <span aria-disabled="true">품질통계 조회</span>
    <a href="${pageContext.request.contextPath}/controller?cmd=compensationListUI" aria-current="page">보상처리 지급결과</a>
    <span aria-disabled="true">피해조치 결과 조회</span>
</div>
</nav>
