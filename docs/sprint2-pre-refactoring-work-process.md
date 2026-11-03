# AgriComp 2차 스프린트 착수 전 리팩토링 업무프로세스·실행 계획

작성일: 2026-10-22, 한국 시간  
상태: **코드 확인에 근거한 실행계획 초안 — 구현·팀 합의·실행 검증은 미완료**  
범위: 현황 분석, 작업 선정, 단계별 목차, 작업표, 검증·인계 기준. 이번 작성 중 애플리케이션 소스·DB·Git 브랜치·Jira 상태를 변경하지 않았다.

## 1. 먼저 정할 방향

우선 과제는 기존 **품질담당자 로그인 → 지급결과 목록·검색 → 상세 조회 → 로그아웃**을 재현하고, 공유 Connection·자원 종료·오류 구분·업무 책임을 정리하는 것이다. Spring MVC, MyBatis, JPA는 이 목적에 맞춰 선택한다. 학습 프로젝트의 의존성과 DB 자동 생성 설정을 그대로 복사하지 않는다.

Spring 전환을 선택하더라도 기존 JSP·요청 계약·Oracle 조회 결과를 보존하는 대표 경로부터 검증한다. 기존 SQL을 유지한 Service 분리와 연결 관리 개선도 가능한 실행 경로다. JPA 도입과 DB 제품 변경은 각각 별도 판단한다.

### 1.1 분석 기준과 버전 차이

| 구분 | 이번에 확인한 기준 | 사용 방법 |
|---|---|---|
| 원격 dev | `64ffc629b3cbd8e674946921f26592f7ad189db8` | 2026-10-22 GitHub 읽기 조회로 확인한 현재 통합 개발본. **주 분석 기준** |
| 원격 main | `f9c9a43aba6563ae6b9f4617cdb83f6f96300f3f` | 같은 날 확인한 제출·시연 기준. dev와 비교 |
| 로컬 작업 폴더 | `feat_commonLayoutCSS` / `81ac66394bc0806d4c06028699503ade62bca7c6` | 통합본 이전 버전. 현재 소스에 최신 변경이 모두 반영된 것으로 취급하지 않음 |
| 로컬 기존 변경 | `.project`, `src/main/java/util/DBCP.java`, 미추적 자료 | 보존 대상. 구현 착수 시 덮어쓰기·브랜치 전환 전에 변경별 소유와 반영 여부 확인 |
| 이전 리뷰·설계 문서 | `sprint1-latest-review.md`, `sprint2-refactoring-agreement.md`, `sprint2-architecture-decisions.md` | 과거 근거와 제안. 현재 코드·실제 합의 결과와 구분 |
| 로컬 SQL | `sql/01_create_tables.sql` 등 | 관계·타입을 대조할 참고 자료. 실제 서버에 적용된 스키마·데이터의 증거는 아님 |

현재 dev는 main보다 **목록 DAO 테스트 보강**이 추가되어 있다. 이미 반영된 지급문서 JOIN 수정, 한쪽 날짜 검색, 상세 필수 정보 누락 시 복귀 처리를 새 미수정 결함으로 등록하지 않는다. 배포 서버가 어느 SHA를 실행하는지는 추가 확인해야 한다.

