# 1차 → 2차 스프린트 기술 전환 결정 근거

작성: 2026-10-21 / 상태: 킥오프 검토안. DB 제품·버전, 기본 패키지, 기능별 MyBatis/JPA 책임과 공수는 팀 합의 후 확정한다. 아래 내용은 계획·코드 확인 근거이며 DB 이관·테스트·성능 측정이 완료되었다는 뜻이 아니다.

## 확인한 1차 기준과 후속 이력

1차 완료 기준은 2026-10-08의 [4f66004](https://github.com/AgriBioLab/AgriBioLab/commit/4f66004e2615603e88f283bdc1222f4acc40abb6)이다.

|근거|확인 내용|2차 전환 판단에 사용하는 이유|
|---|---|---|
|[1차 Query.java](https://github.com/AgriBioLab/AgriBioLab/blob/4f66004e2615603e88f283bdc1222f4acc40abb6/src/main/java/util/Query.java)|지급결과 다중 조인, 조건 검색, TO_DATE·TO_CHAR, 상세/서류/금액 조회|기존 SQL 결과 보존과 DB 구문·일시·금액·연결 정합성 점검 기준|
|[1차 CompensationListDAO](https://github.com/AgriBioLab/AgriBioLab/blob/4f66004e2615603e88f283bdc1222f4acc40abb6/src/main/java/model/dao/CompensationListDAO.java)|Connection 전달, JDBC·조건 SQL 직접 처리|Spring의 연결/트랜잭션 관리와 데이터 접근 계층 책임 분리 기준|
|[현재 ActionFactory](https://github.com/AgriBioLab/AgriBioLab/blob/64ffc629b3cbd8e674946921f26592f7ad189db8/src/main/java/servlet/ActionFactory.java)|cmd 분기·수동 생성과 예외 처리|Spring 요청 매핑·DI·공통 예외 처리로 이관할 책임|
|[현재 상세 Action](https://github.com/AgriBioLab/AgriBioLab/blob/64ffc629b3cbd8e674946921f26592f7ad189db8/src/main/java/servlet/compensationDetailAction.java)|여러 DAO 호출·처리 기간 계산·요청/뷰 결합|Controller/Service 분리 및 중복/순차 조회 측정 기준|
|[목록 테스트 보강 PR #60](https://github.com/AgriBioLab/AgriBioLab/pull/60)|2026-10-19 후속 보강 이력|완료 보강을 보존·재사용하고 10/8 소급 완료 이력과 구분|
|사용자 제공 팀 회고|업무 이해·용어·UI/ERD 누락, 필터별 테스트, 순차 조회 지연, 회의 목적/결정 기준|명명·설계 크로스체크·테스트·응답 측정·결정 기록의 우선순위|

실제 DB 서버 버전·DDL 전체·전체 데이터 건수와 전환 시간은 아직 확인되지 않았다. 조회 결과·성능·비용 개선을 측정 전 확정하지 않는다.

## Spring 전환 구조

요청 → DispatcherServlet/Controller → Service → MyBatis Mapper 또는 JPA Repository → DB. 화면에는 DTO와 합의한 형식을 전달한다. 연결 설정·트랜잭션·공통 예외 처리의 책임을 명시한다. Spring MVC/Boot와 라이브러리의 실제 버전은 팀 기준에 맞춰 확정한다.

[Spring MVC 요청 처리](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-servlet.html)와 [Spring DataSource](https://docs.spring.io/spring-framework/reference/data-access/jdbc/connections.html)는 이 역할 분리의 기술 참고다.

## MyBatis와 JPA 적용 기준

두 기술은 Spring 전환에 포함한다. 기능별 적용은 아래 근거로 결정한다.

|기준|적용 방향|프로젝트 근거·확인 사항|
|---|---|---|
|다중 조인·동적 검색·집계 SQL을 직접 관리할 필요|MyBatis를 우선 검토|기존 지급결과 SQL의 보존, 품질담당자 통계·전년도 비교의 집계/필터·DTO|
|단순 CRUD·엔티티 관계·변경 생명주기를 일관되게 관리할 필요|JPA 적용 범위를 선택|생산자 기본정보·계정 등 기능의 관계/쓰기 책임·변경 규칙을 먼저 설계|
|같은 테이블을 두 기술이 사용하는 경우|조회·쓰기 책임과 Service 트랜잭션을 명시|중복 수정·저장 후 조회 불일치·부분 저장 방지|
|검증 근거|같은 입력/데이터에서 결과·예외·롤백을 확인|기존 기능 회귀와 신규 업무의 완료 기준 충족|

기술 적용표: 기능 / 업무 목적 / 테이블 / MyBatis 또는 JPA / 조회·쓰기 책임 / 대안 / 선택 이유 / 테스트 / 결정자·일자 / 미결 사항.

JPA 적용과 DB 제품 선택은 서로 구분해 평가한다. JPA를 도입해도 native SQL은 DB 플랫폼에 종속될 수 있으므로 SQL·스키마·데이터 전환 검증을 별도로 수행한다. [Spring Data JPA 쿼리 문서](https://docs.spring.io/spring-data/jpa/reference/jpa/query-methods.html)

## MySQL·MariaDB 선택 기준

DB 전환의 목적은 팀의 실행/배포 환경 재현, Spring 데이터 접근 계층과의 일관된 연동, 운영·유지보수 가능한 기반 마련으로 제안한다. 전환 전후의 업무 결과를 보존하면서 이 목적을 충족할 수 있는지 확인해 채택한다. 두 제품의 실제 점수와 우열은 아직 미정이다.

필수 통과 조건: 기존 기능 회귀, 테이블 건수·키/관계·NULL/빈 문자열·한글·일시·금액/집계 정합성, 재현 가능한 이관/복구, 핵심 기능·마지막 주 검증 일정을 지킬 수 있는 작업량.

|평가 항목|가중치 제안|확인 증거|MySQL|MariaDB|
|---|---:|---|---|---|
|기존 SQL/스키마 호환성|30|TO_DATE/TO_CHAR 등 변경 목록·타입/키·대표 쿼리 결과|미측정|미측정|
|환경 재현·배포 적합성|25|팀원 재현 절차·배포 대상의 버전/드라이버/설정|미확인|미확인|
|Spring/MyBatis/JPA 연동|20|저장·조회·트랜잭션·롤백·재조회 테스트|미검증|미검증|
|유지보수 부담|15|운영 설정·변경 범위·문서화·팀 이해도|미산정|미산정|
|일정 내 전환 공수|10|DDL/데이터 규모·SQL 수정·이관/회귀 소요 시간|미산정|미산정|

가중치는 팀이 합의할 초안이다. 필수 조건을 통과한 대상을 비교하고 선택 이유·포기한 대안·남은 위험·복구 방법을 기록한다. 점수 차이가 작으면 팀의 배포 환경·재현성과 유지보수 기준으로 결정한다.

MariaDB는 Oracle 호환 모드를 제공하지만 지원 범위·버전·동작 차이를 확인해야 한다. 자동 호환 완료로 간주하지 않는다. [MariaDB Oracle 모드](https://mariadb.com/docs/release-notes/community-server/about/compatibility-and-differences/sql_modeoracle)

지급금액·합계와 비교 비율은 정수 범위/소수 자릿수·반올림 규칙을 정의하고 확인한다. DB를 바꾸면서 타입을 임의 변환하지 않는다. [MySQL 정밀 수치 처리](https://dev.mysql.com/doc/refman/8.4/en/precision-math.html)

## 일정·완료 증거

- 10/22~23 SCRUM-47: 명명·구조·예외·DB/데이터 접근 선택 기준 및 영향 분석. 제품/버전의 팀 선택과 미결 항목 기록.
- 10/23 SCRUM-48: 대표 Spring 요청·화면·DB 경로 전환.
- 10/26~27 SCRUM-71: MyBatis/JPA 연동과 선택 DB의 대표 데이터/SQL·트랜잭션·이관 검증.
- 10/26~28 SCRUM-49: 기존 기능 전환·선택한 DB 변경 반영·회귀·최종 전환 리뷰. 전체 이관 범위와 공수는 실제 규모를 확인해 확정한다.
- 10/26~28 SCRUM-50·53·72: 업무별 분석·설계와 적용 책임/화면/ERD 리뷰.
- 10/30 SCRUM-69: 전환 결과·공수·가용 페어를 바탕으로 범위 조정.
- 11/9~13: 통합 테스트·요구사항 검증·수정·발표 준비. 발표에는 실제 선택 이유와 결과를 사용한다.

