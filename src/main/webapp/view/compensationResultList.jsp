<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"%>
    
    <%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c"%>
    
    <!DOCTYPE html>
<html lang="ko">
<head>
<%@ include file="common/head.jsp" %>

<title>모두의온실 - 보상처리결과 조회</title>

<!-- 검색영역 CSS -->
<link rel="stylesheet" href="${pageContext.request.contextPath}/resources/css/searchBox.css?v=20261006">
<!-- 목록 표 CSS -->
<link rel="stylesheet" href="${pageContext.request.contextPath}/resources/css/table.css">
</head>

<body class="menu-comp">

	<%@ include file="common/header.jsp" %>

	<!-- ============= PAGE LAYOUT ============= -->
	<div class="page-layout">

		<!-- ============= SIDE MENU (메뉴별 공통) ============= -->
		<%@ include file="common/side_compensationResult.jsp" %>

		<!-- ============= CONTENT ============= -->
		<main class="content">

			<!-- Breadcrumb -->
			<nav class="breadcrumb">
				<span>홈</span> &gt; <span>보상처리결과 조회</span>
			</nav>

			<!-- Page Title -->
			<h1 class="page-title">보상처리결과 조회</h1>

			<!-- ============= SEARCH ============= -->
			<!-- 보상 기준 목록: 한 줄 = 조치완료된 피해신청 1건의 보상 (조회 키는 피해신청번호) -->
			<form class="search-box">

				<!-- 보상금 지급일 기간 (지급결과 기준 조회) -->
				<div class="search-row">

					<label class="search-label" for="startDate">보상금 지급일</label> <input type="date" id="startDate" name="startDate" class="search-input date" value="2026-09-01"> <span class="date-separator">
						~ </span> <input type="date" id="endDate" name="endDate" class="search-input date" value="2026-09-30" title="기간 종료일">

				</div>

				<!-- 피해신청번호 -->
				<div class="search-row">

					<label class="search-label" for="applyNo">피해신청번호</label> <input type="text" id="applyNo" name="applyNo" class="search-input normal" placeholder="REQ-2026-000136">

				</div>

				<!-- 단체/상호명 (신청 업체) -->
				<div class="search-row">

					<label class="search-label" for="bizName">단체/상호명</label> <input type="text" id="bizName" name="bizName" class="search-input normal" placeholder="행복농장">

				</div>

				<!-- 대표자명 (이름 전체로 검색, 목록에는 가려서 표시, 개인농가는 신청인 본인) -->
				<div class="search-row">

					<label class="search-label" for="ownerName">대표자명</label> <input type="text" id="ownerName" name="ownerName" class="search-input normal" placeholder="김현아">

				</div>

				<!-- 구분 (보상 대상은 생산자·유통자·판매자 모두 가능) -->
				<div class="search-row">

					<span class="search-label">구분</span>
					<div class="radio-group">
						<label><input type="radio" name="targetType" value="" checked> 전체</label>
						<label><input type="radio" name="targetType" value="PRODUCER"> 생산자</label>
						<label><input type="radio" name="targetType" value="DISTRIBUTOR"> 유통자</label>
						<label><input type="radio" name="targetType" value="SELLER"> 판매자</label>
					</div>

				</div>

				<!-- 품목명 -->
				<div class="search-row">

					<label class="search-label" for="itemName">품목명</label> <input type="text" id="itemName" name="itemName" class="search-input normal" placeholder="사과">

				</div>

				<!-- 검색 / 초기화 -->
				<div class="search-row full search-actions">

					<button type="button" class="search-btn">검색</button>
					<button type="reset" class="reset-btn">초기화</button>

				</div>

			</form>

			<!-- ============= RESULT ============= -->
			<div class="result-info">

				<span class="result-count">검색 결과</span> <span>총<strong>3</strong>건</span>

			</div>

			<!-- ============= TABLE ============= -->
			<!-- 좁은 화면에서는 표 영역 안에서만 가로 스크롤 -->

			<div class="table-wrap">
				<table class="list-table">
					<caption class="sr-only">보상처리 목록</caption>

					<thead>
						<tr>
							<th scope="col">피해신청번호</th>
							<th scope="col">구분</th>
							<th scope="col">단체/상호명</th>
							<th scope="col">대표자</th>
							<th scope="col">품목명</th>
							<th scope="col">최종 보상금</th>
							<th scope="col">보상금 지급일</th>
							<th scope="col">보상급 지급 기관</th>
						</tr>
					</thead>

					<!-- 샘플 데이터: 보상금 지급일 최신순 (MVC2 전환 시 c:forEach 로 교체) -->
					<tbody>

    					<c:forEach items="${compensationList}" var="compensation" >
        					<tr>
            					<td>
							<a class="case-link" href="${pageContext.request.contextPath}/controller?cmd=compensationDetailAction&amp;appId=${compensation.appId}">
                    					${compensation.appId}
                					</a>
            					</td>
            					<td>${compensation.appCategory}</td>
            					<td>${compensation.organizationName}</td>
            					<td>${compensation.representativeName}</td>
            					<td>${compensation.productName}</td>
            					<td>${compensation.paymentAmount}원</td>
            					<td>${compensation.paymentCompletionDate}</td>
            					<td>${compensation.paymentInstitution}</td>
        					</tr>
    					</c:forEach>

					</tbody>
				</table>
			</div>

		</main>

	</div>
	

</body>
</html>
    