출처: [원격 dev](https://github.com/AgriBioLab/AgriBioLab/tree/64ffc629b3cbd8e674946921f26592f7ad189db8), [원격 main](https://github.com/AgriBioLab/AgriBioLab/tree/f9c9a43aba6563ae6b9f4617cdb83f6f96300f3f), [기존 최신 리뷰](sprint1-latest-review.md).

### 1.2 이번 확인의 범위

수행: 원격 브랜치 SHA 읽기 확인, 로컬 Git의 동일 SHA 소스 열람, main/dev/작업본 차이 비교, 클래스·SQL·JSP·테스트·설정·기존 계획 정적 분석.

미수행: AgriComp DB 접속·DDL 실행, Tomcat 실행, HTTP·JUnit 재실행, 동시 요청 시험, 성능 측정, 배포 상태 확인. 아래의 ‘구현 확인’은 소스에 구현이 있다는 뜻이며 실제 실행 통과를 의미하지 않는다. 다른 실습 프로젝트 CJPA의 Oracle·테스트 결과는 AgriComp의 검증 결과로 사용하지 않는다.

## 2. 현재 기술 구성과 업무 범위

### 2.1 기술 구성

| 영역 | 코드에서 확인한 내용 | 적용 범위 판단 |
|---|---|---|
| 실행·개발 환경 | Java 17, Tomcat 9, Servlet 4.0 기반 Eclipse Dynamic Web Project 설정 | IntelliJ 도입 여부와 실행 환경 전환은 별도로 정함 |
| 웹 | `javax.servlet`, `/controller`, ActionFactory, Action, JSP/JSTL | Spring Controller나 DI 구현은 현재 없음 |
| 데이터 접근 | DAO가 JDBC Connection을 받아 Statement·PreparedStatement 실행 | 현행은 직접 JDBC. Service 계층 없음 |
| DB | Oracle JDBC 드라이버, Oracle 함수가 포함된 SQL | 실제 AgriComp DB 서버 버전·DDL 적용 상태는 미확인 |
| 라이브러리 | `ojdbc6.jar`, `mybatis-3.2.3.jar`, `jstl-1.2.jar`, `gson-2.8.9.jar`를 WEB-INF/lib에 보관 | MyBatis JAR의 존재와 실제 사용을 구분. Java 연동·Mapper XML은 확인되지 않음 |
| 빌드 | 분석 SHA에 Maven·Gradle 빌드 파일 없음 | 팀 실행·의존성 재현 절차를 먼저 고정 |
| 테스트 | JUnit 4 테스트가 `src/main/java/test`에 있음 | 최신 dev 기준 로그인 2, 목록 9, 상세 21개의 `@Test`. 총 32개는 테스트 정의 수이며 통과 수·커버리지가 아님 |

### 2.2 실제 사용자 업무 순서

1. 루트 `index.html` → `main.html` → 품질담당자 로그인 화면으로 진입한다.
2. 담당자가 로그인 ID·비밀번호를 제출하면 DAO가 담당자 정보를 조회한다.
3. 로그인 성공 시 `loginOK`, `loginName`, `loginPosition`을 세션에 저장하고 지급결과 목록으로 이동한다.
4. 목록에서 지급일·피해신청번호·단체/상호명·대표자명·구분·품목명 조건으로 검색한다. 검색조건과 건수를 표시한다.
5. 피해신청번호 `appId`를 선택해 상세 화면으로 이동한다.
6. 상세에서 신청·조사·조치·보상신청·산정·지급·관련 문서명을 조회하고, 처리 기간과 산정식 표시 문자열을 구성한다.
7. 로그아웃 시 세션을 무효화하고 로그인 화면을 보여준다.

여기서 **피해신청 → 현장조사 → 조치 확정·수행 → 보상신청·산정 → 지급**은 화면이 조회하는 업무 이력이다. 현재 코드가 각 단계의 등록·승인·지급을 실제 수행한다고 해석하지 않는다.

### 2.3 화면 → 요청 처리 → 업무 처리 → DB 연결

| 업무 | 진입·입력 | 현재 호출 관계 | SQL·주요 테이블 | 결과 |
|---|---|---|---|---|
| 로그인 | `qualityOfficerLogin.jsp`, `loginId`, `loginPassword` | FrontController → ActionFactory → QualityOfficerLoginAction → QualityOfficerDAO | `QUALITY_OFFICER_LOGIN`, `quality_assurance_officer` | 세션 저장 후 목록 redirect 또는 오류 문구 |
| 지급결과 목록·검색 | `cmd=compensationListUI`, 검색 7개 필드 | FrontController → CompensationListUIAction → CompensationListDAO | `GET_COMPENSATIONLIST` 등, `agriculture_damage_app`·`applicant`·`compensation_claim`·`compensation_payment` | 목록·건수·검색조건을 request에 넣어 JSP forward |
| 상세 | `cmd=compensationDetailAction`, `appId` | FrontController → compensationDetailAction → CompensationDetailDAO | 신청·조사·조치·보상·문서 테이블 조회 | 여러 VO·목록, 기간·산정식 문자열을 상세 JSP에 전달 |
| 로그아웃 | `cmd=qualityOfficerLogout` | FrontController → QualityOfficerLogoutAction | 업무 DB 호출 없음 | 세션 무효화, 로그인 JSP |

**현재 Service에 해당하는 독립 계층은 없다.** 상세 데이터 조합·기간 계산·표시 문자열 생성은 Action에 있다. Spring 전환 시에도 기존 요청 계약을 받아주는 어댑터를 둘 수 있으며, URL 변경은 별도 호환 작업으로 다룬다.

### 2.4 구현 상태

| 항목 | 분류 | 근거·남은 확인 |
|---|---|---|
| 담당자 로그인·세션·로그아웃 | 구현 확인 / 실행 미검증 | Action·DAO·JSP 존재. 실제 계정·실패·로그아웃 회귀 필요 |
| 지급완료 목록·복합 검색·건수·조건 유지 | 구현 확인 / 실행 미검증 | 지급완료일이 있는 데이터 조회. 한쪽 날짜 검색은 구현·테스트 정의 존재 |
| 상세 13개 DAO 조회 메서드 연결 | 구현 확인 / 실행 미검증 | 필수 요약·보상신청이 없으면 목록 복귀. 선택 정보 누락도 상황별 검증 필요 |
| 기존 이름 마스킹 | 구현 확인 / 회귀 대상 | PrivacyMaskingUtil과 DAO 호출 존재. 마스킹 기능 재개발을 별도 필수 작업으로 잡지 않음 |
| 문서 목록·파일 URL 조회 | 일부 구현 | 서류명 조회는 구현. JSP 다운로드 링크는 `href="#"`여서 실제 파일 제공은 미구현 |
| 직접 `/view/*.jsp` 접근 보호 | 미구현 / 기존 이관 과제 | 정식 controller 경로만 세션 검사. 직접 JSP 호출만으로 DAO 조회가 자동 실행되는 것은 아님 |
| Spring MVC·DI·Service·MyBatis Mapper·JPA | 미구현 | 기존 문서에 전환 제안은 있으나 코드에 적용된 것으로 확인되지 않음 |
| 통계·전년도 비교·생산자 가입·피해신청 저장·본인 조회 | 이번 기준 소스에 업무 구현 없음 | 2차 계획 문서의 신규 기능. 기존 기능 리팩토링과 구분 |
| 실제 ERD·DB 제약·다건 관계·산정금 의미 | 추가 확인 | 로컬 SQL과 실제 적용 DB, 업무 담당자의 설명을 교차 확인 |

## 3. 코드 근거에 따른 리팩토링 대상

E 번호는 문서 끝의 고정 SHA 소스 근거와 연결된다.

| 발견 | 확인 사실과 영향 | 제안 | 우선순위·작업 |
|---|---|---|---|
| F01 연결 공유·종료 | 로그인·목록 Action이 `static conn/dao`를 생성자에서 덮어쓴다. 해당 경로 Connection의 명시적 종료가 없음. 동시 충돌·고갈의 실제 발생 여부는 미측정 [E02, E03] | 요청 단위 소유·종료 보장, 사용하지 않는 로그인 목록 DAO 생성 제거 | P0 / R04 |
| F02 오류가 정상 결과와 혼합 | DAO가 SQLException을 출력하고 null·빈 목록·0을 반환. Factory도 생성자 DB 오류 후 null을 반환해 미등록 cmd와 동일한 404가 될 수 있음 [E01, E04] | 데이터 없음·인증 실패·DB 장애·잘못된 경로를 구분 | P0 / R05 |
| F03 Action의 책임 집중 | 상세 Action이 정상 경로에서 DAO 조회 메서드 13개를 순차 호출하고 기간·문자열·뷰 속성을 구성 [E05] | Service는 조합·업무 규칙, Action/Controller는 요청·응답, Formatter는 표시 책임 | P1 / R06 |
| F04 SQL·변환 중복 | 목록 기본 SQL과 검색 SQL의 SELECT/JOIN이 중복되고 DAO에 날짜·정렬 SQL 및 유사 ResultSet 매핑이 분산 [E04, E06] | 현재 결과를 보존하면서 SQL·행 매핑 한곳에서 관리. 필요하면 MyBatis 후보 검증 | P1 / R09 |
| F05 다건 중 첫 행 선택 | 조사 요약은 조사일 내림차순, 진행 이력은 동일한 최신 행 선택 규칙 없이 JOIN 후 첫 행 사용 [E06] | ‘최신/산정에 사용/전체 이력’ 중 업무 기준을 먼저 정함. 동률도 결정 가능하게 명시 | P1 / R10 |
| F06 금액·날짜·주석 의미 | 요약 VO의 finalCompensationAmount는 `payment_amount`에서, 산정 구역은 `FINAL_COMPENSATION_AMOUNT`에서 읽음. 상세 주석은 진행·부지급 기간도 설명하지만 실제 계산은 보상신청일~지급일 [E05, E07, E08] | 지급액·산정액·신청액 대응표와 실제 계산 범위를 명시. 수치·정의 변경은 별도 결함/요구사항으로 분리 | P1 / R10 |
| F07 입력 검증 경계 | 상세는 appId 공백 검사, 검색은 비어 있는지 확인하나 날짜 파싱·역전 범위·코드값의 서버 검증은 확인되지 않음 [E02, E05] | 검색 조건 객체·검증 책임을 정하고 기존 정상 검색 의미 보존 | P0 / R07 |
| F08 인증 경계·계정 처리 | controller 세션 검사는 있으나 직접 JSP 경로 보호는 이관 상태. 로그인은 SQL 비밀번호 동등 조건. 로그인 폼에 샘플 기본값 존재 [E01, E06, E08] | 경로별 접근 정책·샘플값 정리·인증 실패/장애 구분. 비밀번호 저장 형식과 기존 계정 전환은 별도 확인 | P0 경로 / R08, 후속 D04 |
| F09 실행·설정 재현 | 통합본 DBCP는 코드 내 접속 설정과 DriverManager를 사용. 클래스명만으로 연결 풀 사용을 주장할 수 없음. Maven/Gradle 빌드 없음 [E11] | 설정 외부화, 정확한 환경·의존성·기동·테스트 명령 고정 | P0 / R02 |
| F10 테스트·문서 불일치 | 최신 dev에 목록 테스트 보강이 있음. README는 JSP 초안·과거 화면명 설명. 테스트는 실제 fixture·연결 환경에 의존 [E09, E10] | 기존 32개 정의를 보존·재현하고 실패·경계·동시성 검증을 보강, README 갱신 | P0 / R03, R13 |

입력 SQL은 현재 PreparedStatement로 바인딩되는 경로가 있으며, 전체 목록 Statement는 입력값을 직접 붙이지 않는다. 직접 SQL 사용 자체를 취약점으로 판정하지 않는다. SQL 정리의 목적은 책임·중복·오류·조회 결과의 명확성이다.

현재 DAO의 업무 SQL은 조회 중심이다. 쓰기 트랜잭션 누락으로 데이터가 이미 부분 저장됐다고 판단할 근거는 없다. 신규 저장 기능을 시작하기 전에 Service 경계와 롤백 기준을 설계한다.

## 4. 기술 선택과 유지 조건

### 4.1 세 가지 실행 경로

| 경로 | 선택할 근거 | 영향·검증 | 이번 권고 |
|---|---|---|---|
| A. MVC2·JDBC 유지, Service·연결·오류 구조 개선 | 일정·기존 환경 보존이 우선이고 핵심 문제를 작은 변경으로 해소 가능 | Action 계약과 Oracle SQL 보존, 요청 단위 연결·예외·Service 검증 | 기술 선택 전에도 가능한 최소 개선안 |
| B. Spring MVC·DI + 기존 JDBC 또는 MyBatis | 팀 실행 환경 재현과 DI·공통 오류·트랜잭션 관리가 실제 요구이며 대표 기능 검증 가능 | 기존 cmd/세션/JSP 어댑터, Servlet namespace·JSP·배포·드라이버 조합 검증 | 기존 전환 검토안과 연결되는 **조건부 후보** |
| C. JPA 도입, 또는 DB 제품 변경 | 신규 쓰기 모델의 생명주기·관계 관리나 별도 DB 운영 요구가 검증됨 | 스키마·데이터·SQL·키·타입·트랜잭션·이관·복구 별도 검증 | 사전 리팩토링의 필수 조건에서 제외 |

기존 `sprint2-architecture-decisions.md`에는 Spring, MyBatis와 일부 JPA, DB 변경에 관한 검토 방향이 있다. 이 문서는 해당 방향을 구현·최종 합의로 간주하지 않고, 사용자의 이번 요청에 맞춰 대안·근거·미결 항목을 함께 둔다. 선택한 경로와 보류 사유는 R02/R12 결정 기록에 남긴다.

Spring Boot를 선택할 경우 JSP와 패키징을 먼저 실증한다. 현재 공식 문서는 실행형 JAR에서 JSP를 지원하지 않고 WAR 사용 조건을 안내한다. 학습용 JAR 프로젝트를 그대로 적용하기 전에 로그인 JSP·목록 JSP·정적 자원·배포를 대표 검증한다. [Spring Boot JSP 제약](https://docs.spring.io/spring-boot/reference/web/servlet.html#web.servlet.embedded-container.jsp-limitations)

MyBatis를 선택하면 목록의 다중 조인·동적 조건을 Mapper에 옮겨 같은 결과로 비교한다. JAR 추가만으로 전환 완료를 판정하지 않는다. 동적 조건 지원 참고: [MyBatis 공식 문서](https://mybatis.org/mybatis-3/dynamic-sql.html).

### 4.2 유지할 외부 계약

| 구분 | 현재 기준과 유지 조건 |
|---|---|
| URL | `/controller?cmd=qualityOfficerLoginUI`, `qualityOfficerLoginAction`, `qualityOfficerLogout`, `compensationListUI`, `compensationDetailAction` 유지 또는 호환 어댑터 제공 |
| 파라미터 | 로그인 `loginId/loginPassword`, 검색 `startDate/endDate/appId/organizationName/representativeName/appCategory/productName`, 상세 `appId` 유지 |
| 세션 | `loginOK/loginName/loginPosition` 및 로그인 후 이동·로그아웃 무효화 동작 유지. 내부 사용자 객체 변경은 어댑터로 흡수 |
| JSP 데이터 | 기존 request 속성·VO getter·JSP EL 대응표 유지. 내부 DTO 변경 시 viewCount·검색조건·상세 속성 누락 검사 |
| 조회 결과 | 지급완료 목록 조건, 신청일 기준 내림차순, 정확/부분 검색, 날짜 경계, 대표자 마스킹, 상세 문서의 소속 관계 유지 |
| 데이터 | 기존 테이블·PK/FK·시퀀스·NULL·한글·일시·금액 보존. 전환 작업에서 운영/공유 DB의 자동 스키마 변경을 활성화하지 않음 |
| 화면 | 현재 메뉴·목록/상세 이동·반응형·값과 단위·가림 표시 유지. 공통 CSS·헤더 변경은 별도 변경 묶음과 회귀 대상 |

내부 타입·패키지·Mapper 이름은 대응표로 관리한다. 로컬 소스의 오래된 클래스명만 보고 최신 통합본의 이름·경로를 되돌리지 않는다.

### 4.3 기존 동작과 달라질 수 있어 별도 판단할 항목

| 항목 | 현재 → 제안 | 이유·영향·처리 기준 |
|---|---|---|
| DB 장애 응답 | 빈 목록/로그인 실패/경우에 따라 404 → 장애 안내와 서버 오류 | 성공·실패 혼동 방지. 상태·문구·내부 로그 계약을 먼저 기록 |
| 잘못된 날짜·코드 | DB 함수 오류 또는 무시 가능 → 서버 입력 오류 안내 | 정상 검색은 보존. 화면은 입력값·오류 메시지 유지, 향후 API는 별도 상태 계약 정의 |
| 직접 JSP 접근 | controller 검사를 우회하는 경로 → 로그인/접근 정책 적용 | 실제 접근 범위 변경. 정상 controller forward·정적 자원·로그인 화면이 반복 이동하지 않아야 함 |
| 최신 조사일·동률·금액 정의 | 현행 첫 행/기존 필드 대응 → 합의한 명시 기준 | 업무 결과 변경 가능. 구조 변경 PR과 구분하고 기존/기대/변경 결과 및 결정자 기록 |
| 비밀번호 해시·DB·URL·다운로드 | 별도 기능/이관 설계 | 데이터·연동 계약이 바뀌므로 자동으로 사전 리팩토링에 포함하지 않음 |

## 5. 업무프로세스 목차

### 제1단계. 현황 분석 — 무엇을 보존할 것인가

1. 기준 브랜치·SHA·로컬 변경·배포본 확인
2. 로그인부터 지급결과 상세·로그아웃까지 업무 흐름 재현
3. URL·파라미터·세션·JSP 속성·SQL·테이블 대응표 작성
4. 구현 확인·미구현·실행 미검증 항목 구분
5. 대표 데이터·기대값·실행 환경·소유자 기록

### 제2단계. 대상 선정 — 무엇을 먼저 정리할 것인가

6. 연결 공유·오류 구분·입력·직접 JSP 접근의 필수 범위 선정
7. 상세 Action·SQL 중복·금액/날짜 정의의 개선 범위 선정
8. 기술 전환·신규 기능·DB 이관의 별도 범위 구분
9. 작업별 우선순위·선행 조건·담당·검토자 지정

### 제3단계. 설계 — 누가 어떤 책임을 맡을 것인가

10. Action/Controller·Service·DAO/Mapper·표시 모델 책임 설계
11. 연결 소유·종료·오류·트랜잭션·인증 정책 설계
12. 검색 조건·상세 결과·금액/기간·이력 선택 기준 설계
13. MVC2 유지와 Spring 전환의 대안 평가·결정 기록
14. 기존 계약 호환·시험 방법·되돌리기 절차 설계

### 제4단계. 구현 — 대표 경로부터 점진 적용하기

15. 환경·설정 재현과 회귀 테스트 기준 마련
16. 로그인·목록 연결 관리 및 오류 구분 개선
17. 입력 검증·접근 보호 적용
18. 상세 조합 Service·표시 책임 분리
19. SQL·행 매핑·명명 정리
20. 선택한 경우 Spring/MyBatis 대표 경로 검증 후 확대

### 제5단계. 검증 — 기존 결과와 같은가, 의도한 변경인가

21. 정상·빈 결과·선택 정보 누락·DB 장애 구분 검증
22. 검색 조합·날짜 경계·다건 관계·금액·문서 소속 검증
23. 로그인·로그아웃·직접 진입·세션·화면 회귀 검증
24. 연결 종료·동시 요청·트랜잭션 경계 검증
25. 변경 전후 기대값·실제값·차이·근거 기록

### 제6단계. 완료 검토 — 2차 신규 기능을 시작할 준비가 됐는가

26. 필수 작업 완료·미해결 결함·영향 기능 확인
27. PR 교차 리뷰·실행 설명서·도식·계약표 갱신
28. 착수 판정과 후속 과제·담당·기한 인계

```mermaid
flowchart LR
    A[현황 분석] --> B[대상 선정]
    B --> C[책임·계약 설계]
    C --> D[대표 경로 구현]
    D --> E[회귀·실패 검증]
    E --> F[완료 검토·인계]
    E -->|차이·결함| C
```

## 6. 작업표와 선행 관계

**P0**: 기존 흐름을 안전하게 넘겨받기 위한 착수 필수. **P1**: 개선하거나 기술 전환을 선택한 기능의 개발을 확장하기 전에 완료. **P2**: 2차 이후 또는 별도 기능·이관 계획으로 진행.

R 번호는 이 문서의 계획 ID다. 기존 Jira 이슈 생성·수정·완료를 뜻하지 않는다. 모든 작업의 현재 상태는 ‘계획’이며 책임자·페어·검토자는 미배정이다.

| ID | 작업 | 구분 | 선행 | 결과물·주요 영향 |
|---|---|---|---|---|
| R01 | 기준본·계약·구현 상태 고정 | P0 | 없음 | 기준 SHA, 로컬 변경 목록, 요청·화면·DB 대응표 |
| R02 | 실행·설정·의존성 재현 설계 및 정비 | P0 | R01 | 환경표, 기동·테스트 명령, 설정 주입, 기술 선택 기록 |
| R03 | 회귀 fixture·기대값·테스트 기준 마련 | P0 | R01, R02 | 기존 32개 정의의 실행 결과, 대표 경로 기준값 |
| R04 | 공유 Connection 제거·자원 종료 보장 | P0 | R03 | 로그인·목록 요청 단위 연결, 정상/오류 종료 증거 |
| R05 | 오류·없음·인증 실패 구분 | P0 | R03, R04 | 예외 전달·사용자 응답·로그 계약, 오류 시험 |
| R06 | 상세 Service·표시 책임 분리 | P1 | R03, R04, R05 | 상세 결과 모델·조합 Service·표시 함수, 호환 속성 |
| R07 | 입력 검증과 검색 조건 객체 정리 | P0 | R01, R03, R05 | 날짜·코드·번호 검증, 재입력·기존 검색 회귀 |
| R08 | 인증·직접 JSP 접근 경계 정비 | P0 | R01, R03, R05 | 접근 경로표, 보호 방식, 세션·forward 회귀 |
| R09 | SQL·행 매핑·명명 중복 정리 | P1 | R03, R05; 상세 변경 시 R06 | JDBC 정리 또는 검증된 Mapper, 동일 결과 비교 |
| R10 | 업무 의미·이력·표시 규칙 교차 검토 | P0 의미 확정 / P1 구현 | R01, R03; 구현은 R06·R09 | 금액·기간·최신 이력 기준, 의도적 차이 승인 기록 |
| R11 | 트랜잭션 경계와 향후 쓰기 계약 | P0 설계 / P1 쓰기 전 검증 | R02, R04, R05; Service는 R06 | 읽기 일관성·쓰기 롤백·혼합 접근 정책 |
| R12 | 선택 기술의 대표 경로 검증 | P1 조건부 | R02, R03, R05, R07, R08 | Spring/JSP/DB 연결 실증, 확대·보류 결정 |
| R13 | 통합 회귀·리뷰·인계 판정 | P0 인계 / P1 확대 시 반복 | 해당 범위의 R01~R12 | 결과표, 변경/미결 목록, 실행 문서, 착수 판정 |

실행 순서의 중심은 `R01 → R02 → R03 → R04 → R05 → R07/R08 → R13`이다. R06·R09·R10 구현은 필요한 업무 정의를 확인한 뒤 작은 변경 묶음으로 진행한다. R11의 설계는 R02부터 시작하며, 실제 쓰기 검증은 신규 저장 기능 구현과 연결한다.

R12를 택하면 결과에 따라 R04~R09의 구현 수단을 조정한다. 기술 선택을 기다린다는 이유로 현재 연결 공유·오류 혼동을 그대로 신규 기능에 복제하지 않는다. 같은 기능을 MVC2와 Spring 양쪽에서 불필요하게 두 번 완성하는 공수도 피한다.

## 7. 작업별 실행 명세

아래 경로는 별도 표기가 없으면 분석 기준 SHA의 저장소 상대 경로다. 새 클래스·패키지 이름은 설계 제안이며 아직 생성하지 않았다.

### R01. 기준본·계약·상태 고정

- 목적: 이전 작업본을 기준으로 최신 기능을 누락시키거나 완료된 수정을 되돌리는 일을 방지한다.
- 대상: Git main/dev, `README.md`, `docs/sprint1-latest-review.md`, `src/main/java/servlet/*`, `src/main/webapp/view/*`, 로컬 `sql/*`.
- 변경: 팀 기준 SHA·실제 배포 SHA·보존할 로컬 수정·업무 범위·요청/세션/속성/SQL 대응표 작성. 구현 확인과 실행 통과를 다른 열로 기록한다.
- 유지 조건: 기존 로컬 수정을 덮어쓰지 않으며, 브랜치·DB·화면 변경은 이 작업에 포함하지 않는다.
- 검증·완료: 기준 SHA와 차이를 다른 사람이 재확인할 수 있고, 로그인/목록/상세/로그아웃의 입력·출력·데이터 근거가 모두 연결된다.

### R02. 실행·설정·의존성 재현

- 목적: 누구나 같은 조건에서 기동·회귀 시험할 수 있도록 한다.
- 대상: `.classpath`, `.project`, `.settings/*`, `src/main/java/util/DBCP.java`, `WEB-INF/lib/*`, 실행 안내. 선택 시 `pom.xml` 등 신규 빌드 정의.
- 변경: 실제 JDK·Tomcat·Oracle/드라이버·JSP/JSTL·JUnit 조합과 설정 주입 방식을 기록한다. 접속값을 소스에서 분리하고 누락 시 명확히 실패하게 한다. 현재 직접 연결과 실제 풀을 구분해 이름·설명을 정비한다. Maven 등 빌드 도입은 기존 배포 재현 검증과 함께 결정한다.
- 유지 조건: 연결 대상·계정 권한·스키마·조회 결과 유지. 접속 비밀값은 문서·로그·예제에 복제하지 않는다. 기존 로컬 DBCP 변경은 비교 후 반영한다.
- 검증·완료: 신규 체크아웃 기준 설정 예제로 기동·테스트 재현, 누락/잘못된 설정의 실패 안내 확인, 담당·검토자의 재현 기록 확보.

### R03. 회귀 fixture·기대값 고정

- 목적: 구조를 바꾸기 전에 보존할 결과를 확보한다.
- 대상: `src/main/java/test/{QualityOfficerDAOTest,CompensationListDAOTest,CompensationDetailDAOTest}.java`, 대표 JSP, 검증용 SQL·데이터 명세.
- 변경: 최신 목록 9개를 포함한 기존 테스트를 먼저 실행하고 환경 실패와 제품 결함을 분리한다. 알려진 정상·없음·선택 정보 없음·복수 조사/문서·날짜 경계의 기대값을 고정한다. 데이터 준비·정리와 테스트 전용 환경을 명시한다.
- 유지 조건: 공유 데이터 삭제·DDL 초기화를 테스트 준비로 사용하지 않는다. 문서/조사 결과 순서에 의존하는 단언은 계약·정렬 기준을 먼저 확인한다.
- 검증·완료: SHA·DB/fixture 버전·명령·통과/실패/미실행·대표 화면과 SQL 기대값 기록. 실패 중인 기존 테스트를 삭제해 통과 수만 맞추지 않는다.

### R04. 연결 소유와 자원 종료

- 목적: 요청 간 DB 연결 공유를 제거하고 성공·실패 모두 자원을 반환한다.
- 대상: `servlet/QualityOfficerLoginAction.java`, `servlet/CompensationListUIAction.java`, `util/DBCP.java`, `model/dao/*`.
- 변경: Action의 static Connection/DAO를 요청 처리에서 분리하고 생성자의 DB 접속을 제거한다. JDBC 유지 시 요청/Service의 연결 소유자와 try-with-resources 경계를 정한다. Spring 선택 시 DataSource·관리 트랜잭션의 연결 생명주기를 사용한다. DAO의 Statement/ResultSet 종료도 오류 경로까지 보장한다.
- 유지 조건: 로그인 세션과 SQL 결과 유지. Spring이 관리하는 연결을 DAO가 임의로 종료하지 않도록 소유 규칙을 일관되게 적용한다.
- 검증·완료: 정상·쿼리 실패·중간 실패에서도 열린 자원이 남지 않고, 서로 다른 두 요청의 연결이 뒤섞이지 않는 재현 시험 통과. 측정값은 시험 조건과 함께 기록한다.

### R05. 예외와 사용자 응답

- 목적: DB 장애가 인증 실패·빈 목록·대상 없음으로 표시되는 문제를 제거한다.
- 대상: `model/dao/*`, `servlet/ActionFactory.java`, `FrontController.java`, 로그인/상세 Action, 공통 오류 처리 제안.
- 변경: DAO가 SQLException을 삼키는 처리를 정리하고 원인을 상위 경계로 전달한다. 입력 오류·미등록 cmd·인증 실패·미존재·DB 장애별 응답표를 만든다. Servlet 방식의 공통 경계 또는 Spring 선택 시 공통 예외 처리에 연결한다.
- 유지 조건: 정상 빈 목록은 정상이며 기존 로그인 실패 안내 유지. 장애 응답의 상태·문구 변경은 4.3절대로 별도 기록한다.
- 검증·완료: 연결 실패/실행 실패/매핑 실패를 주입해 정상·실패 응답을 구분한다. 사용자 화면에 SQL·접속정보·스택이 나타나지 않고 원인 추적용 로그는 남는다.

### R06. 상세 업무 조합과 표시 분리

- 목적: 요청 처리 코드가 업무 조합·기간 계산·표시까지 모두 책임지는 구조를 줄인다.
- 대상: `servlet/compensationDetailAction.java`, `model/dao/CompensationDetailDAO.java`, 상세 VO·JSP; 제안 `CompensationDetailQueryService`, `CompensationDetailViewModel`, Formatter.
- 변경: 13개 조회의 순서·필수/선택 결과·같은 신청/보상 ID 연결을 Service에 모은다. 요청 검증과 화면 선택은 Action/Controller에 둔다. 기간의 업무 정의와 화면 문자열 조립을 구분한다. 타입명·산정 문서 메서드명 대응표를 작성한다.
- 유지 조건: 조합 분리 자체로 조회 건수·값·마스킹·금액·기존 JSP 속성을 바꾸지 않는다. 새 DTO는 기존 뷰에 호환 매핑한다.
- 검증·완료: Service를 가짜 데이터 접근 객체로 시험할 수 있고, 정상·필수 누락·선택 누락·중간 실패의 동일/의도적 변경 결과가 명확하다. JSP 값 대조까지 통과한다.

### R07. 검색·상세 입력 검증

- 목적: DB 호출 전에 잘못된 입력을 업무에 맞게 구분한다.
- 대상: `CompensationListUIAction`, `compensationDetailAction`, 목록 form; 제안 `CompensationSearchCondition`·검증기.
- 변경: 날짜의 형식·실재 날짜·시작/종료 역전, appId 형식·길이, appCategory 허용값을 실제 계약에 따라 검증한다. 단독 시작일/종료일은 유지한다. 공백·부분 검색·와일드카드 처리 의미를 명시한다.
- 유지 조건: 정상 검색의 정확/부분 일치와 한쪽 날짜 검색, 검색조건 유지 동작을 보존한다. 과도한 형식 제한으로 기존 유효 번호를 거절하지 않는다.
- 검증·완료: 누락·빈값·잘못된 날짜·역전·경계 날짜·비정상 코드·한글·복합 조건·빈 결과를 시험하고, 입력 오류 시 DAO 호출 없이 입력값과 안내를 보존한다.

### R08. 세션·직접 JSP 접근 보호

- 목적: 정식 요청 경로와 직접 화면 진입의 인증 기준을 일치시킨다.
- 대상: `FrontController`, 로그인/로그아웃 Action, `view/*.jsp`, `index.html`, `main.html`, 공통 header; 선택한 Filter/Interceptor 또는 WEB-INF 뷰 배치.
- 변경: 기존 로그인 허용 경로·업무 보호 경로·정적 자원·정상 forward를 표로 정한다. 선택한 보호 방식을 한곳에 적용하고 샘플 로그인 기본값과 세션 전환 정책을 검토한다. 기존 계정의 로그인 방식 변경은 D04와 구분한다.
- 유지 조건: 로그인 화면·CSS·JS가 차단되지 않고, 정상 controller forward가 반복 redirect되지 않는다. 기존 cmd·appId·검색조건을 보존한다.
- 검증·완료: 비로그인/로그인/로그아웃 후 controller·직접 JSP·새로고침·뒤로가기·새 탭 시험 결과를 남긴다. 직접 JSP에 대한 접근 정책 변경을 명시한다.

### R09. SQL·결과 매핑·명명 정리

- 목적: 같은 조회의 조건과 필드 매핑이 여러 곳에서 달라지는 일을 줄인다.
- 대상: `util/Query.java`, `CompensationListDAO`, `CompensationDetailDAO`, 관련 VO; 선택 시 MyBatis Mapper/XML.
- 변경: 목록 SELECT/JOIN·조건·정렬과 공통 행 매핑을 정리한다. `getInvestigationDocuments`가 산정 문서를 조회하는 이름 불일치를 내부 대응표로 정비한다. MyBatis를 택하면 바인딩·namespace/id·result mapping을 명시한다.
- 유지 조건: 지급완료 필터·신청일 정렬·날짜 포함 경계·한글 부분 검색·문서 소속·기존 마스킹 유지. 무조건 JPA 전환이나 조회 병합을 수행하지 않는다.
- 검증·완료: 동일 fixture·입력의 전후 행 집합·필드·정렬 비교. 문서 순서·정렬 동률·다건 관계에서 결과가 달라지면 별도 의도적 변경으로 분류한다.

### R10. 업무 의미·이력·금액·기간 대조

- 목적: 구조 개선 과정에서 서로 다른 업무 값을 같은 이름으로 합치지 않는다.
- 대상: `Query.GET_COMPENSATION_PROGRESS`, `GET_INVESTIGATION_SUMMARY`, `GET_COMPENSATION_DETAIL`, `CompensationSummaryVO`, `CompensationCalcVO`, 상세 Action/JSP·주석.
- 변경: 신청액·산정액·지급액의 출처와 화면 항목, 지원율의 단위, 보상 처리 기간의 시작/끝, 복수 조사 중 선택 기준을 정한다. 우선 주석·대응표를 실제 구현과 맞춘다. 조회 기준·표시값 수정은 업무 검토 후 별도 변경한다.
- 유지 조건: 리팩토링만으로 저장 금액·산정 규칙·지급액을 다시 계산하거나 변경하지 않는다. 현재 결과와 변경 제안 결과를 모두 보관한다.
- 검증·완료: 복수 조사·동일 조사일·산정액≠지급액·NULL 날짜·소수 지원율·경계 금액 사례를 업무 담당자와 대조하고 결정 근거·기대 결과를 확정한다.

### R11. 트랜잭션·쓰기 책임 설계

- 목적: 신규 저장 기능을 시작할 때 부분 저장·중복 쓰기·서로 다른 연결을 방지한다.
- 대상: R06의 Service 설계, 연결 설정, 선택할 Mapper/Repository, 향후 가입·피해신청 저장 기능 명세.
- 변경: 현재 다중 조회의 일관성 요구와 DB 격리 수준을 확인한다. 신규 저장 유스케이스별 한 트랜잭션의 범위·실패/재시도·예외 재전파·롤백 기준을 명시한다. MyBatis/JPA 혼용 시 같은 업무의 쓰기 소유자·트랜잭션 관리자를 정한다.
- 유지 조건: 읽기 리팩토링으로 데이터 변경을 유발하지 않는다. Spring 선택 시 `@Transactional` 선언만으로 실제 적용을 가정하지 않는다. [공식 트랜잭션 설명](https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative/annotations.html)
- 검증·완료: 착수 전에는 유스케이스별 정책표 확정. 신규 쓰기 기능 완료 전에는 중간 실패·검증 실패·DB 제약 실패 후 부분 저장 없음과 재조회 일관성을 실제 연동 시험으로 확인한다.

### R12. 선택한 기술의 대표 경로 실증

- 목적: 전체 전환에 앞서 실제 환경에서 가능한지 확인한다.
- 대상: 결정한 빌드·실행 설정, 기존 로그인/JSP/목록 경로, 대표 SQL; 제안 Controller·Service·Mapper.
- 변경: Spring을 택하면 `/controller`와 cmd 호환을 유지하는 대표 목록 경로를 먼저 만들고 기존/신규 라우터의 동일 경로 충돌을 방지한다. JSP·리소스·세션·에러·DB 연결을 함께 검증한다. 단순 환경 ‘Hello’ 출력만으로 완료하지 않는다.
- 유지 조건: 기준 DB·스키마·응답·화면 보존. JPA 자동 DDL, 전체 URL 교체, 템플릿 엔진 교체는 이 대표 전환에 포함하지 않는다.
- 검증·완료: 정상 로그인→검색→상세→로그아웃 중 대표 경로의 HTTP·화면·DB 결과를 비교하고 확대/보류 사유·남은 작업량을 기록한다. Spring을 보류하면 경로 A의 개선 결과와 보류 이유를 인계한다.

### R13. 회귀·완료 검토·인계

- 목적: 작업자 설명 없이도 다음 스프린트 담당자가 기준과 남은 일을 확인하게 한다.
- 대상: 변경 파일·테스트·README·계약표·설계도·실행 결과·PR.
- 변경: 8절의 회귀표를 실행하고 전후 차이를 분류한다. 최신 기준·설정·기동/시험 명령·업무 흐름·미결 항목을 문서에 반영한다. 이름 정리·기능 변경·공통 화면 변경을 PR에서 구분한다.
- 유지 조건: 기존 CONTRIBUTING의 작업 브랜치→dev PR·리뷰 규칙 적용. 이번 계획서 작성은 커밋·PR·메시지 전송을 수행하지 않는다.
- 검증·완료: 9절 착수 기준에 대해 통과/미통과/미실행을 표시하고 검토자가 재현한다. 관련 없는 기능의 ‘완료’로 미결 사항을 숨기지 않는다.

## 8. 회귀 검증·증거 기준

아래는 실행할 시험 계획이다. 이번 문서 작성 중 통과시킨 결과가 아니다.

| 시험군 | 사례 | 완료 판단 |
|---|---|---|
| 인증 | 로그인 정상/오입력/빈값/DB 장애, 로그아웃 후 재접근 | 성공·실패·장애가 구분되고 세션·기존 이동이 정상 |
| 목록 | 전체, 날짜 양쪽·한쪽·당일 경계, 번호, 구분, 이름·품목 부분 검색, 복합, 결과 없음 | 지급완료 필터·행·정렬·건수·조건 유지·가림 표시 일치 |
| 상세 | 정상, appId 누락·없는 번호, 필수/선택 정보 누락 | 기존 목록 복귀·값·빈 섹션 처리가 계약과 일치 |
| 관계·금액 | 한 신청의 복수 조사/조치/보상/지급·문서, 지급액과 산정액 차이 | 다른 신청/지급의 문서가 섞이지 않으며 값의 출처·선택 기준 명확 |
| 오류·자원 | 연결 실패, 조회 중 예외, VO 매핑 실패, 반복 요청 | 성공 오인 없음, 내부 정보 노출 없음, 연결·Statement·ResultSet 반환 확인 |
| 동시성 | 두 사용자·다른 검색·다른 appId의 동시 요청 | 값·연결·세션 정보가 요청 간 섞이지 않음. 조건·동시수·반복수 기록 |
| 접근·이동 | 직접 JSP, controller, 로그인 예외 경로, 새로고침·뒤로가기·링크·리소스 | 합의한 인증 범위, 정상 forward·리다이렉트·스타일 유지 |
| 화면 | 목록·상세·공통 헤더, 데스크톱·좁은 화면, 금액·단위·NULL·한글 | 기존 기준 캡처와 비교, 의도하지 않은 표시·경로 변경 없음 |
| 스키마·데이터 | 사전/사후 건수·키·대표 합계·NULL·타입·DDL 이력 | 구조 리팩토링에서 업무 데이터·스키마의 비의도적 차이 0 |
| 쓰기·롤백 | 신규 기능의 정상/중간 실패/제약 오류/중복 요청 | R11 정책에 따라 전부 반영 또는 실패 처리. 신규 쓰기 구현 단계에서 수행 |

증거 1건의 필수 필드: 작업 ID / 기준·변경 SHA / 환경·DB·fixture 버전 / 입력 / 기대 상태·화면·DB 값 / 실제 결과 / 통과·실패·미실행 / 로그·캡처 경로 / 차이 사유 / 실행자·검토자·시각.

성능은 측정 후 판단한다. 상세 정상 경로의 DAO 조회 호출은 13개지만 이를 그대로 ‘13배 느림’이나 최적화 필요성의 수치로 해석하지 않는다. 같은 fixture·환경에서 SQL 횟수와 응답 시간의 표본을 기록하고 별도 최적화 목표를 정한다.

## 9. 2차 스프린트 착수·인계 기준

### 9.1 시점별 구분

기존 일정 문서는 사전 정비를 **10/22~23**, 2차 스프린트를 **10/26~11/13**, 잔여 전환을 **10/26~28**로 제안한다. 이 계획서는 해당 일정의 실제 승인·인력·완료 상태를 확인한 문서가 아니다. 가용 인원·시간·실측 공수가 미정이므로 모든 리팩토링을 2일 내 끝낼 수 있다고 약속하지 않는다.

| 판정 시점 | 필수 범위 | 미완료 시 처리 |
|---|---|---|
| G0. 2차 기존 기능 확장 착수 전 | R01~R05, R07·R08, R10의 업무 의미표, R11의 경계 설계, 해당 범위 R13 | 영향받는 기존 흐름의 확장을 시작하지 않고 결함·담당·해소 시점을 기록. 독립 분석·설계는 진행 가능 |
| G1. 상세 구조/선택 기술 전환 완료 및 그 위의 기능 구현 전 | R06·R09·R10 구현, 채택 시 R12, 회귀 R13 | 기존 경로 유지 또는 최소 경로 A 선택. 완료되지 않은 전환에 신규 기능을 결합하지 않음 |
| G2. 신규 쓰기·파일·DB 이관 기능 완료 전 | 각 신규 기능 명세·트랜잭션/권한/복구 연동 시험 | 기존 기능 안정화 완료와 구분해 후속 담당에게 인계 |

팀이 G0 범위를 10/23까지 수행하기 어렵다고 판단하면 영향 기능의 착수일·범위와 잔여 전환 순서를 재조정한다. 일정을 맞추기 위해 필수 실패 검증을 생략하거나 계획을 구현 완료로 표시하지 않는다.

### 9.2 G0 확인 체크리스트

- [ ] 기준 dev/main·배포 SHA와 로컬 미반영 변경의 처리 방법이 확정됐다.
- [ ] 설정·의존성·기동·DB fixture·시험 절차를 검토자가 재현했다.
- [ ] 기존 정상 경로·검색조건·상세 값의 기준 결과가 있다.
- [ ] 로그인·목록에서 요청 간 공유 Connection을 제거하고 자원 반환을 확인했다.
- [ ] DB 장애·정상 빈 결과·인증 실패·잘못된 경로가 구분된다.
- [ ] 서버 입력 검증과 직접 JSP 인증 정책의 정상/실패 시험이 통과했다.
- [ ] 금액·기간·다건 관계의 현재 의미와 미결 정의·영향 기능이 기록됐다.
- [ ] 선택 기술·보류 기술·현재 유지 경로 및 쓰기 트랜잭션 책임이 명시됐다.
- [ ] 실제 변경 범위의 회귀 결과와 의도적 변경·미실행 항목이 분리됐다.
- [ ] 미해결 결함마다 영향·우선순위·책임자·해소 시점·차단할 기능이 있다.
- [ ] PR·설계도·README·인계 문서에 검토자의 확인과 착수 판정이 있다.

모든 체크는 **현재 미체크**다. 이번 요청의 완료는 분석·계획 문서 작성이며 리팩토링 구현 완료를 뜻하지 않는다.

### 9.3 이후 가능한 작업·후속 과제

| ID | 후속 작업 | 목적·대상 | 선행·검증·완료 기준 |
|---|---|---|---|
| D01 | 선택적 JPA 도입 | 신규 생산자/계정/피해신청의 Entity·Repository 후보 | 업무·스키마·쓰기 소유자 설계 후 선택. 기존 테이블 매핑·키·저장/조회·롤백 검증. 자동 DDL을 운영/공유 DB에 적용하지 않음 |
| D02 | DB 제품·버전 변경 | Oracle 유지 대안과 별도 DB 운영 요구 평가 | 실제 DB·데이터 규모·쿼리 차이·이관/복구 공수 확인 후 결정. 전후 키·건수·금액·일시·한글·쿼리 결과 검증 |
| D03 | 조회 성능·비동기·페이징 | 상세 13개 조회와 목록의 측정된 병목 개선 | 응답/SQL 기준값 확보 후 실행 계획·조회 축소·필요 시 비동기 검토. 행·정렬·로딩/실패 동작·세션 보존 검증 |
| D04 | 계정·비밀번호 저장 방식 개선 | 로그인 SQL·계정 테이블·신규 계정 기능 | 저장 형식과 기존 계정 전환 요구 확인. 해시 적용을 택하면 재설정·전환·기존 로그인·실패·복구 절차 연동 검증 |
| D05 | 문서 열람·다운로드 | 현재 `href="#"` 링크와 파일 제공 기능 | 파일 식별·소속·열람 권한·없음·오류 정책 설계. 권한별 실제 파일 응답 검증. 현재 조회 기능 완료와 구분 |
| D06 | 신규 통계·생산자 업무 | 통계·전년도 비교, 가입·마이페이지·신청 저장·본인 조회 | G0/G1의 의존 범위 통과 후 별도 요구사항·API·테스트 수립. 1차 리팩토링 성과로 합산하지 않음 |

### 9.4 인계 문서 묶음과 책임

| 문서·기록 | 최소 내용 | 책임 역할 제안 |
|---|---|---|
| 기준·계약표 | SHA·URL·파라미터·세션·속성·SQL·기준 데이터 | 구현 담당 + 업무 검토자 |
| 기술·업무 결정 기록 | 문제·대안·선택 이유·영향·보류·결정자·일자 | 팀 기술 책임자 + 업무 담당 |
| 구조·이름 대응표 | 현재→변경 타입/패키지/메서드, 호출·Mapper·JSP 영향 | 구현 담당 + 교차 리뷰어 |
| 검증 결과·결함표 | 기대/실제·로그·캡처·잔여 영향·차단 여부 | 시험 담당 + 교차 검증자 |
| 실행·되돌리기 안내 | 설정 예제·기동/시험·기준 배포물·복구 순서 | 환경 담당 + 검토자 |
| 착수 판정 | G0/G1 통과 범위·미완료·다음 작업·책임자·기한 | 팀 합의, 이름은 추후 배정 |

되돌리기는 검증된 이전 배포물·설정으로 기존 요청 경로를 복구하는 절차를 기준으로 한다. DB 이관이 포함될 때는 스키마·데이터 복구를 별도 설계하고 먼저 시험한다.

## 10. 학습 과정과 AgriComp 업무의 연결

| 학습 항목 | AgriComp 적용 질문 | 연결 작업 |
|---|---|---|
| MVC2·FrontController·Action | 현재 cmd·세션·forward·redirect 계약은 무엇인가? | R01, R08 |
| Spring MVC 요청 매핑 | 실제 JSP·외부 URL을 보존하면서 책임을 옮길 이유와 방법은 무엇인가? | R02, R12 |
| IoC·DI·Service | 수동 생성·공유 연결·상세 업무 조합을 어디서 책임질 것인가? | R04, R06 |
| MyBatis | 현재 SQL·조건·DTO 매핑을 명확히 관리할 필요가 있는가? | R09, R12 |
| JPA·DDL | 신규 쓰기 모델에 필요한가? 기존 스키마를 자동 변경하지 않고 검증 가능한가? | R11, D01 |
| 테스트·트랜잭션 | 같은 결과를 어떻게 증명하고 실패 시 어디까지 되돌릴 것인가? | R03, R05, R11, R13 |

## 부록 A. 고정 소스 근거

소스 링크는 모두 현재 dev로 확인한 `64ffc629b3cbd8e674946921f26592f7ad189db8`의 고정 파일이다. 문서의 경로는 로컬 이전 작업본과 혼동하지 않도록 이 기준으로 읽는다.

| ID | 근거 | 확인한 내용 |
|---|---|---|
| E01 | [FrontController](https://github.com/AgriBioLab/AgriBioLab/blob/64ffc629b3cbd8e674946921f26592f7ad189db8/src/main/java/servlet/FrontController.java#L12), [ActionFactory](https://github.com/AgriBioLab/AgriBioLab/blob/64ffc629b3cbd8e674946921f26592f7ad189db8/src/main/java/servlet/ActionFactory.java#L7) | `/controller`·cmd·세션 검사·redirect/forward·404·생성자 예외 처리 |
| E02 | [CompensationListUIAction](https://github.com/AgriBioLab/AgriBioLab/blob/64ffc629b3cbd8e674946921f26592f7ad189db8/src/main/java/servlet/CompensationListUIAction.java#L16) | static 연결·DAO, 검색 7개 필드와 request 속성 |
| E03 | [QualityOfficerLoginAction](https://github.com/AgriBioLab/AgriBioLab/blob/64ffc629b3cbd8e674946921f26592f7ad189db8/src/main/java/servlet/QualityOfficerLoginAction.java#L18), [LogoutAction](https://github.com/AgriBioLab/AgriBioLab/blob/64ffc629b3cbd8e674946921f26592f7ad189db8/src/main/java/servlet/QualityOfficerLogoutAction.java) | 연결 생성·로그인 DAO·세션·로그아웃 |
| E04 | [목록 DAO](https://github.com/AgriBioLab/AgriBioLab/blob/64ffc629b3cbd8e674946921f26592f7ad189db8/src/main/java/model/dao/CompensationListDAO.java#L22), [로그인 DAO](https://github.com/AgriBioLab/AgriBioLab/blob/64ffc629b3cbd8e674946921f26592f7ad189db8/src/main/java/model/dao/QualityOfficerDAO.java#L20) | 조건 SQL·바인딩·마스킹·자원 종료·SQLException 처리 |
| E05 | [상세 Action](https://github.com/AgriBioLab/AgriBioLab/blob/64ffc629b3cbd8e674946921f26592f7ad189db8/src/main/java/servlet/compensationDetailAction.java#L25) | 13개 DAO 조회·필수값 누락 복귀·기간·표시 조합·지역 연결 종료 |
| E06 | [Query](https://github.com/AgriBioLab/AgriBioLab/blob/64ffc629b3cbd8e674946921f26592f7ad189db8/src/main/java/util/Query.java#L4) | 테이블 관계·로그인 조건·지급완료 목록·날짜·문서 JOIN·진행 이력 |
| E07 | [상세 DAO](https://github.com/AgriBioLab/AgriBioLab/blob/64ffc629b3cbd8e674946921f26592f7ad189db8/src/main/java/model/dao/CompensationDetailDAO.java#L47), [요약 VO](https://github.com/AgriBioLab/AgriBioLab/blob/64ffc629b3cbd8e674946921f26592f7ad189db8/src/main/java/model/vo/CompensationSummaryVO.java#L9) | payment_amount→finalCompensationAmount, 첫 행 선택·오류 처리 |
| E08 | [상세 JSP](https://github.com/AgriBioLab/AgriBioLab/blob/64ffc629b3cbd8e674946921f26592f7ad189db8/src/main/webapp/view/compensationResultDetail.jsp#L42), [목록 JSP](https://github.com/AgriBioLab/AgriBioLab/blob/64ffc629b3cbd8e674946921f26592f7ad189db8/src/main/webapp/view/compensationResultList.jsp#L42), [로그인 JSP](https://github.com/AgriBioLab/AgriBioLab/blob/64ffc629b3cbd8e674946921f26592f7ad189db8/src/main/webapp/view/qualityOfficerLogin.jsp#L28) | 실제 화면 속성·form·금액·주석·다운로드 자리표시·샘플 기본값 |
| E09 | [목록 테스트](https://github.com/AgriBioLab/AgriBioLab/blob/64ffc629b3cbd8e674946921f26592f7ad189db8/src/main/java/test/CompensationListDAOTest.java), [상세 테스트](https://github.com/AgriBioLab/AgriBioLab/blob/64ffc629b3cbd8e674946921f26592f7ad189db8/src/main/java/test/CompensationDetailDAOTest.java), [로그인 테스트](https://github.com/AgriBioLab/AgriBioLab/blob/64ffc629b3cbd8e674946921f26592f7ad189db8/src/main/java/test/QualityOfficerDAOTest.java) | 9·21·2개 테스트 정의와 fixture 의존 |
| E10 | [2차 이관 기록](https://github.com/AgriBioLab/AgriBioLab/blob/64ffc629b3cbd8e674946921f26592f7ad189db8/docs/sprint2-follow-up.md), [README](https://github.com/AgriBioLab/AgriBioLab/blob/64ffc629b3cbd8e674946921f26592f7ad189db8/README.md) | 직접 JSP 보호 이관·구조 변경 기준·실제 구현보다 오래된 안내 |
| E11 | [DBCP](https://github.com/AgriBioLab/AgriBioLab/blob/64ffc629b3cbd8e674946921f26592f7ad189db8/src/main/java/util/DBCP.java#L16), [.classpath](https://github.com/AgriBioLab/AgriBioLab/blob/64ffc629b3cbd8e674946921f26592f7ad189db8/.classpath) | DriverManager 직접 연결·Java/Tomcat/JUnit 설정. 접속 비밀값은 본문에 복제하지 않음 |

## 부록 B. 기존 계획 문서와의 관계

- [리팩토링 합의안](sprint2-refactoring-agreement.md): 명명·계층·예외·계정·기술 전환의 기존 검토안. 이번 문서는 실제 소스 기준 작업 명세와 착수 기준을 보완한다.
- [기술 결정 검토안](sprint2-architecture-decisions.md): MyBatis/JPA·DB 변경 대안. 최종 합의·구현 상태를 별도 확인한다.
- [기존 일정](sprint2-jira-timetable.md): 10/22~23 사전 정비와 스프린트 초반 잔여 전환의 계획 근거. 이번에 Jira 상태를 조회·수정하지 않았다.
- [킥오프 회고 초안](sprint2-kickoff-retrospective-2026-10-21.md): 담당·기술·업무 기준 등 미결 항목 참고. 참석자 발언·결정으로 추정하지 않는다.
- [협업 규칙](../CONTRIBUTING.md): 작업 브랜치·dev PR·리뷰·목적별 변경 분리 기준.
