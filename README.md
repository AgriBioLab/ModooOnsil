# 모두의 온실 · ModooOnsil

온실 재배에 필요한 정보를 한곳에서 관리하는 웹 애플리케이션입니다. 회원·농장 정보, 작기계획, 재배일지, 온실 정보와 품목별 환경기준을 관리합니다.

현재 기능 개발 및 통합 검증을 진행하고 있습니다.

## 주요 기능

| 영역 | 주요 내용 |
|---|---|
| 회원·인증 | 회원가입, 세션 로그인, 회원·농장 정보 및 비밀번호 관리 |
| 작기계획 | 작기계획 조회·등록·수정·삭제, 시작·종료 관리 API |
| 재배일지 | 재배일지 등록·조회·삭제 및 작업 내역 수정, 작기계획·생육단계 연계 |
| 온실 | 회원별 온실 목록 조회 |
| 품목·환경기준 | 품목 목록 및 품목별 생육단계 환경기준 조회 |

기능별 구현 및 연동 범위는 개발 진행에 따라 변경될 수 있습니다. 작기계획 API는 구현되어 있으며, 작기계획 페이지의 서버 API 연동은 대기 상태입니다.

## 기술 스택

| 구분 | 기술 |
|---|---|
| 언어 | Java 21 |
| 서버 | Spring Boot 4.0.9, Spring MVC |
| 인증 | Spring Security |
| 화면 구성 | Thymeleaf, HTML, CSS, JavaScript |
| 데이터 접근 | MyBatis Spring Boot Starter 4.0.1 |
| 데이터베이스 | MariaDB |
| 빌드 | Gradle Wrapper |
| 개발 보조 | Lombok, Spring Boot DevTools |
| 버전 관리 | Git, GitHub |

## 프로젝트 구조

```text
ModooOnsil/
├── src/
│   ├── main/
│   │   ├── java/kr/swdl/modooonsil/
│   │   │   ├── common/         # 공통 엔티티 및 페이지 라우팅
│   │   │   ├── member/         # 회원가입 및 회원·농장 정보 관리
│   │   │   ├── security/       # 세션 로그인 및 접근 제어
│   │   │   ├── cultivation/
│   │   │   │   ├── plan/       # 작기계획
│   │   │   │   └── diary/      # 재배일지 및 작업 관리
│   │   │   ├── greenhouse/     # 온실 및 환경변화 이력
│   │   │   └── cropstandard/   # 품목 및 생육단계별 환경기준
│   │   └── resources/
│   │       ├── templates/     # Thymeleaf 페이지 및 공통 템플릿
│   │       ├── static/        # CSS·JavaScript·이미지 등 정적 리소스
│   │       ├── mappers/       # MyBatis SQL 매퍼 XML
│   │       └── application.yml # 애플리케이션·DB·MyBatis 설정
│   └── test/                 # 서비스·저장소·보안 등 테스트
├── build.gradle
├── gradlew
└── gradlew.bat
```

## 실행 환경

- JDK 21
- MariaDB 접속 환경
- Git

Gradle은 저장소에 포함된 Wrapper를 사용합니다.

### 1. 저장소 다운로드

```bash
git clone --branch dev https://github.com/AgriBioLab/ModooOnsil.git
cd ModooOnsil
```

### 2. 데이터베이스 준비

DB 초기 구성 자료와 접속 정보는 팀 내부에서 별도로 관리합니다.

- 팀 공용 DB를 사용하는 경우, 담당자에게 접속 정보와 초기 구성 완료 여부를 확인합니다.
- 별도 DB를 구성하는 경우, 내부 자료에 따라 테이블을 생성하고 확정된 더미 데이터를 입력합니다.
- 이미 초기화된 공용 DB에는 테이블 생성이나 데이터 입력을 중복 실행하지 않습니다.

DDL과 더미 데이터 파일은 공개 저장소에 포함하지 않습니다.

### 3. 환경변수 설정

프로젝트 루트에 `.env` 파일을 생성합니다.

```dotenv
SERVER_PORT=8080

DB_DRIVER_NAME=org.mariadb.jdbc.Driver
DB_URL=jdbc:mariadb://DB_HOST:DB_PORT/DB_NAME
DB_USERNAME=YOUR_DB_USERNAME
DB_PASSWORD=YOUR_DB_PASSWORD
```

다음 자리표시자를 팀 내부에서 전달받은 값으로 변경합니다.

| 항목 | 설명 |
|---|---|
| `DB_HOST` | MariaDB 서버 IP 또는 도메인 |
| `DB_PORT` | MariaDB 접속 포트 |
| `DB_NAME` | 사용할 데이터베이스 이름 |
| `YOUR_DB_USERNAME` | DB 접속 계정 |
| `YOUR_DB_PASSWORD` | DB 접속 비밀번호 |

`DB_HOST`, `DB_PORT`, `DB_NAME`은 위 예시에서 교체할 문자열이며, 별도로 선언된 환경변수는 아닙니다.

`SERVER_PORT`는 웹 애플리케이션 실행 포트로, DB 접속 포트와 별개입니다.

`.env`는 Git 추적에서 제외됩니다. 실제 접속 정보는 커밋하거나 공개 이슈·PR에 첨부하지 않습니다.

### 4. 애플리케이션 실행

Windows PowerShell:

```powershell
.\gradlew.bat bootRun
```

macOS / Linux:

```bash
./gradlew bootRun
```

실행 후 [로컬 홈 페이지](http://localhost:8080/)에 접속합니다. 위 주소는 `SERVER_PORT=8080` 기준입니다.

외부 MariaDB를 사용하더라도 애플리케이션을 내 컴퓨터에서 실행했다면 웹 접속 주소는 `localhost`입니다. 주요 관리 기능은 로그인이 필요합니다.

## 테스트

Windows PowerShell:

```powershell
.\gradlew.bat test
```

macOS / Linux:

```bash
./gradlew test
```

DB를 사용하는 테스트는 필요한 테이블과 데이터가 준비되어 있어야 합니다. 테스트 실행 전 DB 연결 설정이 테스트용 DB를 가리키는지 확인합니다.

## 개발 브랜치

최신 통합 개발 소스는 `dev` 브랜치에서 관리합니다.
