# ModooOnsil 협업 · 코드 컨벤션 가이드

이 문서는 Confluence의 **코드 컨벤션** 및 **결정사항 / 결정 필요사항**을 기반으로, `ModooOnsil` 저장소에서 일관된 개발·협업 흐름을 유지하기 위한 기준을 정리합니다.

- Confluence 원본:
  - [코드 컨벤션](https://tlals0028.atlassian.net/wiki/x/BIBYAQ)
  - [결정사항 / 결정 필요사항](https://tlals0028.atlassian.net/wiki/spaces/2/pages/21823504)
- GitHub Wiki: [ModooOnsil Wiki](https://github.com/AgriBioLab/ModooOnsil/wiki)

---

## 1. 브랜치 전략

| 브랜치 | 용도 | 직접 push |
| :--- | :--- | :--- |
| `main` | 제출 · 시연용 완성본 | ❌ `dev`에서 PR로만 반영 |
| `dev` | 팀원 작업을 통합하는 기본 브랜치 | ❌ 작업 브랜치에서 PR로만 반영 |
| `feat_SCRUM-<번호>-<요약>` | 화면 · 기능 구현 | ✅ |
| `fix_SCRUM-<번호>-<요약>` | 버그 · UI 이슈 수정 | ✅ |
| `docs_SCRUM-<번호>-<요약>` | 문서 · 가이드 작업 | ✅ |

### 브랜치 네이밍 규칙
- 최신 `origin/dev`에서 분기합니다.
- 슬래시(`/`) 대신 언더스코어(`_`)를 사용합니다.
- Jira 티켓 키(`SCRUM-<번호>`)를 포함하는 것을 권장합니다. (예: `feat_SCRUM-160-auth-404`, `docs_SCRUM-202-conventions-wiki`)
- `UI` 같은 약어는 대문자를 유지합니다. (예: `feat_agricultureCaseUI`, `docs_teamGuide`)

---

## 2. 커밋 메시지 규칙

형식: `<말머리>: <변경 요약> (SCRUM-<번호>)`

| 말머리 | 사용 시점 | 예시 |
| :--- | :--- | :--- |
| `feat` | 새 화면 · 기능 추가 | `feat: 비로그인 인가 분리 및 404 페이지 구현 (SCRUM-160)` |
| `fix` | 버그 · 오타 · 잘못된 링크 수정 | `fix: 농산물 사건 목록 깨진 ul 태그 정리 (SCRUM-120)` |
| `design` | CSS · 레이아웃 · 화면 스타일 변경 | `design: 검색조건 2열 배치 (SCRUM-135)` |
| `refactor` | 동작 변경 없이 구조 정리 | `refactor: 공통 head 영역을 Thymeleaf fragment로 분리 (SCRUM-177)` |
| `test` | 테스트 코드 추가 · 수정 | `test: 온실 서비스 단위 테스트 보강 (SCRUM-184)` |
| `docs` | 문서 · Wiki · README 수정 | `docs: 협업 규칙 및 코드 컨벤션 문서 추가 (SCRUM-202)` |
| `chore` | 설정 · 빌드 · 라이브러리 변경 | `chore: .gitignore 규칙 정리 (SCRUM-101)` |

---

## 3. PR(Pull Request) 규칙

1. **Base 브랜치**: 항상 `dev`로 설정합니다. (배포 시에만 `dev` → `main` PR 생성)
2. **PR 제목**: Jira 티켓 키 `(SCRUM-xxx)`를 포함합니다.
3. **PR 본문**: [`.github/PULL_REQUEST_TEMPLATE.md`](.github/PULL_REQUEST_TEMPLATE.md)의 모든 섹션을 채웁니다.
   - `## 작업 내용`: 상단에 `> **핵심 요약**`을 두괄식으로 작성하고, `### 1. ...` 형태로 구조화합니다.
   - `## 확인 요청`: `### 1) 공통 파일 · 규약 영향 범위`, `### 2) 격리 · 후속 작업`으로 구분해 작성합니다.
   - 공통 파일(`common.css`, `common.js`, `app.js`, `header.html`, `sidebar.html`, `SecurityConfig.java`)을 수정했다면 영향 범위를 반드시 명시합니다.
4. **사전 검증**: 푸시 및 PR 생성 전 로컬에서 테스트 통과를 확인합니다.
   ```powershell
   .\gradlew.bat clean test
   ```
5. **UI 변경 시**: 로컬 서버 실행 후 확인한 스크린샷 또는 GIF를 `## 화면` 섹션에 첨부합니다.

---

## 4. 코드 컨벤션

### 공통 & 도메인 모델
- **일시 타입**: Java에서 모든 일시 필드는 `LocalDateTime`을 사용합니다. (DB 물리모델링 일시 컬럼은 `DATETIME`)
- **테이블 공통 컬럼**: 모든 테이블에 등록 / 수정 / 삭제 일시를 둡니다.
- **논리 삭제**: 모든 삭제 처리는 삭제 일시를 기록하는 논리 삭제로 처리하며, Repository의 논리 삭제 메서드명은 `delete...`로 유지합니다.
- **도메인 클래스명**: 단일 테이블에 매핑되는 클래스명에는 `VO`를 붙이지 않습니다.

### Repository 메서드명
- 기본 CRUD 네이밍은 `find`, `findAll`, `add`, `update`, `delete`를 사용합니다.

### DTO 명명 규칙
| 용도 | 네이밍 패턴 | 예시 |
| :--- | :--- | :--- |
| 생성 요청 | `Create{대상}Request` | `CreateGreenhouseRequest`, `CreateCultivationDiaryRequest` |
| 수정 요청 | `Update{대상}Request` | `UpdateGreenhouseRequest`, `UpdateMemberProfileRequest` |
| 상태 변경 요청 | `{행위}{대상}Request` | `EndCultivationPlanRequest` |
| 목록 검색 조건 | `{대상}SearchRequest` | `CultivationPlanSearchRequest`, `EnvironmentHistorySearchRequest` |
| 단건 응답 | `{대상}Response` | `GreenhouseResponse`, `MemberProfileResponse` |
| 목록 · 상세 분리 응답 | `{대상}SummaryResponse`, `{대상}DetailResponse` | `CultivationDiarySummaryResponse`, `CultivationDiaryDetailResponse` |

### UI 설계 공통 규칙
- **상세 화면 하단 버튼**: `목록`은 좌측, `삭제 · 수정 · 업무 실행`은 우측에 배치합니다.
- **등록 · 수정 화면 하단 버튼**: `취소 · 저장`은 우측에 함께 배치합니다.
