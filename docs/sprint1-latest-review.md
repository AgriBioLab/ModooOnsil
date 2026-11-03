# 1차 스프린트 소스 리뷰 — 최신 Git 통합본

검토일: 2026-10-18. 범위: 품질담당자 로그인, 보상처리 지급결과 목록·검색·상세, 로그아웃.

## 1. 기준을 먼저 고정한다

`git fetch origin --no-tags` 후 확인한 제출 브랜치 `origin/main`을 기준으로 한다.

| 구분 | 기준 |
| --- | --- |
| 리뷰 SHA | `f9c9a43aba6563ae6b9f4617cdb83f6f96300f3f` |
| 커밋 | 2026-10-12 11:57 KST, 1차 스프린트 통합본 제출·시연용 main 반영 (#55) |
| origin/dev | `b3187b569ff8cb90278376cdb5d06eb1b17bd9a8`, main과 파일 트리 동일 |
| 현재 작업 폴더 | `feat_commonLayoutCSS` / `81ac663`로 이전 버전. 최신 리뷰의 근거로 사용하지 않는다. |
| 보존한 작업 중 변경 | `.project`, `src/main/java/util/DBCP.java` 및 기존 미추적 자료 |

브랜치를 전환하지 않고 Git 스냅샷을 `.codex/reviews/sprint1-2026-10-18/submission/`에 추출했다. 실제 배포 서버가 이 SHA로 실행 중인지는 확인하지 않았다.

노션의 [00 전체 리뷰 기준](https://app.notion.com/p/3f94f7b340a881fa9a58cd168da35612)과 [01 소스 분석→아키텍처 재구성](https://app.notion.com/p/3f94f7b340a88177b601e420956a0b0e), 02~07 개별 카드를 읽었다. 조회 당시 00·01은 `질문 준비`, 02~07은 `미시작`이다. 아래는 소스 검토 결과이며 개인의 설명·재작성 능력을 완료 판정한 기록은 아니다.

## 2. 독립 코드 → 공통 요소 → 반복 규칙

| 실제 파일 | 입력·출력·책임 | 확인한 규칙과 예외 |
| --- | --- | --- |
| `util/DBCP.java` | `getConnection()` → JDBC Connection, 최초 호출 시 Oracle 드라이버 로딩 | 이름과 달리 연결 풀이 없다. 호출마다 DriverManager로 연결을 만든다. `dbcp`는 지연 생성하며 동기화가 없다. |
| `util/Query.java` | DAO가 사용하는 SQL 문자열 상수 | 인터페이스 상수이며 Query 객체를 생성하지 않는다. 목록 검색의 일부 날짜 조건과 정렬 문자열은 DAO 내부에도 있다. |
| `util/PrivacyMaskingUtil.java` | 이름 String → 가림 처리한 String | DAO가 목록 대표자·신청 대표자·로그인 이름에 적용한다. 서비스 계층은 존재하지 않는다. |
| `servlet/Action.java` | `execute(HttpServletRequest)` → 화면 경로 또는 redirect 표식 String | 공통 계약이다. Action 인터페이스 자체를 `new` 하지 않는다. |
| `servlet/ActionFactory.java` | cmd → 구체 Action 또는 null | 요청마다 `new Action`. Factory 인스턴스는 생성하지 않는다. 생성자 DB 오류를 catch하고 null 반환 가능. |

설정 파일 예제의 존재만으로 실제 DBCP가 설정을 읽는다고 설명하면 안 된다. 최신 DBCP는 소스 내부 연결 설정을 사용한다. 연결 주소와 계정은 이 리뷰에 복제하지 않는다.

패키지는 `servlet`, `model.dao`, `model.vo`, `util`, `test`다. DAO는 Connection을 생성자로 받아 필드에 보관하고 SQL을 실행한다. 단건은 주로 `if (rs.next()) → VO/null`, 복수건은 `while (rs.next()) → List<VO>` 패턴이다. `ResultSet`·Statement는 정상 경로에서 명시적으로 닫지만 예외 경로에서 닫힘을 보장하지 않는다. 대다수 DAO는 SQLException을 출력하고 기본 반환값으로 복귀한다.

이름의 예외도 기록한다. `compensationDetailAction`은 소문자로 시작한다. `getInvestigationDocuments()`는 실제로 `compensation_calc_doc`의 **산정 문서**를 조회한다. 목록의 일부 명칭과 상세 VO의 명칭도 업무 화면 기준으로 해석해야 한다.

## 3. 노션 01~07과 실제 구현의 대응

| 카드 | 소스에서 확인한 내용 | 추가 검증·설명할 점 |
| --- | --- | --- |
| [01 아키텍처](https://app.notion.com/p/3f94f7b340a88177b601e420956a0b0e) | FrontController → Factory → Action → DAO → VO → JSP. 별도 Service 없음. | 메모리 그림에서 Servlet 재사용과 요청별 Action 생성을 구분한다. |
| [02 Controller](https://app.notion.com/p/3f94f7b340a881eab20ed06937ba5a1c) | `/controller`, cmd 분기, 세션 검사, 미등록 cmd 404, forward/redirect 분기 | 화면 추가 시 보통 Action·Factory·화면 링크 변경. Controller는 일반 forward에 수정 불필요하나 redirect 표식이 특정 URL에 결합돼 있다. |
| [03 UI↔VO](https://app.notion.com/p/3f94f7b340a881baaf33fc94f5218052) | 목록 `CompensationListVO`, 상세 구역별 VO, `request.setAttribute`와 EL | appId는 String, claimId는 int. 금액·수량 다수가 int, 일부 날짜는 String/일부는 java.sql.Date. 타입 일관성을 설명한다. |
| [04 DAO](https://app.notion.com/p/3f94f7b340a88176977cf35a160361a8) | 로그인 DAO 1개, 목록 DAO 2개, 상세 DAO 13개 public 조회 메서드 | 지급 완료 결과를 SELECT한다. 품질담당자가 이 코드로 지급·승인하는 것은 아니다. |
| [05 SQL](https://app.notion.com/p/3f94f7b340a881d1b6ade52933371966) | appId → claimId → 산정·지급·문서 연결. 목록은 지급일 non-null 조건 | 업무리스트 원본 전체와 컬럼별 완전 대조, 실제 Oracle 결과는 별도 확인이 필요하다. |
| [06 UI·예외](https://app.notion.com/p/3f94f7b340a8818a949bc4be6a2d5f0a) | 서버 로그인, 검색 조건 유지·건수, 상세 누락 시 목록 이동, 로그아웃 | 직접 JSP 접근 보호와 첨부 다운로드는 완성으로 설명할 수 없다. |
| [07 검증](https://app.notion.com/p/3f94f7b340a88142bcabca845f6902cd) | JUnit4 DAO 테스트 3클래스/25개 `@Test` | 실행·커버리지·TDD 순서·브라우저 시나리오는 이번 검토로 입증하지 않았다. |

## 4. 한 기능을 끝까지 연결한다

대표 기능: 보상 결과 상세 조회.

1. 로그인 사용자가 `/controller?cmd=compensationDetailAction&appId=REQ-2026-000136`을 호출한다. 호스트·포트·context path는 실제 배포 설정에 따라 앞에 붙는다.
2. `FrontController.service()`가 세션의 `loginOK`를 확인한다. Factory는 `new compensationDetailAction()`을 반환한다.
3. `execute()`가 appId를 읽는다. 비어 있으면 목록 redirect 표식을 반환한다.
4. `try (Connection conn = DBCP.getConnection())`으로 요청의 연결을 열고 `new CompensationDetailDAO(conn)`을 만든다.
5. appId로 상단 요약·보상신청·접수·조치·조사·진행흐름을 조회한다. 요약/보상신청이 없으면 목록으로 이동한다.
6. `getCompensationClaimId(appId)`로 얻은 int를 산정·지급·관련 문서 메서드에 전달한다.
7. VO와 List를 request 속성에 연결하고 연결을 닫는다. `execute()`는 `view/compensationResultDetail.jsp`를 반환한다.
8. Controller가 같은 request/response로 forward한다. JSP는 속성의 VO를 읽어 HTML을 출력한다. DB 연결이 닫혀도 이미 매핑한 VO는 request가 참조하므로 출력할 수 있다.

객체·스택·static·세션의 관계는 [메모리 그림 두 기준](sprint1-memory.md)에 별도로 그렸다.

## 5. 최신 통합본에서 남은 주요 항목

아래는 리뷰 결과와 후속 후보다. 리팩토링이나 구현 변경은 실행하지 않았다. 소스 링크는 모두 고정 SHA를 가리킨다.

| 우선순위 | 발견·영향 | 근거 |
| --- | --- | --- |
| 높음 | 로그인·목록 Action이 생성될 때 Connection과 DAO를 클래스의 static 필드에 다시 대입한다. 요청 간 공유·덮어쓰기와 기존 연결의 명시적 close 누락이 있다. 동시 요청의 실제 충돌·고갈은 부하 실행으로 확인해야 한다. | [LoginAction 18행](https://github.com/AgriBioLab/AgriBioLab/blob/f9c9a43aba6563ae6b9f4617cdb83f6f96300f3f/src/main/java/servlet/QualityOfficerLoginAction.java#L18), [ListAction 16행](https://github.com/AgriBioLab/AgriBioLab/blob/f9c9a43aba6563ae6b9f4617cdb83f6f96300f3f/src/main/java/servlet/CompensationListUIAction.java#L16) |
| 높음 | DAO의 SQL 오류가 null/빈 List/0과 섞인다. 상세 Action의 catch가 있어도 DAO에서 삼킨 SQLException은 전달되지 않는다. 로그인 DB 장애도 인증 실패처럼 보일 수 있다. | [로그인 DAO](https://github.com/AgriBioLab/AgriBioLab/blob/f9c9a43aba6563ae6b9f4617cdb83f6f96300f3f/src/main/java/model/dao/QualityOfficerDAO.java#L36), [상세 DAO](https://github.com/AgriBioLab/AgriBioLab/blob/f9c9a43aba6563ae6b9f4617cdb83f6f96300f3f/src/main/java/model/dao/CompensationDetailDAO.java#L220) |
| 중간 | `GET_COMPENSATION_PROGRESS`는 조사 이력을 JOIN하고 정렬·최종 1건 선택 없이 DAO에서 첫 행을 읽는다. 조사 요약은 최신 조사일 내림차순이므로 같은 신청의 두 구역 날짜가 달라질 가능성이 있다. | [Query](https://github.com/AgriBioLab/AgriBioLab/blob/f9c9a43aba6563ae6b9f4617cdb83f6f96300f3f/src/main/java/util/Query.java), 로컬 샘플 000136에서 진행 SQL 2행 확인 |
| 중간 | Factory는 생성자 SQL 오류를 catch 후 null 반환한다. Controller는 이를 미등록 cmd와 같은 404로 응답할 수 있다. | [Factory](https://github.com/AgriBioLab/AgriBioLab/blob/f9c9a43aba6563ae6b9f4617cdb83f6f96300f3f/src/main/java/servlet/ActionFactory.java#L17), [Controller](https://github.com/AgriBioLab/AgriBioLab/blob/f9c9a43aba6563ae6b9f4617cdb83f6f96300f3f/src/main/java/servlet/FrontController.java#L46) |
| 명시된 2차 과제 | 직접 `/view/*.jsp` 호출은 Controller의 세션 검사를 거치지 않는다. 직접 JSP 보호는 팀이 2차로 이관했다. 직접 호출이 자동으로 DAO 조회까지 실행하는 것은 아니다. | [sprint2-follow-up.md](https://github.com/AgriBioLab/AgriBioLab/blob/f9c9a43aba6563ae6b9f4617cdb83f6f96300f3f/docs/sprint2-follow-up.md) |
| 범위 확인 | 문서 이름은 DB와 연결되지만 다운로드 링크는 `href="#"`다. 실제 파일 다운로드 완료로 설명하지 않는다. | [상세 JSP](https://github.com/AgriBioLab/AgriBioLab/blob/f9c9a43aba6563ae6b9f4617cdb83f6f96300f3f/src/main/webapp/view/compensationResultDetail.jsp#L115) |

부가 검토: 날짜 역전·잘못된 날짜 입력의 서버 검증, SQL의 정렬 기준(신청일 vs 지급일), SQL 다건 관계의 명시, JSP 출력 escaping, 세션 ID 갱신, 로그인 폼의 샘플 값, 비밀번호 보관 방식은 후속 검증 후보로 남긴다. 이번 정적 검토만으로 실제 공격·장애가 발생했다고 판단하지 않는다.

## 6. 수행한 검증과 한계

| 검증 | 결과 |
| --- | --- |
| 원격 최신 확인 | fetch 성공. main/dev의 전체 파일 트리 동일 확인 |
| 코드 규모 | DAO 3클래스/16 public 업무 메서드, VO 12클래스, servlet 패키지 8파일, util 3파일 |
| 테스트 규모 | 로그인 2, 목록 2, 상세 21 = 25 `@Test`. 생성자·BeforeClass·AfterClass는 제외 |
| 컴파일 | 최신 스냅샷의 model·util을 `javac --release 17 -encoding UTF-8`로 성공. 전체 웹앱/JSP 컴파일은 별도 |
| SQL 보조 검증 | 로컬 DDL과 샘플의 INSERT 부분을 SQLite로 옮겨 목록·상세 없음·지급문서 JOIN·복수 조사·기간/복합 검색 조건 확인 |
| 샘플 제한 | `sql/sample_data.sql` 뒤에 추가된 10/7 Oracle PL/SQL 보완 블록은 SQLite에서 실행하지 않았다. 보조 fixture의 지급목록 2건을 최종 Oracle 건수로 해석하지 않는다. SQL 폴더는 로컬 Git exclude 대상이다. |
| 지급문서 JOIN 비교 | 이전 작업본은 claim 2 조회에 다른 지급의 문서까지 4행, 최신은 해당 지급의 문서 2행. 과거 문제를 최신 미수정 문제로 기록하지 않는다. |
| 미수행 | 실제 Oracle/JDBC JUnit 실행, Tomcat 기동·HTTP 화면 시나리오, JVM heap dump/할당 추적, 동시 요청 부하, TDD Red→Green→Refactor 증거 확인 |

기존 `docs/*verification.log`는 이 SHA·현재 코드·현재 DB의 재실행 증거가 아니므로 이번 통과 로그로 합산하지 않았다. 테스트 메서드 수는 커버리지나 안정성의 수치가 아니다.

보조 검증 재현: 저장소 루트에서 `python .codex/reviews/sprint1-2026-10-18/verify_review.py`. 상세 결과는 같은 폴더의 `evidence.json`에 있다. 외부 DB에는 연결하지 않는다.

## 7. 직접 설명하고 다시 그려볼 순서

1. 서버만 켠 상태를 그린다. URL 매핑 등록과 Servlet·Action·DAO의 객체 생성을 구분한다.
2. 로그인 화면 URL → 로그인 POST → redirect → 목록 GET을 그린다. 세션과 request 속성이 어디까지 유지되는지 설명한다.
3. 목록의 Factory 호출·생성자·static 대입·SQL·VO·request·JSP 순서를 소스 없이 재작성한다.
4. 같은 목록을 두 사람이 동시에 호출한다고 가정해 각 스택과 공유 static 참조를 따로 그린다.
5. 상세는 Connection이 지역 변수이고 try-with-resources로 닫힌다는 차이를 설명한다.
6. DAO 정상/없음/SQL 오류, 미등록 cmd/DB 접속 실패를 각각 어떤 응답으로 구분해야 하는지 답한다.
7. 실제 Tomcat·Oracle 실행 결과와 본인 설명을 연결한 뒤 노션의 `설명 가능`/`검증 완료`를 판단한다.

노션 상태·체크리스트는 변경하지 않았다. 소스 분석 산출물과 개인 학습 검증을 분리해 이어갈 수 있다.
