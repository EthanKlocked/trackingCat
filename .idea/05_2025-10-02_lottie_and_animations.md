# Session 6: Lottie Animations and Time/Space Separation (2025-10-02)

## Overview
이번 세션에서는 Lottie 애니메이션 시스템을 구축하고, 배경에 해/달을 추가하며, 시간과 공간의 애니메이션을 분리하는 아키텍처를 구현했습니다.

## 1. Lottie 애니메이션 시스템 구축

### 설치
```bash
npx expo install lottie-react-native
```

### CatAnimation.tsx 리팩토링
- **기존**: 이모지 기반 애니메이션
- **변경**: Lottie JSON 기반 애니메이션

#### 3가지 상태별 애니메이션
1. **IDLE**: `cat_relaxing.json` - 출발 전 휴식
2. **WALKING**: `cat_walking.json` - 걷는 애니메이션
3. **RESTING**: `cat_playing.json` - 쉬는 중 (크기: 170x170, marginTop: 20)

#### 주요 코드
```typescript
type AnimationType = 'lottie' | 'sprite' | 'emoji';
const ANIMATION_TYPE: AnimationType = 'lottie';

// 상태별 Lottie 렌더링
<LottieView
  ref={walkingLottieRef}
  source={require('../../../assets/animations/cat_walking.json')}
  autoPlay
  loop
  style={styles.lottie}
/>
```

#### 향후 확장 구조
- `ANIMATION_TYPE`을 변경하면 쉽게 다른 애니메이션 방식으로 전환 가능
- 커스텀 스프라이트 프레임 애니메이션 추가 시 `'sprite'` 케이스만 구현

### 애니메이션 리소스
```
assets/animations/
├── cat_relaxing.json (21KB)
├── cat_walking.json (34KB)
├── cat_playing.json (21KB)
├── sun.json (6KB)
└── moon.json (8KB)
```

## 2. UI/UX 개선

### 헤더
- **타이틀 변경**: "🐱 산책하는 고양이" → "Tracking Cat"
- **조건부 표시**: IDLE 상태에서만 표시
```typescript
{timerState.status === TimerStatus.IDLE && (
  <View style={styles.header}>
    <Text style={styles.title}>Tracking Cat</Text>
  </View>
)}
```

### 타이머 디스플레이
- **라벨 변경**: "산책 시간/휴식 시간" → "Working/Relaxing"
- **위치**: 하단 중앙 → 상단 좌우 배치
- **크기 축소**:
  - 시간 폰트: 28 → 18
  - 라벨 폰트: xs → 10
