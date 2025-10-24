# Session 7: Cloud Animations Implementation (2025-10-24)

## Overview
이번 세션에서는 구름 애니메이션 시스템을 구현하고, 시간대별 투명도 전환 기능을 추가했습니다. 나무 애니메이션을 시도했으나 기술적 문제로 보류했습니다.

## 1. 구름 애니메이션 구현

### 리소스 추가
```bash
assets/animations/cloud.json (4.8KB)
```

### CloudAnimation.tsx 생성
단일 구름의 수평 이동 애니메이션을 담당하는 컴포넌트

#### 주요 특징
- **이동 방향**: 오른쪽 → 왼쪽 (해/달과 반대)
- **시작 위치**: `SCREEN_WIDTH` (화면 오른쪽 끝)
- **종료 위치**: `-size - 50` (완전히 화면 밖)
- **useNativeDriver**: true (성능 최적화)

#### 핵심 코드
```typescript
interface CloudAnimationProps {
  delay: number;
  yPosition: number;
  duration: number;
  onComplete?: () => void;
  size?: number;
  speedMultiplier?: number; // 속도 제어 (추후 제거됨)
}

// 단순한 수평 이동 애니메이션
Animated.timing(translateX, {
  toValue: -size - 50,
  duration,
  useNativeDriver: true,
  isInteraction: false,
}).start(({ finished }) => {
  if (finished && onCompleteRef.current) {
    onCompleteRef.current();
  }
});
```

#### 최적화
- `onComplete`를 `useRef`로 관리하여 불필요한 재렌더링 방지
- dependency 변경으로 인한 애니메이션 재시작 문제 해결

### CloudManager.tsx 생성
여러 구름의 생성/관리를 담당하는 매니저 컴포넌트

#### 구름 생성 설정
```typescript
const createCloud = (): Cloud => {
  return {
    id: `cloud-${Date.now()}-${Math.random()}`,
    delay: Math.random() * 500, // 0~0.5초 랜덤 지연
    yPosition: CLOUD_MIN_Y + Math.random() * (CLOUD_MAX_Y - CLOUD_MIN_Y),
    duration: 18000 + Math.random() * 10000, // 18~28초 (평균 23초)
    size: 80 + Math.random() * 40, // 80~120px
  };
};
```

#### 생성 빈도
- **최대 개수**: 4개 동시 표시
- **체크 간격**: 2초마다
- **생성 확률**: 95%
- **초기 구름**: 1개

#### 높이 제약
```typescript
const CAT_POSITION = SCREEN_HEIGHT * 0.45;
const CLOUD_MIN_Y = 100; // 최소 높이
const CLOUD_MAX_Y = CAT_POSITION - 100; // 고양이 위 100px까지
```

## 2. 시간대별 투명도 전환

### 구현 개념
구름이 밤에는 반투명해지고, 낮에는 불투명해지는 자연스러운 효과

### Progress 계산
TimeAnimation의 `scrollX`를 0~1 범위로 변환:
```typescript
const progress = scrollX.interpolate({
  inputRange: [-virtualWidth, 0],
  outputRange: [1, 0],
  extrapolate: 'clamp',
});
```

### Opacity Interpolation
```typescript
const cloudOpacity = progress.interpolate({
  inputRange: [0, 0.5, 0.6, 0.9, 1.0],
  outputRange: [1.0, 1.0, 0.4, 0.4, 1.0],
  extrapolate: 'clamp',
});
```

#### 시간대별 투명도
- **0.0~0.5 (아침→낮→저녁)**: opacity 1.0 (완전 불투명)
- **0.5~0.6 (저녁→밤 전환)**: 1.0 → 0.4 점진적 감소
- **0.6~0.9 (밤)**: opacity 0.4 유지 (반투명)
- **0.9~1.0 (새벽→아침 전환)**: 0.4 → 1.0 점진적 복구

### WalkScreen 통합
```typescript
<TimeAnimation ...>
  {(scrollX, virtualWidth) => (
    <>
      <DayCycleBackground scrollX={scrollX} virtualWidth={virtualWidth} />
      {timerState.status !== TimerStatus.IDLE && (
        <CloudManager
          status={timerState.status}
          scrollX={scrollX}
          virtualWidth={virtualWidth}
        />
      )}
    </>
  )}
</TimeAnimation>
```

## 3. 레이어 순서 (z-index)

```
1. DayCycleBackground (배경 + 해/달) - 최하단
2. (TreeManager - 보류됨)
3. CatAnimation (고양이) - 중간
4. CloudManager (z-index: 10) - 해/달 위
5. UI 요소들 - 최상단
```

구름이 해와 달을 가릴 수 있도록 z-index를 높게 설정

## 4. 속도 제어 실험 및 제거

### 초기 구현
쉴 때 구름이 절반 속도로 느려지는 기능:
```typescript
const speedMultiplier = status === TimerStatus.RESTING ? 0.5 : 1.0;
```

