# 화훼농민용 2차 서비스 · 브라우저 CRUD 반영

최종 입력 항목과 단위 계산은 [Google Sheets 261102 데이터 매핑](../data/final-data-ui-mapping-2026-11-02.md)이 우선한다. 출하 단위가 재배 단위와 다르면 실제 차감 재배수량을 별도로 확인한다. 기간별 실적은 같은 출하 단위로, 목표 대비 실적은 재배 단위로 확인한 수량으로 비교한다. 아래의 종전 동일 단위 제약 설명은 이 내용으로 대체한다.

최신 메뉴·상단 내비게이션·여백은 [사이트맵·뷰포트 기준](sitemap-viewport-2026-11-02.md)을 따른다. 온실관리는 독립, 농장정보는 마이페이지로 이동했다. 이전 기준정보 관리 설명보다 이 구성이 우선한다. 기존 브라우저 CRUD 저장 구조는 유지한다.

현재 화면 톤은 [품질담당자 공통 UI 기준](shared-ui-style-guide-2026-11-02.md)을 따른다. 공통 CSS의 헤더·사이드·검색·목록·상세를 직접 사용하고 별도 카드형 셸은 제거했다. 아래 CRUD 범위와 저장 방식은 유지된다.

현재 표시·입력 용어는 [첨부 자료 대조 용어 기준](flower-terminology-2026-11-02.md)을 따른다. 정식일은 재배 시작일과 별도 선택 입력이고, 출하 규격/등급도 분리한다. 기존 규격 필드와 생육 측정명의 별칭은 호환 처리한다. 용어 안내는 `view=terminology`에서 조회한다.

## 반영 범위

사용자가 지정한 기존 `src/main/webapp/view/producerMain.html`에 반영했다. 서비스 표기는 **화훼 영농관리**이며 기존 품질담당자용 Java/DB·로그인 화면과 구분한다. 이번 작업은 사용자가 선택한 **브라우저 저장 CRUD** 범위다.

| 메뉴 | 진입 URL의 view | 제공 기능 |
| --- | --- | --- |
| 홈·영농현황 | home | 농장·온실 선택, 진행 작기·잔량, 최근 환경·일지 |
| 작기 관리 | cycles | 목록·상세·등록·수정·종료·미참조 기록 삭제, 수량 변경 이력 |
| 재배일지 | journal | 목록·달력·검색·상세·작성·수정·삭제, 정밀 생육 측정·사진 |
| 출하관리 | shipments | 조회·등록·정정·사유를 남기는 취소, 작기 잔량 연동 |
| 농장관리 | farms | 조회·등록·수정·사용 종료·미참조 기록 삭제 |
| 온실관리 | houses | 조회·등록·수정·사용 종료·미참조 기록 삭제 |
| 생육·환경 비교 | comparison | 동일 표본·측정법·단위의 추이, 같은 기간 환경 관측점·원자료 |
| 출하 비교 | shipping-stats | 기간별/작기별 출하량, 목표 대비 누적 실적·실제 출하일 |
| 내 정보 | account | 검토용 표시 이름·연락처 수정 |
| 비밀번호 변경 | password | 입력·불일치·보기/숨기기 흐름만 확인. 인증·변경·저장 없음 |

작성·상세 URL은 `view=journal-add`, `view=journal-detail&id=...` 등으로 진입한다. 기존 `producerMain.html?v=full-page-20261102&view=journal-add&from=journal`도 같은 화면에서 사용할 수 있다. 상위 메뉴는 합의한 다섯 구분이고 작성·상세는 전체 페이지로 제공한다. 입출금·거래처 독립 메뉴·작업 건수·폐기 비교는 추가하지 않았다.

## 기록 일관성

