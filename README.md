# LocalLink (동네 커뮤니티 플랫폼)

LocalLink는 관심사 기반의 동네 모임과 소통을 위한 하이브리드 커뮤니티 플랫폼입니다. 
맛집 탐방, 러닝, 보드게임 등 다양한 취미를 이웃과 함께 즐기고 정보를 나눌 수 있습니다.

## 🚀 기술 스택

### Backend
- **Java 21**, **Spring Boot 3.2**
- **Spring Security** (JWT Authentication)
- **Spring Data JPA**, **PostgreSQL 16**
- **WebSocket (STOMP)** (실시간 채팅)
- **Gradle (Kotlin DSL)**

### Frontend
- **Next.js 15** (App Router)
- **TypeScript**, **React 19**
- **Tailwind CSS v4** (다크 모드, 글래스모피즘 UI)
- **Zustand** (전역 상태 관리)
- **Axios** (API 통신 및 인터셉터)

## ✨ 핵심 기능

### 1. 회원 및 인증 기능
- JWT 기반 안전한 로그인/회원가입
- 나이, 성별, 동네(위치), 관심사 기반 프로필 관리
- 본인이 작성한 게시글 및 참여한 모임 모아보기

### 2. 게시판 기능
- 자유, 동네정보, 질문, 중고거래 카테고리 지원
- 댓글, 좋아요, 조회수 기능
- 게시글 로컬 이미지 업로드

### 3. 모임(Gathering) 기능
- 카테고리별 동네 모임 생성 (보드게임, 러닝, 스터디 등)
- **인구통계학적 필터링**: 참가자 나이 제한(최소/최대) 및 성별 제한(남성만/여성만) 기능
- **모임 승인제**: 즉시 가입이 아닌 모임장의 수락(Approve) / 거절(Reject) 시스템

### 4. 실시간 채팅 기능
- 모임에 승인된(APPROVED) 유저만 입장 가능한 모임 전용 채팅방
- WebSocket & STOMP 기반 실시간 양방향 통신
- 입장/퇴장 시스템 메시지 및 채팅 이력 저장

## 🛠️ 설치 및 실행 방법

### Backend 실행
1. PostgreSQL 데이터베이스 준비 (`locallink` DB 생성)
2. `backend/src/main/resources/application.yml` DB 접속 정보 확인
3. 백엔드 구동:
   ```bash
   cd backend
   ./gradlew bootRun
   ```

### Frontend 실행
1. Node.js 패키지 설치:
   ```bash
   cd frontend
   npm install
   ```
2. 개발 서버 구동:
   ```bash
   npm run dev
   ```
3. `http://localhost:3000` 에서 확인

## 🎨 디자인 시스템
최신 웹 디자인 트렌드인 **Glassmorphism(글래스모피즘)**과 미려한 **Dark Mode**를 적용하여 유저에게 프리미엄 커뮤니티 경험을 제공합니다.