### 문제점
- CloudAnimation의 복잡도 증가
- 상태 변경 시 애니메이션 재시작 로직 필요
- 사용자 경험상 큰 차이 없음

### 최종 결정
**일정한 속도로 단순화**
- `speedMultiplier` 로직 완전 제거
- 항상 동일한 속도로 이동 (18~28초)
- 코드 복잡도 감소, 안정성 향상

## 5. 나무 애니메이션 시도 및 보류

### 시도한 구현
```typescript
// TreeAnimation.tsx, TreeManager.tsx 생성
// tree.json (175KB) 추가
```

#### 요구사항
- 크기: 400px (구름보다 큼)
- 위치: 고양이보다 낮게 (SCREEN_HEIGHT * 0.55)
- Lottie 한 번만 재생 (`loop={false}`)
- RESTING 시 멈춤 (speedMultiplier = 0)
- z-index: 구름보다 낮음 (고양이를 가리지 않음)

### 발생한 문제

#### 1. 버튼 입력 막힘
- TreeManager의 `pointerEvents` 설정 문제
- z-index가 UI 버튼을 덮음
- `pointerEvents="none"` → `pointerEvents="box-none"` 시도했으나 실패

#### 2. 타이머 멈춤
- RESTING 상태 전환 시 전체 앱이 멈춤
- 시간 흐름 중단 (해/달 애니메이션만 작동)
- 버튼 클릭 불가

#### 3. 근본 원인 분석
```typescript
// speedMultiplier = 0일 때 문제 발생
const remainingDuration = duration * (1 - progress) / speedMultiplier;
// 0으로 나누는 문제는 아니었지만, 애니메이션 정지 로직이 이벤트 루프 막음

// Lottie pause/resume 시도도 실패
if (lottieRef.current) {
  lottieRef.current.pause(); // 이 부분에서 문제 발생
}
```

#### 4. 단순화 시도
- speedMultiplier 로직 제거
- 쉴 때도 계속 움직이게 변경
- 그러나 여전히 앱이 멈추는 문제 발생

### 최종 결정
**나무 기능 완전 제거**
```bash
rm TreeAnimation.tsx
rm TreeManager.tsx
rm assets/animations/tree.json
```

#### 보류 이유
1. 기술적 복잡도가 예상보다 높음
2. 앱 안정성에 영향
3. 구름 애니메이션만으로도 충분한 효과
4. 향후 더 안정적인 방법으로 재시도 가능

## 6. 파일 변경 사항

### 신규 생성
- `src/presentation/components/CloudAnimation.tsx`
- `src/presentation/components/CloudManager.tsx`
- `assets/animations/cloud.json`

### 수정
- `src/presentation/screens/WalkScreen.tsx`
  - CloudManager 통합
  - scrollX/virtualWidth props 전달

- `src/presentation/components/index.ts`
  - CloudAnimation, CloudManager export 추가

### 제거 (나무 관련)
- `~~TreeAnimation.tsx~~` (생성 후 제거)
- `~~TreeManager.tsx~~` (생성 후 제거)
- `assets/animations/tree.json` (제거)

## 7. 최종 설정 값

### 구름 속도
- **Duration**: 18~28초 (평균 23초)
- **느린 이유**: 배경 애니메이션과 조화, 자연스러운 흐름

### 구름 빈도
- **최대 개수**: 4개
- **생성 간격**: 2초
- **생성 확률**: 95%
- **결과**: 지속적으로 2~4개의 구름이 화면에 보임

### 크기 범위
- **80~120px**: 다양한 크기로 자연스러움

### 높이 범위
- **최소**: 100px (화면 상단에서)
- **최대**: 고양이 100px 위까지
- **결과**: 고양이를 가리지 않으면서 하늘에 배치

## 8. 성능 최적화

### useNativeDriver 사용
```typescript
useNativeDriver: true
```
- 네이티브 스레드에서 애니메이션 실행
- JavaScript 스레드 부담 감소
- 60fps 유지

### Ref 패턴 활용
```typescript
const onCompleteRef = useRef(onComplete);

useEffect(() => {
  onCompleteRef.current = onComplete;
}, [onComplete]);
```
- 불필요한 애니메이션 재시작 방지
- 메모리 누수 방지

### pointerEvents="none"
```typescript
<Animated.View style={styles.container} pointerEvents="none">
```
- 구름이 터치 이벤트를 차단하지 않음
- 버튼 클릭 가능 유지

## 9. 동작 흐름

### IDLE 상태
- 구름 완전 제거 (`setTrees([])`)
- CloudManager 렌더링 안 됨

### WALKING/RESTING 상태
1. 초기 구름 1개 생성
2. 2초마다 95% 확률로 새 구름 추가 (최대 4개)
3. 각 구름이 오른쪽→왼쪽으로 이동
4. 완료 시 `removeCloud()` 호출로 제거
5. 시간대에 따라 투명도 자동 조절

