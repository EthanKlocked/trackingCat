# 02. MVP Phase 1 개발 - 2025-10-01

**작업 일시:** 2025년 10월 1일
**작업 내용:** MVP 핵심 기능 구현 (Phase A ~ E)

---

## 📋 작업 개요

초기 디렉토리 구조 세팅 이후, 클린 아키텍처 기반으로 **타이머 엔진**, **데이터 저장**, **UI/UX**를 구현했습니다.

---

## Phase A: 기반 설정

### 1. 필수 패키지 설치
```bash
npm install @react-native-async-storage/async-storage
```

### 2. 상수 정의 ([src/constants/](../src/constants/))
**`timer.ts`**
- `TIMER_CONSTANTS`: 타이머 업데이트 간격, 최소 산책 시간, 자동 저장 간격
- `STORAGE_KEYS`: AsyncStorage 키 정의
- `TimerStatus` enum: IDLE, WALKING, RESTING, COMPLETED

### 3. 유틸리티 함수 ([src/utils/](../src/utils/))
**`timeFormat.ts`**
- `formatTime()`: ms → HH:MM:SS
- `formatTimeShort()`: ms → MM:SS
- `formatDuration()`: 읽기 쉬운 형식 (1시간 30분)
- `formatDate()`: YYYY-MM-DD

**`uuid.ts`**
- `generateUUID()`: 세션 ID 생성

