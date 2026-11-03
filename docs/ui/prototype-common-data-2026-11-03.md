# 업무·데이터 구조 검토용 공통 예시 — v21

## 미등록 항목 보충 — v21

회원 연락처·인증 입력 예시, 농장 위치, 온실 시설, 작기 생육·출하 목표, 재배일지 작업·후속 확인·첨부 이미지, 센서 관측 항목·단위·시각, 출하 부가정보를 공통 저장 원본에 보충한다. 빈 값과 정확히 `미등록`인 자리표시자만 채우며 기존 입력과 0값은 유지한다. 수행하지 않은 작업은 ‘작업 없음/사용 없음’, 수확 전 작기는 ‘수확 전’으로 표시한다. 인증 상태는 인증 완료로 바꾸지 않는다. 첨부 예시는 기존 온실 일러스트를 변환한 참고 이미지다.

v21 보충 직전 원본은 `agribiolab-producer-management-v3-before-prototype21`에 보관한다. `prototypeDataVersion=21`로 반복 추가를 방지한다. 기존 수량·출하·등급·잔량 계산은 유지하고, 시작 수량이 미확정인 이전 작기는 이번 요청에 따라 1,000 화분의 예시값을 채운다. 이후 입력값은 그대로 저장된다. 이전 자동 이관 안내만 있던 메모에는 원문을 보존하며 재배 메모를 추가한다.

`tmp/prototype-complete-v21/model-test.cjs`, `ui-test.cjs`에서 기존 값·0값·수량 보존, v20→v21 백업·중복 방지, 등록된 모든 일지·온실·작기·출하 상세의 누락 표시, 첨부 표시, 6개 화면 폭, 단일 HTML을 검증했다. 아래 v20 내용은 자동 수집·실행 연결의 기본 구조이며 빈 항목 보충에는 이 절이 우선한다.

사용자가 모든 작업의 목적을 **업무를 찾고 데이터 항목과 구조를 파악하는 UI 프로토타입**으로 명확히 했다. 별도 체험·시뮬레이션 모드와 시작/정지 버튼은 제공하지 않는다. 일반 홈·온실·작기·재배일지·센서 화면에 같은 공통 데이터를 넣는다. 앞선 v19 문서의 실제 API 규격 확인은 이번 UI 작업의 선행 조건이 아니다.

## 일반 화면에서 확인하는 업무

| 업무 | 표시 항목·관계 |
| --- | --- |
| 수기 재배일지 | 작기·작업일·시각·작성자·작업 유형·메모·생육조사·비료·관수량·후속 확인 |
| 환경 자동수집 | 온실·장비 ID·관측 항목·값·단위·관측 시각·수신 시각·품질 상태 |
| 장비 현황 | 온실·장비명·장비 구분·위치·수집 상태·수집주기 |
| 자동화 실행 | 작기·온실·제어기·작업·실행 사유·시작/완료 시각·성공/실패·공급량·결과 |
| 자동 결과 일지 | 완료 응답이 있는 실행만 일지와 연결. 기록 구분은 ‘자동 실행 결과’이며 실행 원본 ID를 보존 |
| 실패 확인 | 실패 실행은 장치 이력에 표시하고 완료 작업 일지로 생성하지 않음 |
| 일지·관측 통합 | 선택한 작기·온실·날짜의 수기 작업·자동 결과·환경 요약·장치 실행 이력을 함께 조회 |

## 공통 데이터 구조

- 기존 `profile`, `farms`, `houses`, `cycles`, `records`, `environment`, `shipments`, `adjustments`를 유지한다.
- `devices`: `id`, `houseId`, `name`, `kind`, `zone`, `status`, `intervalMinutes`, `metrics`.
- `automationEvents`: `id`, `cycleId`, `houseId`, `deviceId`, `date`, `operation`, `trigger`, `startedAt`, `finishedAt`, `status`, `quantity`, `unit`, `result`, `source`.
- 일지 확장: `time`, `authorId`, `authorName`, `inputSource`(manual/automatic), `automationEventId`, `sourceDeviceId`.
- 환경 확장: `observedAt`, `receivedAt`, `sensorId`, `source`, `units`, `quality`.

관측은 온실을 기준으로, 직접 작업과 자동 실행은 작기를 기준으로 연결한다. 같은 온실의 관측을 작기별로 중복 생성하지 않는다. 집계는 장비 ID·구역·항목·단위를 기준으로 한다. 출처의 표시명 차이로 같은 장비를 별도 집계하지 않는다. 이상값은 원자료에 남기고 요약·그래프에서 제외한다.

## 데이터 반영·보존

`producerPrototypeData.js`에서 예시를 한곳에 정의한다. 일반 화면의 첫 로드에서 `preparePrototype()`가 현재 작기·온실 ID에 맞게 예시를 한 번 보충한다. 현재일과 기존 최근 관측일을 포함하므로 기존 v19의 2026-10-28 조회에서도 같은 데이터 구조를 확인할 수 있다.

기존 행·사용자 입력·출하·수량 이력은 덮어쓰지 않는다. 보충 전에 기존 v3 저장 원본을 `agribiolab-producer-management-v3-before-prototype20`에 보관한다. `prototypeDataVersion=20`으로 새로고침 때 중복 추가하지 않는다. 기존 저장소가 손상됐으면 보충하지 않으며, 저장 실패 시 원래 기록 조회를 유지한다. 자동 실행 원본은 직접 수정·삭제할 수 없고 완료 일지에서 장치 실행 이력으로 이동한다.

이 데이터는 UI 설계 검토용으로 하드코딩된 예시다. 타이머·외부 센서 통신·실제 관수/차광 명령은 없다. 예시 데이터 표시는 일반 화면에서 이루어지며 별도 모드로 진입하지 않는다.

## 확인·검증

- `tmp/sensor-demo-v20/common-data-test.cjs`: 공통 참조, 기존 행 보존, 완료/실패 구분, 수량·출하 불변, 원본 백업·1회 보충·중복 방지·자동 기록 보호 통과.
- `tmp/sensor-demo-v20/common-ui-test.cjs`: 일반 화면의 직접/자동 기록·장치 이력·센서 항목·수집주기·홈/온실 일치·6개 폭·새로고침·단일 HTML 통과. 별도 체험 모드·버튼 없음.
- 기존 도메인 12개, 16개 화면 CRUD·잔량, 공통 데이터·검색·페이지·로그아웃, 47개 사이트맵 목적지 검증 통과.
- 공유용 단일 HTML에도 같은 공통 데이터를 반영했다.

조회 URL:

- `?view=journal-day&cycleId=cycle-demo&date=2026-10-28`
- `?view=sensor-data&houseId=house-c&date=2026-10-28`
- `?view=journal&cycleId=cycle-demo&inputSource=automatic`

[일지·센서·자동 실행 연결 화면](prototype-common-journal-2026-11-03.png), [장비·센서 원자료 화면](prototype-common-sensors-2026-11-03.png).