### IDLE로 복귀
- 모든 구름 즉시 제거
- interval cleanup
- 다음 시작 시 새로운 구름으로 시작

## 10. Git Commit

### 커밋 정보
```bash
git add .
git commit -m "feat: add cloud animations with day/night opacity transitions"
git push origin main
```

#### 커밋 해시
`0c95143`

#### 변경 통계
- 5 files changed
- 268 insertions(+)
- 추가: cloud.json, CloudAnimation.tsx, CloudManager.tsx
- 수정: WalkScreen.tsx, index.ts

### Push 이슈
**문제**: git push가 매우 느림
**원인**: SSH 키 passphrase 인증 대기
**해결**: `ssh-add ~/.ssh/ethank_private` 실행 후 passphrase 입력

## 11. 학습 내용

### React Native Animated API
- `interpolate`를 활용한 복잡한 값 변환
- `extrapolate: 'clamp'`로 범위 제한
- `useNativeDriver`의 중요성

### 상태 기반 렌더링
```typescript
{timerState.status !== TimerStatus.IDLE && (
  <CloudManager ... />
)}
```
- 조건부 렌더링으로 완전한 제거/생성
- 중간 상태 없이 깔끔한 전환

### 애니메이션 디버깅
- `console.log`로 생명주기 추적
- `finished: false` → useEffect dependency 문제
- `onComplete`가 호출 안 됨 → ref 패턴으로 해결

### 단순화의 중요성
- 복잡한 speedMultiplier 로직 제거
- 나무 기능 보류
- **안정성 > 기능**

## 12. 이슈 및 해결

### 이슈 1: 구름 애니메이션 재시작 반복
**증상**: 구름이 시작하자마자 리셋되고 다시 시작
**원인**: `onComplete`가 dependency에 있어 매 렌더링마다 변경
**해결**: `useRef`로 `onComplete` 관리

### 이슈 2: 구름이 0개가 되는 경우 발생
**증상**: 구름이 사라진 후 오랫동안 생성 안 됨
**원인**: 60% 생성 확률이 너무 낮음
**해결**: 95%로 상향, 체크 간격 2초로 단축

### 이슈 3: 구름 속도가 너무 빠름
**증상**: 구름이 너무 빨리 지나감
**원인**: 10~15초 duration
**해결**: 18~28초로 변경

### 이슈 4: 나무 애니메이션으로 앱 전체 멈춤
**증상**: RESTING 전환 시 타이머 멈춤, 버튼 입력 불가
**원인**: speedMultiplier = 0 처리 로직의 무한 루프 또는 이벤트 차단
**해결**: 나무 기능 완전 제거 (보류)

## 13. 다음 단계 계획

### 완료된 기능 ✅
- ✅ 시간대별 배경 그라디언트
- ✅ 해/달 애니메이션
- ✅ 구름 애니메이션 (시간대별 투명도)
- ✅ 고양이 애니메이션 (Lottie)
- ✅ 타이머 기능

### 보류된 기능 🔄
- 🔄 나무 애니메이션 (기술적 문제로 보류)
  - 향후 단순 이미지로 재시도 고려
  - 또는 Lottie 없이 SVG로 시도

### 다음 우선순위

#### Phase 1: 안정화
- [ ] SafeAreaView deprecation 경고 수정
- [ ] 코드 정리 및 주석 정리
- [ ] 사용하지 않는 imports 제거

#### Phase 2: 추가 배경 요소 (선택적)
- [ ] 별 추가 (밤 시간대)
  - 단순 코드 기반 도형
  - 깜빡임 애니메이션
- [ ] 땅/바닥 (SpaceAnimation 활용)
  - WALKING 시에만 이동
  - 단순 그라디언트

#### Phase 3: 히스토리 기능
- [ ] 완료된 세션 목록
- [ ] 통계 화면
- [ ] 날짜별 그룹화

#### Phase 4: 고급 기능
- [ ] 사운드 효과
- [ ] 알림 기능
- [ ] 데이터 백업/복원

## 14. 기술적 결정 요약

### ✅ 채택한 것
1. **구름 애니메이션**: 자연스럽고 가벼움
2. **시간대별 투명도**: 몰입감 증가
3. **일정한 속도**: 단순하고 안정적
4. **높은 생성 빈도**: 지속적인 시각적 효과
5. **useRef 패턴**: 불필요한 재렌더링 방지

### ❌ 거부한 것
1. **speedMultiplier 기능**: 복잡도 증가, 실익 부족
2. **나무 애니메이션**: 기술적 문제, 앱 안정성 저해
3. **페이드인 효과**: 단순한 등장이 더 자연스러움

### 🔄 보류한 것
1. **나무/오브젝트**: 향후 더 안정적인 방법으로 재시도
2. **별 애니메이션**: 우선순위 낮음
3. **SpaceAnimation**: 필요성 재검토

---

**세션 완료 시간**: 2025-10-24
**다음 세션 예정**: 코드 안정화 및 히스토리 기능 구현
