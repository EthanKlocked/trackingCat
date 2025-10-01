# 04. Background Image Implementation (2025-10-01)

## Overview
Phase F-2 구현: 임시 이모지 애니메이션을 실제 픽셀 아트 배경 이미지로 교체

## Work Summary

### 1. Theme System Refactoring
**Issue**: Button과 TimerDisplay 컴포넌트가 하드코딩된 스타일 사용 중
**Solution**: theme 객체로 완전히 전환
- `src/presentation/components/Button.tsx`: theme.colors, theme.spacing, theme.typography 사용
- `src/presentation/components/TimerDisplay.tsx`: theme 값으로 수정
- 테스트 결과: 모든 텍스트가 정상 표시됨

### 2. Background Image Component Creation
**File**: `src/presentation/components/BackgroundImage.tsx`

**Initial Implementation**:
```typescript
- 이미지 2개를 side-by-side로 배치
- Animated.loop + Animated.sequence로 무한 스크롤
- resizeMode="cover"로 화면 전체 커버
```

### 3. Image Asset Management
**Path**: `assets/backgrounds/walking_path.png`
- 최종 이미지: 1024x1024 픽셀 아트
- 초기 시도: `src/assets/` → Expo Metro bundler가 require로 로드 불가
- 해결: 프로젝트 루트의 `assets/` 폴더 사용

### 4. Issues and Solutions

#### Issue 1: Image Path Resolution
**Problem**: `require('../../../assets/')` 경로 해석 실패
**Attempts**:
- `src/assets/backgrounds/` → 실패
- `assets/backgrounds/` → 성공
**Solution**: 루트 `assets/` 폴더 사용, 코드에서 `../../../assets/` 참조

#### Issue 2: Vertical Image Repeat
**Problem**: `resizeMode="repeat"` 사용 시 상하로도 이미지 반복
**Solution**: `resizeMode="cover"`로 되돌리고, 이미지 크기를 정확히 계산
```typescript
const scale = SCREEN_HEIGHT / IMAGE_HEIGHT;
const SCALED_IMAGE_WIDTH = IMAGE_WIDTH * scale;
```

#### Issue 3: Animation Speed Issues
**Problem 3-1**: 이음새에서 잠깐 멈춤
- 원인: `Animated.loop` + `sequence`의 `duration: 0` 리셋
- 해결: 3개 이미지로 늘려서 시각적 개선 (완벽한 해결은 어려움)

**Problem 3-2**: Pause/resume 후 애니메이션 멈춤
- 원인: `Animated.loop`는 stop 후 restart 불가
- 해결: loop 제거, 재귀 호출로 무한 반복 구현
```typescript
const startAnimation = useCallback(() => {
  Animated.sequence([...]).start(() => {
    if (isAnimatingRef.current) {
      startAnimation(); // 재귀 호출
    }
  });
}, []);
```

**Problem 3-3**: Resume 시 속도가 점점 느려짐
- 원인: 멈춘 위치에서 재개하지만 duration은 고정 (10초)
- 분석: `-500` 위치에서 재개 → `-1000`까지 거리 500px → 10초 소요 → 속도 절반
- 해결: 남은 거리 비율로 duration 조정
```typescript
const currentValue = currentPositionRef.current;
const remainingDistance = Math.abs(-SCALED_IMAGE_WIDTH - currentValue);
const totalDistance = SCALED_IMAGE_WIDTH;
const remainingDuration = (remainingDistance / totalDistance) * FULL_CYCLE_DURATION;
```

**Problem 3-4**: Position tracking 정확도
- 원인: `addListener`로 값을 가져오는 방식이 불안정
- 해결: `stopAnimation(callback)`으로 정확한 위치 저장
```typescript
scrollX.stopAnimation((value) => {
  currentPositionRef.current = value;
});
```

### 5. Final Implementation

#### BackgroundImage.tsx Key Features:
1. **3개 이미지 배치**: seamless 무한 스크롤
2. **재귀 애니메이션**: loop 대신 callback으로 재귀 호출
3. **정확한 위치 추적**: `currentPositionRef`로 멈춘 위치 저장
4. **비례 duration**: 남은 거리에 따라 duration 동적 조정
5. **외부 제어**: `forwardRef` + `useImperativeHandle`로 reset 메서드 제공

```typescript
export interface BackgroundImageRef {
  reset: () => void;
}

const startAnimation = useCallback(() => {
  const currentValue = currentPositionRef.current;
  const remainingDistance = Math.abs(-SCALED_IMAGE_WIDTH - currentValue);
  const remainingDuration = (remainingDistance / SCALED_IMAGE_WIDTH) * FULL_CYCLE_DURATION;

  Animated.sequence([
    Animated.timing(scrollX, {
      toValue: -SCALED_IMAGE_WIDTH,
      duration: remainingDuration,
      easing: Easing.linear,
      useNativeDriver: true,
    }),
    Animated.timing(scrollX, { toValue: 0, duration: 0 }),
  ]).start(({ finished }) => {
    if (finished) currentPositionRef.current = 0;
    if (isAnimatingRef.current) startAnimation();
  });
}, [scrollX]);
```

#### WalkScreen.tsx Integration:
```typescript
const backgroundRef = useRef<BackgroundImageRef>(null);

const handleComplete = async () => {
  const session = await completeWalk();
  backgroundRef.current?.reset(); // 배경 리셋
  // TODO: 완료 애니메이션/이벤트 추가 가능
};

<BackgroundImage
  ref={backgroundRef}
  isScrolling={timerState.status === TimerStatus.WALKING}
/>
```

### 6. Testing Results

**Verified Behaviors**:
✅ 산책 시작: 배경 스크롤 시작
✅ 일정한 속도: 10초에 한 사이클 (Easing.linear)
✅ 잠깐 쉼: 배경 멈춤, 위치 유지
✅ 산책 재개: 멈춘 위치에서 동일한 속도로 계속 스크롤
✅ 산책 완료: 배경 처음 위치로 리셋
✅ 여러 번 pause/resume: 속도 일정 유지

**Known Limitations**:
⚠️ 이음새 리셋 시 미세한 멈춤 (duration: 0) - 완전히 제거 불가
  - 3개 이미지 사용으로 시각적 영향 최소화
  - 향후 다른 접근 방식 고려 가능 (예: 매우 긴 이미지 사용)

## File Changes

### New Files:
- `src/presentation/components/BackgroundImage.tsx`

### Modified Files:
- `src/presentation/components/Button.tsx` - theme 사용으로 전환
- `src/presentation/components/TimerDisplay.tsx` - theme 사용으로 전환
- `src/presentation/components/index.ts` - BackgroundImage export 추가
- `src/presentation/screens/WalkScreen.tsx` - BackgroundImage 통합, ref 사용

### Assets:
- `assets/backgrounds/walking_path.png` (1024x1024)

## Technical Notes

### Animation Architecture:
- **Animated.loop 대신 재귀**: loop는 stop 후 restart 불가
- **Position tracking**: `stopAnimation(callback)`으로 정확한 값 저장
- **Dynamic duration**: 속도 일정 유지를 위한 거리 비례 계산

### Future Improvements:
1. 완료 시 축하 애니메이션/사운드 추가
2. 이음새 멈춤 완전 제거 (더 긴 이미지 또는 다른 방식)
3. 배경 속도 조절 옵션
4. 하단 패널 반투명 배경 추가
5. 상단 타이틀 페이드 아웃

## Next Steps
- Phase G: History screen (완료된 세션 목록 보기)
- Phase H: Refactoring (SafeAreaView deprecation, 기타 개선사항)