### 4. 디자인 시스템 ([src/presentation/theme/](../src/presentation/theme/))
**`colors.ts`**
- Primary: 따뜻한 핑크 (#FF9A8B)
- Secondary: 부드러운 민트 (#A8E6CF)
- Walking: 활기찬 노랑 (#FFD93D)
- Resting: 편안한 민트 (#A8E6CF)

**`typography.ts`**
- 폰트 크기, 무게, 라인 높이
- 미리 정의된 텍스트 스타일 (h1, h2, body 등)

**`spacing.ts`**
- 간격, border radius, elevation

---

## Phase B: 데이터 계층 구축

### 1. 데이터 모델 정의 ([src/domain/models/](../src/domain/models/))

**`Session.ts`**
```typescript
interface Session {
  id: string;
  walkDuration: number;    // 산책 시간 (ms)
  restDuration: number;    // 휴식 시간 (ms)
  startedAt: Date;
  completedAt: Date;
  // Phase 3 확장 필드
  userId?: string;
  catId?: string;
  courseId?: string;
}
```

**`TimerState.ts`**
```typescript
interface TimerState {
  status: TimerStatus;
  currentSessionId: string | null;
  startedAt: Date | null;
  totalWalkDuration: number;
  totalRestDuration: number;
  currentSegmentStartedAt: Date | null;
  lastUpdatedAt: Date;      // 백그라운드 복원용
}
```

### 2. LocalStorage 래퍼 ([src/data/storage/](../src/data/storage/))
**`LocalStorage.ts`**
- AsyncStorage 타입 안전 래퍼
- `setItem<T>()`, `getItem<T>()`, `removeItem()`, `clear()`
- 에러 핸들링 포함

### 3. Repository 인터페이스 ([src/domain/repositories/](../src/domain/repositories/))

**`ISessionRepository.ts`**
```typescript
interface ISessionRepository {
  save(session: Session): Promise<void>;
  getById(id: string): Promise<Session | null>;
  getAll(): Promise<Session[]>;
  getByDateRange(start: Date, end: Date): Promise<Session[]>;
  delete(id: string): Promise<void>;
  deleteAll(): Promise<void>;
}
```

**`ITimerStateRepository.ts`**
```typescript
interface ITimerStateRepository {
  save(state: TimerState): Promise<void>;
  get(): Promise<TimerState | null>;
  clear(): Promise<void>;
}
```

### 4. Repository 구현체 ([src/data/repositories/](../src/data/repositories/))

**`LocalSessionRepository.ts`**
- AsyncStorage 기반 세션 저장소
- 배열로 관리, 최신순 정렬
- 날짜 범위 필터링 지원

**`LocalTimerStateRepository.ts`**
- AsyncStorage 기반 타이머 상태 저장소
- 단일 객체 저장/조회

### 🔧 수정 이력
- `LocalStorage.ts`: `getAllKeys()` 반환 타입 `readonly string[]`로 수정 (TypeScript 에러 해결)

---

## Phase C: 비즈니스 로직

### TimerUseCase 구현 ([src/domain/usecases/TimerUseCase.ts](../src/domain/usecases/TimerUseCase.ts))

**핵심 메서드:**

1. **`startWalk()`**
   - 새 세션 생성 (UUID)
   - 타이머 상태 저장
   - 산책 시작

2. **`pauseWalk(currentState)`**
   - 현재 구간 시간 계산
   - totalWalkDuration에 누적
   - 상태를 RESTING으로 전환
   - 휴식 구간 시작 시간 기록

3. **`resumeWalk(currentState)`**
   - 현재 구간 시간 계산
   - totalRestDuration에 누적
   - 상태를 WALKING으로 전환
   - 산책 구간 시작 시간 기록

4. **`completeWalk(currentState)`**
   - 마지막 구간 시간 계산 및 누적
   - Session 객체 생성
   - sessionRepository에 저장
   - 타이머 상태 초기화

5. **`restoreState()` (백그라운드 복원)**
   - 저장된 상태 조회
   - lastUpdatedAt과 현재 시간 비교
   - 백그라운드 시간 계산 (자동 포함)
   - 복원된 상태 반환

6. **`calculateCurrentDuration(state)`**
   - UI 업데이트용 실시간 시간 계산
   - 현재 구간의 경과 시간 추가

---

## Phase D: 상태 관리

### 1. TimerContext ([src/presentation/contexts/TimerContext.tsx](../src/presentation/contexts/TimerContext.tsx))

**제공 값:**
```typescript
{
  timerState: TimerState;
  currentWalkDuration: number;    // 실시간 업데이트
  currentRestDuration: number;    // 실시간 업데이트
  isLoading: boolean;
  startWalk: () => Promise<void>;
  pauseWalk: () => Promise<void>;
  resumeWalk: () => Promise<void>;
  completeWalk: () => Promise<Session>;
}
```

**핵심 기능:**
- **1초마다 타이머 업데이트** (TIMER_CONSTANTS.UPDATE_INTERVAL)
- **앱 시작 시 상태 복원** (`useEffect` + `restoreState()`)
- **백그라운드 감지** (`AppState.addEventListener`)
- **포그라운드 복귀 시 상태 복원**

### 2. SessionContext ([src/presentation/contexts/SessionContext.tsx](../src/presentation/contexts/SessionContext.tsx))

**제공 값:**
```typescript
{
  sessions: Session[];
  isLoading: boolean;
  refreshSessions: () => Promise<void>;
  deleteSession: (id: string) => Promise<void>;
}
```

**역할:**
- 완료된 세션 목록 관리
- Repository 직접 호출 (비즈니스 로직 없음)

### 3. AppProvider ([src/presentation/contexts/AppProvider.tsx](../src/presentation/contexts/AppProvider.tsx))
- SessionProvider, TimerProvider 통합
- 앱 최상단에 주입

---

## Phase E: UI 구현

### 1. 기본 컴포넌트 ([src/presentation/components/](../src/presentation/components/))

**`Button.tsx`**
- variant: primary, secondary, outline
- disabled 상태 지원
- 하드코딩된 스타일 (theme 이슈로 인해)

**`TimerDisplay.tsx`**
- duration (ms), label, color props
- formatTime 유틸 사용
- 하드코딩된 스타일

**`BackgroundScroll.tsx`**
- isScrolling props
- Animated API로 무한 스크롤
- 산책 중: 스크롤, 휴식 중: 정지

**`CatAnimation.tsx`**
- status에 따른 애니메이션
- WALKING: 상하 바운스
- RESTING: 캠핑 씬 (⛺🐱🔥)
- IDLE: 정지

### 2. WalkScreen ([src/presentation/screens/WalkScreen.tsx](../src/presentation/screens/WalkScreen.tsx))

**레이아웃 구조:**
```
┌─────────────────────────┐
│  🐱 산책하는 고양이 (상단) │
├─────────────────────────┤
│                         │
│      🐱 (35% 고정)       │ ← 절대 위치
│                         │
├─────────────────────────┤
│ 산책시간  휴식시간       │ ← 하단 고정
│ 00:03:45  00:01:20      │
│   [버튼들]              │
└─────────────────────────┘
```

**상태별 UI:**
- **IDLE**: "산책 시작" 버튼
- **WALKING**: "잠깐 쉼", "산책 완료" 버튼 + 타이머
- **RESTING**: "산책 재개", "산책 완료" 버튼 + 타이머

### 3. App.tsx 통합
```typescript
<AppProvider>
  <WalkScreen />
</AppProvider>
```

### 🔧 주요 수정 이력

**theme 이슈로 하드코��� 전환:**
- `Button.tsx`: textStyles spread 문제 → 직접 fontSize, fontWeight 지정
- `TimerDisplay.tsx`: theme.textStyles 제거 → 하드코딩
- 타이머 폰트 크기 조정: 48 → 28 (화면 넘침 방지)

**레이아웃 수정:**
- `content`의 `paddingHorizontal` 제거 (BackgroundScroll 전체 화면)
- `animationArea`: `position: absolute, top: 35%` (버튼 영향 제거)
- `bottomContainer`: 하단 고정 (`position: absolute, bottom: 0`)
- 타이머와 버튼을 `bottomContainer`로 그룹화

---

## Phase F-1: 임시 애니메이션

### 이모지 기반 애니메이션
- 고양이: 🐱 (바운스, 캠핑)
- 배경: 🌳🌳🌳🌳 (스크롤)
- 캠핑: ⛺🐱🔥 (불 깜빡임)

### 애니메이션 로직
**BackgroundScroll:**
- Animated.loop + Animated.sequence
- 0 → -300 (6초) → 0 (즉시) 반복
- isScrolling에 따라 start/stop

**CatAnimation:**
- WALKING: translateY 바운스 (-10 ↔ 0, 300ms)
- RESTING: 정적 캠핑 씬 + 불 opacity 애니메이션

---

## 🏗️ 아키텍처 완성도

### 클린 아키텍처 구현
```
Presentation (UI)
    ↓ useTimer, useSessions
Domain (비즈니스 로직)
    ↓ IRepository 인터페이스
Data (저장소 구현)
    ↓ AsyncStorage
```

### 계층 간 의존성
- ✅ Presentation → Domain (인터페이스만 의존)
- ✅ Domain → 독립 (외부 의존 없음)
- ✅ Data → Domain (인터페이스 구현)

### 확장성
- Repository 교체만으로 Firebase 전환 가능
- UI 변경해도 비즈니스 로직 영향 없음

---

## 📦 최종 파일 구조

```
src/
├── constants/
│   ├── timer.ts              # 타이머 상수, enum
│   └── index.ts
├── utils/
│   ├── timeFormat.ts         # 시간 포맷팅
│   ├── uuid.ts               # UUID 생성
│   └── index.ts
├── domain/
│   ├── models/
│   │   ├── Session.ts        # 세션 모델
│   │   ├── TimerState.ts     # 타이머 상태 모델
│   │   └── index.ts
│   ├── repositories/
│   │   ├── ISessionRepository.ts
│   │   ├── ITimerStateRepository.ts
│   │   └── index.ts
│   └── usecases/
│       ├── TimerUseCase.ts   # 핵심 비즈니스 로직
│       └── index.ts
├── data/
│   ├── storage/
│   │   ├── LocalStorage.ts   # AsyncStorage 래퍼
│   │   └── index.ts
│   └── repositories/
│       ├── LocalSessionRepository.ts
│       ├── LocalTimerStateRepository.ts
│       └── index.ts
└── presentation/
    ├── components/
    │   ├── Button.tsx
    │   ├── TimerDisplay.tsx
    │   ├── BackgroundScroll.tsx
    │   ├── CatAnimation.tsx
    │   └── index.ts
    ├── screens/
    │   ├── WalkScreen.tsx
    │   └── index.ts
    ├── contexts/
    │   ├── TimerContext.tsx
    │   ├── SessionContext.tsx
    │   ├── AppProvider.tsx
    │   └── index.ts
    └── theme/
        ├── colors.ts
        ├── typography.ts
        ├── spacing.ts
        └── index.ts
```

---

## 🎯 구현 완료 기능

### 핵심 기능
- ✅ 타이머 엔진 (산책/휴식 측정)
- ✅ 상태 전환 (IDLE → WALKING → RESTING → COMPLETED)
- ✅ 세션 저장 (AsyncStorage)
- ✅ 백그라운드 복원 (시간 자동 계산)
- ✅ 실시간 UI 업데이트 (1초마다)

### UI/UX
- ✅ 상태별 버튼 변경
- ✅ 타이머 표시
- ✅ 임시 애니메이션 (이모지)
- ✅ 레이아웃 고정 (버튼 개수 무관)

### 아키텍처
- ✅ 클린 아키텍처 (3계층 분리)
- ✅ Repository 패턴
- ✅ Context API 상태 관리
- ✅ TypeScript 타입 안전성

---

## 📊 코드 통계

- **총 파일 수**: 30개 이상
- **TypeScript**: 100%
- **컴파일 에러**: 0개
- **아키텍처**: Clean Architecture
- **상태 관리**: React Context
- **저장소**: AsyncStorage (로컬)

---

## 🔗 다음 단계 예정

**Phase F-2: 스프라이트 시트**
- 도트 고양이 애니메이션 PNG
- 도트 배경 이미지
- SpriteAnimation 컴포넌트

**Phase G: 히스토리 화면**
- 완료된 세션 목록
- 날짜별 통계
- 삭제 기능

**Phase H: 개선 사항**
- theme 시스템 정리
- SafeAreaView → react-native-safe-area-context
- 추가 애니메이션 polish