- 작기와 출하·일지는 같은 ID로 연결한다. 출하 내역을 일지에서 재입력시키지 않고 원기록 링크로 조회한다.
- 시작 수량 + 기타 수량 변동 − 유효 출하량으로 잔량을 계산한다. 정정·취소를 중복 차감하지 않는다.
- 현재와 과거 날짜의 잔량 초과, 다른 단위 출하, 잘못된 실제 날짜를 거부한다.
- 연결 기록이 있는 농장·온실·작기는 삭제하지 않고 사용 종료·작기 종료를 사용한다.
- 이력이 있는 작기의 온실·단위 직접 변경은 제한한다. 날짜를 가진 위치 이동·단위 환산 기능은 별도 설계 전까지 제공하지 않는다.
- 수량 변경은 사유와 발생일을 가진 추가 이력으로 관리한다. 기존 변경 정정은 상쇄 이력을 추가한다.
- 목표 대비 실적은 작기 시작부터 기준일까지 누적하며 한 달 실적과 전체 작기 목표를 섞지 않는다.
- 사진은 PNG/JPEG/WebP 600KB 이하. 저장 공간 부족 시 기존 저장 내용을 유지하고 실패를 안내한다.

## 저장·이전 시안

새 키는 `agribiolab-producer-management-v3`다. 기존 `agribiolab-workspace-demo-v2` 원본은 수정하거나 삭제하지 않는다. v3이 없으면 이전 온실·베드·일지를 가져와 작기와 연결한다. 작기를 특정하지 못한 일지는 원래 위치 문구를 남겨 보존한다.

이전 시안에 시작 수량·단위가 없으면 **미등록**으로 표시한다. 작기 수정에서 실제 수량·단위를 등록한 뒤 출하할 수 있다. 실제 시작일이 없으면 최초 일지 날짜 또는 오늘을 임시 표시하고 확인을 안내한다. 이전 장부·할 일 원본도 v2 키에 남아 있다.

저장소가 손상되면 원본을 덮어쓰지 않고 복구 전 변경 저장을 잠근다. 저장 실패 시 성공으로 처리하지 않는다. 새 브라우저·다른 기기·저장소 초기화 후에는 같은 데이터가 보장되지 않는다. 실제 사용자 인증·권한·서버 DB·실시간 센서는 연결되지 않았다.

## 파일과 실행

- 엔트리: `src/main/webapp/view/producerMain.html`
- 생산자 헤더: `src/main/webapp/view/common/producerWorkspaceHeader.html`
- 저장·검증: `src/main/webapp/resources/js/producerManagementStore.js`
- 용어·측정명 별칭: `src/main/webapp/resources/js/producerTerminology.js`
- 화면·탐색: `src/main/webapp/resources/js/producerManagement.js`
- 스타일: `src/main/webapp/resources/css/producerManagement.css`
- 기존 `producerWorkspace.js/css`는 이전 시안 자료로 보존하고 새 엔트리에서는 사용하지 않는다.
- 회원가입 시안의 HTML/JS 서비스 표기도 화훼 영농관리로 수정했다.
- 공유용 `docs/ui/producer-main-prototype.html`은 `python docs/ui/build-producer-previews.py`로 재생성한다.

로컬 진입: `http://127.0.0.1:8765/src/main/webapp/view/producerMain.html`

## 검증

- `tmp/management-v3/store-test.cjs`: 출하 정정·취소, 과거 잔량, 참조 삭제, 단위 변경, 측정값·날짜, 저장 실패 원자성, 다른 탭의 최신 수량, 이전 데이터 이관·미등록 수량, 손상 보호, 종료, 비밀번호 미저장.
- `tmp/management-v3/ui-test.cjs`: 15개 화면 × 1440/1024/768/390/320px, 브라우저 CRUD·새로고침, 출하 정정·취소·초과 방지·목표 실적, 미저장 이탈 안내, 뒤로가기, 모바일 메뉴, 단일 HTML 직접 열기.
- 브라우저 스크립트 오류 없음. 실제 운영 서버 API를 테스트한 것은 아니다.
- 화면 이미지: `flower-management-home-desktop-2026-11-02.png`, `flower-management-comparison-desktop-2026-11-02.png`, `flower-management-journal-mobile-2026-11-02.png`.