- **반투명 배경**: `rgba(255, 255, 255, 0.3)`
- **텍스트 색상**: 검정(#000)으로 고정하여 배경색 변화에도 가독성 유지

```typescript
const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 12,
    minWidth: 80,
  },
  // ...
});
```

### 고양이 애니메이션 위치
- **애니메이션 영역**: top 35% → 45% (더 아래로)
- **cat_playing 특별 스타일**: 170x170, marginTop: 20
- **모닥불 이모지 제거**: Lottie만 표시

## 3. 배경 시스템 - 해/달 추가

### DayCycleBackground.tsx 확장
해와 달을 시간대에 맞춰 자동으로 표시하고 이동시키는 기능 추가

#### 시간대별 천체 표시
- **해 (sun.json)**:
  - 표시 시간: 아침~저녁 (progress 0.0~0.4)
  - 정오(0.2)에 화면 중앙 위치
  - 왼쪽에서 떠서 오른쪽으로 짐

- **달 (moon.json)**:
  - 표시 시간: 밤~새벽 (progress 0.5~1.0)
  - 자정(0.7)에 화면 중앙 위치
  - 왼쪽에서 떠서 오른쪽으로 짐

#### 주요 코드
```typescript
// 해 opacity 및 위치
const sunOpacity = progress.interpolate({
  inputRange: [0, 0.05, 0.35, 0.4],
  outputRange: [0, 1, 1, 0],
  extrapolate: 'clamp',
});

const sunPosition = progress.interpolate({
  inputRange: [0, 0.2, 0.4],
  outputRange: [-50, SCREEN_WIDTH / 2 - 40, SCREEN_WIDTH + 50],
  extrapolate: 'clamp',
});

// 달도 동일한 패턴
```

#### 위치 조정
- `top: 80 → 140` (너무 위에 있어서 아래로 이동)

## 4. 시간/공간 애니메이션 분리 아키텍처

### 개념 분리
**시간의 흐름** (항상 움직여야 함):
- 배경 그라디언트 (하루 사이클)
- 해/달 (천체)
- 구름, 별 등 (추후 추가)

**공간의 흐름** (걸을 때만 움직임):
- 땅/바닥
- 나무, 건물 등의 오브젝트
- 고양이가 실제로 이동하는 공간

### TimeAnimation 컴포넌트 생성
새로운 `TimeAnimation.tsx` 생성

#### 특징
- **항상 동작**: WALKING, RESTING 중 시간이 흐름
- **IDLE 시 리셋**: 처음 상태(아침, scrollX = 0)로 되돌림
- **위치 저장**: 멈출 때 현재 위치 저장, 재개 시 이어서 진행

#### 주요 코드
```typescript
interface TimeAnimationProps {
  isRunning: boolean; // 시간이 흐르는지 여부 (IDLE이 아닐 때)
  shouldReset?: boolean; // true일 때 처음 상태로 리셋
  children: (scrollX: Animated.Value, virtualWidth: number) => ReactNode;
  screenWidth: number;
}

useEffect(() => {
  if (shouldReset) {
    // IDLE 상태: 처음 위치로 리셋
    scrollX.setValue(0);
    currentPositionRef.current = 0;
  } else if (isRunning) {
    // 애니메이션 시작
    startAnimation();
  } else {
    // 현재 위치에서 멈춤
    scrollX.stopAnimation((value) => {
      currentPositionRef.current = value;
    });
  }
}, [isRunning, shouldReset, startAnimation, scrollX]);
```

### WalkScreen 업데이트
```typescript
<TimeAnimation
  isRunning={timerState.status !== TimerStatus.IDLE}
  shouldReset={timerState.status === TimerStatus.IDLE}
  screenWidth={SCREEN_WIDTH}
>
  {(scrollX, virtualWidth) => (
    <DayCycleBackground scrollX={scrollX} virtualWidth={virtualWidth} />
  )}
</TimeAnimation>
```

### BackgroundAnimation 예약
- 기존 `BackgroundAnimation.tsx`는 그대로 유지
- 향후 땅, 나무 등 공간 오브젝트 추가 시 사용
- WALKING 상태일 때만 동작

## 5. 파일 변경 사항

### 신규 파일
- `src/presentation/components/TimeAnimation.tsx` - 시간 흐름 애니메이션

### 수정 파일
- `src/presentation/components/CatAnimation.tsx`
  - Lottie 지원 추가
  - 3가지 상태별 애니메이션
  - 모닥불 제거

- `src/presentation/components/TimerDisplay.tsx`
  - 크기 축소 (시간: 18, 라벨: 10)
  - 반투명 배경 추가
  - 텍스트 색상 고정

- `src/presentation/screens/WalkScreen.tsx`
  - 타이틀 변경 및 조건부 표시
  - 타이머 상단 좌우 배치
  - TimeAnimation 적용
  - 고양이 애니메이션 위치 조정 (45%)
  - BackgroundAnimation 제거 (TimeAnimation으로 대체)

- `src/presentation/backgrounds/DayCycleBackground.tsx`
  - sun.json, moon.json 추가
  - 시간대별 opacity 및 위치 interpolation
  - 천체 위치 조정 (top: 140)

- `src/presentation/components/index.ts`
  - TimeAnimation export 추가

### 추가 리소스
- `assets/animations/cat_relaxing.json`
- `assets/animations/sun.json`
- `assets/animations/moon.json`

## 6. 동작 흐름

### IDLE (처음/완료 후)
1. 타이틀 "Tracking Cat" 표시
2. 배경은 아침 상태(scrollX = 0)로 고정
3. 해/달 숨김
4. cat_relaxing.json 애니메이션

### WALKING (산책 중)
1. 타이틀 숨김
2. 타이머 상단 좌우 표시
3. 시간 흐름 (배경, 해/달 이동)
4. cat_walking.json 애니메이션

### RESTING (휴식 중)
1. 타이틀 숨김
2. 타이머 상단 좌우 표시
3. 시간 흐름 계속 (배경, 해/달 계속 이동)
4. cat_playing.json 애니메이션

## 7. 기술적 결정 사항

### Lottie vs 이미지 vs 스프라이트
- **선택**: Lottie JSON
- **이유**:
  - 파일 크기 작음 (KB 단위)
  - 품질 손실 없음 (벡터 기반)
  - 쉬운 색상/속도 조정
  - 풍부한 무료 리소스 (LottieFiles)
- **향후**: 커스텀 스프라이트 프레임으로 교체 가능한 구조 유지

### 시간/공간 분리 이유
- **명확한 책임**: 시간 흐름과 공간 이동은 별개
- **성능**: 필요한 것만 애니메이션
- **확장성**: 각각 독립적으로 오브젝트 추가 가능
- **직관성**: 쉴 때도 시간은 흐르지만 공간은 멈춤

## 8. 다음 단계 계획

### 공간 오브젝트 추가
- 땅/바닥 구현 (코드 기반 그라디언트)
- 구름 추가 (간단한 도형 조합)
- 나무/건물 (선택적, SVG)

### SpaceAnimation 활용
- BackgroundAnimation을 SpaceAnimation으로 리네임 고려
- WALKING 중에만 움직이는 오브젝트 추가

### 추가 배경 테마
- ForestBackground (숲)
- BeachBackground (해변)
- 사용자가 선택 가능하도록

### Phase G: 히스토리 화면
- 완료된 산책 세션 목록
- 통계 표시

### Phase H: 리팩토링
- SafeAreaView deprecation 경고 수정
- 코드 정리

## 9. 학습 내용

### Lottie 통합
- `Animated.createAnimatedComponent`는 필요 없음 (LottieView 자체가 제어 가능)
- `ref`로 play/pause 제어
- `autoPlay`, `loop` props 활용

### Animated 위치 보간
- `inputRange`는 반드시 증가하는 순서
- `extrapolate: 'clamp'`로 범위 밖 값 제한
- opacity와 position 동시 제어 가능

### 컴포넌트 재사용성
- render props 패턴으로 유연성 확보
- `isRunning`, `shouldReset` 같은 명확한 props 이름

## 10. 이슈 및 해결

### 문제 없음
이번 세션은 순조롭게 진행되었으며, 아키텍처 설계와 구현이 원활했습니다.

---

**세션 완료 시간**: 2025-10-02
**다음 세션 예정**: 공간 오브젝트 추가 및 SpaceAnimation 구현
