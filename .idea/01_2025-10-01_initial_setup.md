# 01. 초기 프로젝트 세팅 - 2025-10-01

**작업 일시:** 2025년 10월 1일
**작업 내용:** Expo 프로젝트 생성 및 클린 아키텍처 디렉토리 구조 세팅

---

## 📋 작업 요약

### 1. Expo 프로젝트 초기화 완료

```json
{
  "name": "trackingcat",
  "version": "1.0.0",
  "dependencies": {
    "expo": "~54.0.10",
    "react": "19.1.0",
    "react-native": "0.81.4"
  }
}
```

- TypeScript 설정 완료
- Git 저장소 초기화 완료 (master 브랜치)
- 기본 App.tsx 파일 생성됨

---

## 📁 디렉토리 구조 완성

### 최종 구조

```
trackingCat/
├── .idea/                      # 세션 기록 및 프로젝트 문서
├── src/
│   ├── assets/                 # 이미지/애니메이션 리소스
│   │   ├── backgrounds/        # 배경 이미지
│   │   ├── cats/              # 고양이 이미지/애니메이션
│   │   └── items/             # 아이템 이미지
│   ├── constants/             # 앱 전역 상수
│   ├── data/                  # Data Layer (로컬 저장소)
│   │   ├── repositories/      # Repository 구현체
│   │   └── storage/           # AsyncStorage 래퍼
│   ├── domain/                # Domain Layer (비즈니스 로직)
│   │   ├── entities/          # Cat, Course 등 엔티티
│   │   ├── models/            # Session, Timer 모델
│   │   ├── repositories/      # Repository 인터페이스
│   │   └── usecases/          # 타이머 로직
│   ├── presentation/          # Presentation Layer (UI)
│   │   ├── animations/        # 고양이/배경 애니메이션
│   │   ├── components/        # 재사용 가능한 UI 컴포넌트
│   │   ├── contexts/          # React Context (상태 관리)
│   │   ├── navigation/        # 화면 전환
│   │   ├── screens/           # 메인 화면들
│   │   └── theme/             # 디자인 시스템
│   └── utils/                 # 유틸리티 함수
├── App.tsx                    # 앱 진입점
├── index.ts                   # Expo 진입점
├── package.json
└── tsconfig.json
```

---

## 🎯 아키텍처 설계 원칙

### 3계층 클린 아키텍처

1. **Presentation Layer**
   - 역할: UI 렌더링, 사용자 이벤트 처리
   - 기술: React Native 컴포넌트
   - 의존성: Domain Layer만 참조

2. **Domain Layer**
   - 역할: 비즈니스 로직, 타이머 엔진, 데이터 규칙
   - 기술: TypeScript 순수 로직
   - 의존성: 다른 계층에 의존하지 않음 (인터페이스만 정의)

3. **Data Layer**
   - 역할: 데이터 저장/조회 (현재: AsyncStorage)
   - 기술: AsyncStorage 래퍼
   - 확장성: Phase 3에서 Firebase/Supabase로 교체 가능

---

## ✅ 완료된 작업

- [x] Expo 프로젝트 생성
- [x] TypeScript 설정
- [x] 클린 아키텍처 디렉토리 구조 생성
- [x] Git 저장소 초기화
- [x] 세션 기록 문서 작성

---

## 🔜 다음 작업 예정

### Phase 1 - 핵심 타이머 기능 구현

1. **데이터 모델 정의**
   - Session 모델
   - Timer 상태 모델
   - TimerEvent 타입

2. **로컬 저장소 구현**
   - AsyncStorage 래퍼
   - SessionRepository 인터페이스 및 구현체

3. **타이머 엔진**
   - TimerUseCase (산책/휴식 시간 측정)
   - 상태 복원 로직
   - 백그라운드 지원

4. **UI 구현**
   - 메인 타이머 화면
   - 산책/캠핑 애니메이션
   - 결과 화면

5. **디자인 시스템**
   - 색상 팔레트
   - 타이포그래피
   - 간격/레이아웃 상수

---

## 📝 기술적 결정 사항

1. **로컬 저장소만 사용 (MVP)**
   - 백엔드 없이 AsyncStorage로만 데이터 관리
   - 빠른 MVP 검증 가능
   - 추후 서버 마이그레이션 용이하도록 Repository 패턴 적용

2. **클린 아키텍처 적용**
   - 계층 간 의존성 철저히 분리
   - Domain Layer는 외부 의존성 없음
   - Data Layer 구현체만 교체하면 백엔드 전환 가능

3. **디자인 유연성 확보**
   - 모든 스타일 변수를 theme 파일로 분리
   - 애니메이션 자산도 별도 관리
   - 코드 수정 없이 디자인 변경 가능

---

## 🔗 관련 문서

- [00_project_planning.md](./.idea/00_project_planning.md) - 전체 프로젝트 기획서
