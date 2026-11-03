# 품질담당자·화훼농민 UI 공통 기준

> 후속 사용자 요청으로 화훼 화면의 여백·상단 메뉴·첫 화면 밀도를 조정했다. [최신 사이트맵·뷰포트 기준](sitemap-viewport-2026-11-02.md)이 아래 초기 수치 일치 기록보다 우선한다. 공통 서체·색·입력·표는 유지하며, 화훼 전용 본문 위 16px·왼쪽 32px·아래 12px·사이드 위 44px 및 반응형 220px 사이드를 적용한다.

## 원인과 수정

품질담당자 화면은 `common/header/sidemenu/searchBox/table/detail.css`가 전체 폭·간격·서체·위계를 정한다. 이전 화훼 시안은 공통 파일을 일부 불러오면서도 `producerMain.css`의 17px 본문·88px 헤더·1480px 최대 폭과 `producerManagement.css`의 200px 사이드·카드형 구성·3열 세로 검색 양식이 이를 덮어썼다. CRUD가 정상 동작하는 검증과 화면 톤·밀도 일치 검증이 분리되어 있었다.

현재 `producerMain.html`은 품질담당자와 같은 공통 CSS와 구조를 직접 사용한다. 기존 `producerMain.css`는 이 엔트리에서 불러오지 않는다. 공유 CSS 자체는 수정하지 않아 기존 품질담당자 화면은 유지된다.

## 공통 파일이 소유할 기준

| 기준 | 공통 값·구조 | 소유 파일 |
| --- | --- | --- |
| 기본 서체·본문 | Pretendard GOV, 15px, 줄간격 1.5 | common.css |
| 전체 폭·기본 여백 | 최대 1920px, 좌우 24px | common.css, header.css |
| 헤더·로고 | 높이 75px, 로고 글자 20px·심벌 30px | header.css |
| 상위 메뉴 | 같은 `.html-menu` 구조·간격·활성 표시 | header.css |
| 사이드 | 280px, 위 97px, 오른쪽 구분선, 제목·선택 행 | sidemenu.css |
| 본문 | 위 50px·왼쪽 55px, 경로 13px·제목 32px | common.css |
| 검색 | 2열 가로 라벨, 1279px 이하 1열, 입력 40px | searchBox.css |
| 목록 | 14px, 기본 행 48px, 위 2px 진한 선·회색 헤더 | table.css |
| 상세 | 항목/값 정보표, 구획 제목 17px, 요약 행 | detail.css |

1440px 브라우저에서 위 항목과 페이지 제목 Y좌표까지 참조 화면과 비교해 일치함을 확인했다. 내용이 여러 줄인 행은 정보량에 따라 기본 48px보다 커질 수 있다.

## 화면을 추가할 때 지킬 구조

1. 셸은 `.page-layout` 안에 `.side-menu`와 `.content`를 둔다. 별도 최대 폭·사이드 폭을 다시 정하지 않는다.
2. 헤더·상위 메뉴는 생산자 전용 조각에 서비스명·메뉴 데이터만 바꾸고 `header.css`를 사용한다. 품질담당자 이름·인증 링크까지 복사하지 않는다.
3. 사이드는 `.side-title > .side-section > .side-menu-list` 구성과 활성 `li.active`를 사용한다.
4. 검색은 `.search-box`, `.search-row`, `.search-label`, `.search-input`/`.search-select`, `.search-actions`를 사용한다. 조회·초기화 버튼은 같은 우측 정렬 행에 둔다.
5. 목록은 `.result-info`, `.table-wrap`, `.list-table`을 사용한다. 화면 제목을 섹션 제목·건수 레이블에 반복하지 않는다.
6. 상세는 `.detail-table`, 요약은 `.detail-summary`를 사용한다. 전체 내용을 둥근 카드로 다시 감싸지 않는다.
7. 기능 전용 CSS는 차트·사진·달력·검증 메시지·등록 양식 등에 한정한다. 공통 셸의 크기·서체·밀도를 화면별로 덮어쓰지 않는다.

각 테이블의 최소 폭은 컬럼 수에 맞춰 조정한다. 모바일에서는 표 내부만 가로 스크롤하고 페이지는 넘치지 않도록 한다. 입력은 모바일 조작을 위해 44px·16px로 조정한다.

## 현재 확장 파일의 책임

`producerManagement.css`는 화훼 전용 CRUD 입력, 사진, 측정 항목 펼침, 생육/환경 차트, 출하 막대, 달력, 오류·저장 상태만 확장한다. 상위 셸·사이드·본문 간격은 공통 클래스에서 상속한다. 화훼 서비스명과 기존 저장·CRUD·통계 기능은 유지한다.

모바일에서는 공통 사이드를 숨기고 전체 메뉴에 모든 하위 화면을 제공한다. 상위 메뉴와 동일한 하위 메뉴를 본문 위에 또 표시하지 않는다.

## 검증·공유

- 참조: `src/main/webapp/view/compensationResultList.html`
- 대상: `src/main/webapp/view/producerMain.html`
- 수치 비교·화면 캡처: `tmp/management-v3/style-test.cjs`
- 15개 화면×5개 폭·CRUD 회귀: `tmp/management-v3/ui-test.cjs`
- 공유용 단일 HTML: `python docs/ui/build-producer-previews.py`로 공통 CSS까지 인라인 재생성.
- 이미지: `quality-reference-desktop-2026-11-02.png`, `flower-shared-tone-farms-desktop-2026-11-02.png`, `flower-shared-tone-journal-desktop-2026-11-02.png`, `flower-shared-tone-journal-mobile-2026-11-02.png`.
