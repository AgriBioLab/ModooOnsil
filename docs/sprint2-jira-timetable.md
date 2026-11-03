# 스프린트 Jira 타임테이블

## 1차 스프린트 완료 이력

- 기간: 2026-09-15~2026-10-08 (사용자 제공 발표자료)
- [SCRUM-35 1차 완료 에픽](https://tlals0028.atlassian.net/browse/SCRUM-35), 작업 6개 완료. 스프린트 ID 1 종료(closed) 확인.
- Git 기준: [4f66004](https://github.com/AgriBioLab/AgriBioLab/commit/4f66004e2615603e88f283bdc1222f4acc40abb6)까지의 origin/dev 통합 이력. Jira 완료 처리일은 소급 등록일인 2026-10-21이며 당시 실행 테스트 결과를 새로 확인한 것은 아니다.

|작업|관련 구현 이력|Git 근거|
|---|---|---|
|[SCRUM-36 [1차] 조회 화면·공통 레이아웃·용어 정비](https://tlals0028.atlassian.net/browse/SCRUM-36)|2026-09-23~2026-10-06|[66b3bdb](https://github.com/AgriBioLab/AgriBioLab/commit/66b3bdb), [0db8747](https://github.com/AgriBioLab/AgriBioLab/commit/0db8747), [b9ad829](https://github.com/AgriBioLab/AgriBioLab/commit/b9ad829), [1e86ff7](https://github.com/AgriBioLab/AgriBioLab/commit/1e86ff7)|
|[SCRUM-37 [1차] DAO·VO·SQL·단위 테스트 코드 통합](https://tlals0028.atlassian.net/browse/SCRUM-37)|2026-10-03~2026-10-06|[1e1db99](https://github.com/AgriBioLab/AgriBioLab/commit/1e1db99), [f657a74](https://github.com/AgriBioLab/AgriBioLab/commit/f657a74), [e88ec28](https://github.com/AgriBioLab/AgriBioLab/commit/e88ec28), [a22a41e](https://github.com/AgriBioLab/AgriBioLab/commit/a22a41e), [65f3011](https://github.com/AgriBioLab/AgriBioLab/commit/65f3011)|
|[SCRUM-38 [1차] Servlet MVC·공통 JSP·화면 경로 연결](https://tlals0028.atlassian.net/browse/SCRUM-38)|2026-10-05~2026-10-07|[1e1db99](https://github.com/AgriBioLab/AgriBioLab/commit/1e1db99), [9828d8c](https://github.com/AgriBioLab/AgriBioLab/commit/9828d8c), [42f6640](https://github.com/AgriBioLab/AgriBioLab/commit/42f6640)|
|[SCRUM-39 [1차] 품질담당자 로그인·세션·로그아웃](https://tlals0028.atlassian.net/browse/SCRUM-39)|2026-10-05~2026-10-08|[76d077d](https://github.com/AgriBioLab/AgriBioLab/commit/76d077d), [42f6640](https://github.com/AgriBioLab/AgriBioLab/commit/42f6640), [89f1ddc](https://github.com/AgriBioLab/AgriBioLab/commit/89f1ddc)|
|[SCRUM-40 [1차] 보상 지급결과 목록·조건 검색·상세 이동](https://tlals0028.atlassian.net/browse/SCRUM-40)|2026-10-05~2026-10-08|[73ee8a8](https://github.com/AgriBioLab/AgriBioLab/commit/73ee8a8), [d8b5812](https://github.com/AgriBioLab/AgriBioLab/commit/d8b5812), [2ef5d17](https://github.com/AgriBioLab/AgriBioLab/commit/2ef5d17)|
|[SCRUM-41 [1차] 지급결과 상세·전체 흐름·관련 서류 조회](https://tlals0028.atlassian.net/browse/SCRUM-41)|2026-10-07~2026-10-08|[b87f667](https://github.com/AgriBioLab/AgriBioLab/commit/b87f667), [1b74a51](https://github.com/AgriBioLab/AgriBioLab/commit/1b74a51), [729f58e](https://github.com/AgriBioLab/AgriBioLab/commit/729f58e), [a48e9b7](https://github.com/AgriBioLab/AgriBioLab/commit/a48e9b7), [fbb387d](https://github.com/AgriBioLab/AgriBioLab/commit/fbb387d), [0e853bc](https://github.com/AgriBioLab/AgriBioLab/commit/0e853bc), [0933bdc](https://github.com/AgriBioLab/AgriBioLab/commit/0933bdc), [824fc5b](https://github.com/AgriBioLab/AgriBioLab/commit/824fc5b), [4f66004](https://github.com/AgriBioLab/AgriBioLab/commit/4f66004)|

## 2차 스프린트

- 사전 리팩토링: 2026-10-22~23 (2근무일)
- 2차 스프린트: 2026-10-26~11-13 (15영업일), 예정(future). 월~금 기준, 휴무·부재는 별도 조정.
- 리팩토링(Highest)을 가장 먼저 수행하고, 기능 구현에서는 품질담당자 통계·비교분석(High)을 우선한다. 10/26~28 잔여 전환·접근 보호 후 통계 화면 구현을 연결한다.
- 에픽 5개·세부 작업 26개·선행 관계 52개. 데일리·점검 3개는 별도 운영 작업으로 스프린트에 포함한다. 개인별 공수·담당자·데일리 시각은 팀 합의 후 확정한다.
- [Jira 타임라인](https://tlals0028.atlassian.net/jira/software/projects/SCRUM/boards/1/timeline?rangeMode=MONTHS)은 이슈 시작일·기한 기준으로 표시한다.

|순서|에픽|색상|기간|
|---|---|---|---|
|1|[SCRUM-42 [2차] Spring 전환·리팩토링](https://tlals0028.atlassian.net/browse/SCRUM-42)|회색|2026-10-22~2026-10-28|
|2|[SCRUM-43 [2차] 품질담당자 통계·전년도 비교](https://tlals0028.atlassian.net/browse/SCRUM-43)|파란색|2026-10-26~2026-11-06|
|3|[SCRUM-44 [2차] 품질담당자 마이페이지·서류·공통 계정](https://tlals0028.atlassian.net/browse/SCRUM-44)|보라색|2026-10-26~2026-11-06|
|4|[SCRUM-45 [2차] 생산자 가입·마이페이지·피해신청·본인 조회](https://tlals0028.atlassian.net/browse/SCRUM-45)|녹색|2026-10-26~2026-11-06|
|5|[SCRUM-46 [2차] 통합 검증·수정·시연·제출](https://tlals0028.atlassian.net/browse/SCRUM-46)|주황색|2026-11-09~2026-11-13|

## 개발 프로세스

1. Spring 방식·실행 환경·명명 규칙·공통 구조를 먼저 정비하고 기존 동작을 회귀 검증한다.
2. 품질담당자의 지표·집계 기준 → 통계 조회 → 전년도 비교분석 순서로 구현한다. 기존 데이터·검증용 샘플을 사용해 생산자 신규 기능 완료를 기다리지 않는다. 집계·필터·기간 조건을 재사용한다.
3. 공통 계정 계약을 정리하고 품질담당자 마이페이지와 생산자 가입/마이페이지를 별도 작업으로 개발한다. 로그인·현재 사용자 식별·비밀번호 처리는 재사용하고 역할별 메뉴·권한·표시 정보를 분리한다.
4. 생산자 가입 후 마이페이지·피해신청은 병렬 개발한다. 재해코드 공공 API를 연결하고 피해신청 저장 → 본인 신청내역 조회를 완성한다.
5. 11/6 핵심 흐름 점검, 11/9~13 통합 검증·결함 수정·시연·제출 준비. 데일리에서 선행 리팩토링, 통계·분석, 계정 공통 변경, 생산자 흐름 순으로 막힘을 확인한다.

## 수행 단계와 킥오프 합의

|단계|일정|주요 기록|
|---|---|---|
|전환 기준·규칙 합의|10/22~23|업무 패키지·명명·인터페이스·예외·DB 선택·역할/페어|
|업무 분석·설계·리뷰|10/26~28|품질담당자/생산자 흐름·공통 용어·UI/ERD·지표·API|
|전환·구현·단위 테스트|10/23 대표 경로, 10/26~28 잔여 전환, 10/29~11/6 기능|MyBatis/JPA·DB 전환 근거·조건별 테스트|
|통합·회귀 테스트|11/9~10|기대값·실제값·실패·결함|
|요구사항 검증·수정·재검증|11/9~12|UI/ERD 누락·권한·API·집계·데이터 정합성|
|발표 준비·리허설·최종 점검|11/11~13|1차 문제→선택 근거→구현→검증 결과|
|데일리 스크럼|10/26~11/13 매 영업일|목적·어제/오늘·페어·막힘·결정 근거·담당/기한|

- [SCRUM-47 리팩토링 합의안](https://tlals0028.atlassian.net/browse/SCRUM-47)의 하위 체크리스트 9개에 피드백을 기록한다. [카드 목록](https://tlals0028.atlassian.net/issues?jql=project%20%3D%20SCRUM%20AND%20labels%20%3D%20kickoff-refactoring-review%20ORDER%20BY%20key%20ASC).
- MyBatis와 일부 JPA는 Spring 전환에 포함한다. 기능별 책임과 DB 제품·버전·전환 범위는 1차 코드·회고·호환성/공수 검증을 근거로 팀이 결정한다.
- [리팩토링 합의안](sprint2-refactoring-agreement.md), [기술 전환 결정 근거](sprint2-architecture-decisions.md), [페어 운영](sprint2-pair-programming.md).
- [슬라이드용 16:9 PNG](kickoff-review/checklist-16x9.png)와 [카드형 검토 페이지](kickoff-review/index.html)를 제공한다. PNG는 SCRUM-47에도 첨부했다.
- 카드의 합의 완료와 실제 구현 완료를 구분한다. 인원·가용 시간·DB 이관 공수는 팀 합의 후 확정한다.

## 세부 일정

|업무|상위 에픽|시작|기한|우선순위|선행 업무|
|---|---|---|---|---|---|
|[SCRUM-47 Spring·DB 전환 기준·아키텍처·협업 규칙 설계](https://tlals0028.atlassian.net/browse/SCRUM-47)|SCRUM-42|2026-10-22|2026-10-23|Highest|없음|
|[SCRUM-48 Spring·MyBatis 대표 기능 전환 및 연결 테스트](https://tlals0028.atlassian.net/browse/SCRUM-48)|SCRUM-42|2026-10-23|2026-10-23|Highest|SCRUM-47|
|[SCRUM-49 기존 기능 Spring 전환·예외·접근 보호](https://tlals0028.atlassian.net/browse/SCRUM-49)|SCRUM-42|2026-10-26|2026-10-28|Highest|SCRUM-48|
|[SCRUM-71 MyBatis·JPA 연동 및 DB 전환 검증](https://tlals0028.atlassian.net/browse/SCRUM-71)|SCRUM-42|2026-10-26|2026-10-27|Highest|SCRUM-48|
|[SCRUM-50 품질담당자 통계·전년도 비교 분석·설계 및 리뷰](https://tlals0028.atlassian.net/browse/SCRUM-50)|SCRUM-43|2026-10-26|2026-10-28|High|없음|
|[SCRUM-51 품질담당자 통계조회 구현·단위 테스트](https://tlals0028.atlassian.net/browse/SCRUM-51)|SCRUM-43|2026-10-29|2026-11-03|High|SCRUM-49, SCRUM-50, SCRUM-71|
|[SCRUM-52 품질담당자 전년도 비교 구현·단위 테스트](https://tlals0028.atlassian.net/browse/SCRUM-52)|SCRUM-43|2026-11-04|2026-11-06|High|SCRUM-51|
|[SCRUM-53 공통 계정·역할별 마이페이지 분석·설계 및 리뷰](https://tlals0028.atlassian.net/browse/SCRUM-53)|SCRUM-44|2026-10-26|2026-10-28|High|없음|
|[SCRUM-56 기존 상세 서류·열람 권한 분석·설계](https://tlals0028.atlassian.net/browse/SCRUM-56)|SCRUM-44|2026-10-26|2026-10-27|High|없음|
|[SCRUM-54 품질담당자 마이페이지·비밀번호 변경 구현·테스트](https://tlals0028.atlassian.net/browse/SCRUM-54)|SCRUM-44|2026-10-29|2026-11-03|Medium|SCRUM-49, SCRUM-53, SCRUM-71|
|[SCRUM-57 보상 지급결과 상세 서류 열람 구현·테스트](https://tlals0028.atlassian.net/browse/SCRUM-57)|SCRUM-44|2026-10-29|2026-11-03|Medium|SCRUM-49, SCRUM-56, SCRUM-71|
|[SCRUM-55 공통 비밀번호 찾기·재설정 구현·테스트](https://tlals0028.atlassian.net/browse/SCRUM-55)|SCRUM-44|2026-11-04|2026-11-06|Medium|SCRUM-54|
|[SCRUM-58 재해코드 공공 API·내부 데이터 매핑 분석·설계](https://tlals0028.atlassian.net/browse/SCRUM-58)|SCRUM-45|2026-10-26|2026-10-27|High|없음|
|[SCRUM-72 생산자 액터 분석·설계 및 페어 리뷰](https://tlals0028.atlassian.net/browse/SCRUM-72)|SCRUM-45|2026-10-26|2026-10-28|High|없음|
|[SCRUM-59 생산자 가입·로그인·역할 식별 구현·테스트](https://tlals0028.atlassian.net/browse/SCRUM-59)|SCRUM-45|2026-10-29|2026-10-30|Medium|SCRUM-48, SCRUM-49, SCRUM-53, SCRUM-71, SCRUM-72|
|[SCRUM-60 생산자 마이페이지·업무 진입 구현·테스트](https://tlals0028.atlassian.net/browse/SCRUM-60)|SCRUM-45|2026-11-02|2026-11-04|Medium|SCRUM-53, SCRUM-59|
|[SCRUM-61 공공 재해코드 기반 피해신청 구현·테스트](https://tlals0028.atlassian.net/browse/SCRUM-61)|SCRUM-45|2026-11-02|2026-11-04|Medium|SCRUM-49, SCRUM-58, SCRUM-59|
|[SCRUM-62 본인 피해신청 내역조회·접근 제한 구현·테스트](https://tlals0028.atlassian.net/browse/SCRUM-62)|SCRUM-45|2026-11-05|2026-11-06|Medium|SCRUM-61|
|[SCRUM-63 통합·회귀 테스트 및 결과 기록](https://tlals0028.atlassian.net/browse/SCRUM-63)|SCRUM-46|2026-11-09|2026-11-10|High|SCRUM-52, SCRUM-55, SCRUM-57, SCRUM-60, SCRUM-62|
|[SCRUM-64 요구사항·권한·API·집계·DB 정합성 검증](https://tlals0028.atlassian.net/browse/SCRUM-64)|SCRUM-46|2026-11-09|2026-11-10|High|SCRUM-52, SCRUM-55, SCRUM-57, SCRUM-60, SCRUM-62|
|[SCRUM-65 통합 결함 수정·재검증](https://tlals0028.atlassian.net/browse/SCRUM-65)|SCRUM-46|2026-11-11|2026-11-12|High|SCRUM-63, SCRUM-64|
|[SCRUM-66 발표자료·설계 근거 정리 및 시연 리허설](https://tlals0028.atlassian.net/browse/SCRUM-66)|SCRUM-46|2026-11-11|2026-11-12|Medium|SCRUM-63|
|[SCRUM-67 최종 검증·발표·제출 준비 점검](https://tlals0028.atlassian.net/browse/SCRUM-67)|SCRUM-46|2026-11-13|2026-11-13|High|SCRUM-65, SCRUM-66|
|[SCRUM-68 데일리 스크럼·회의록 운영 (15영업일)](https://tlals0028.atlassian.net/browse/SCRUM-68)|별도 운영|2026-10-26|2026-11-13|Medium|없음|
|[SCRUM-69 1주차 설계·전환 결과 점검 및 범위 조정](https://tlals0028.atlassian.net/browse/SCRUM-69)|별도 운영|2026-10-30|2026-10-30|Medium|SCRUM-49, SCRUM-50, SCRUM-53, SCRUM-56, SCRUM-58, SCRUM-71, SCRUM-72|
|[SCRUM-70 핵심 업무 흐름 시연·기능 동결 점검](https://tlals0028.atlassian.net/browse/SCRUM-70)|별도 운영|2026-11-06|2026-11-06|Medium|SCRUM-52, SCRUM-55, SCRUM-57, SCRUM-60, SCRUM-62|

## 데일리 회의록

[SCRUM-68 데일리 회의·회의록 운영](https://tlals0028.atlassian.net/browse/SCRUM-68)에 15일치 기록 목록·회의록 양식·색상 범례를 등록했다. 기존 팀 회의록의 날짜별 링크와 후속 Jira·PR을 연결한다. 실제 참석자·결정·결과는 회의 후 작성한다. 기간은 운영 구간이며 15인일 공수 추정이 아니다.

## 번호 전환 상태

새 번호의 등록·날짜·상위 에픽·스프린트 배정·선행 관계 검증을 완료했다. 기존 SCRUM-5~34 30개는 사용자 승인 후 삭제했고 검색 결과 0개를 확인했다. 새 SCRUM-35~70 36개를 보존했다. 이후 MyBatis·JPA 연동 및 DB 전환 검증 SCRUM-71과 생산자 분석·설계 SCRUM-72를 추가했다. 기존 예시 SCRUM-1~4는 정리 대상에서 제외했다.

## 킥오프 피드백 카드

- [SCRUM-75 01. 업무 패키지·공통 책임](https://tlals0028.atlassian.net/browse/SCRUM-75)
- [SCRUM-76 02. 소스·멤버 이름 규칙](https://tlals0028.atlassian.net/browse/SCRUM-76)
- [SCRUM-77 03. 인터페이스 대상·역할](https://tlals0028.atlassian.net/browse/SCRUM-77)
- [SCRUM-78 04. Spring 계층·주입·트랜잭션](https://tlals0028.atlassian.net/browse/SCRUM-78)
- [SCRUM-79 05. 예외·응답·로그·롤백](https://tlals0028.atlassian.net/browse/SCRUM-79)
- [SCRUM-80 06. MyBatis·JPA·DB 선택 근거](https://tlals0028.atlassian.net/browse/SCRUM-80)
- [SCRUM-81 07. 계정 보안·설정·객체 생성](https://tlals0028.atlassian.net/browse/SCRUM-81)
- [SCRUM-82 08. UI 형식·경로·조회 방식](https://tlals0028.atlassian.net/browse/SCRUM-82)
- [SCRUM-83 09. 테스트·페어·완료 기준](https://tlals0028.atlassian.net/browse/SCRUM-83)

기존의 별도 회의 항목 SCRUM-73·74는 이 업데이트의 수정 대상에서 제외했다.



