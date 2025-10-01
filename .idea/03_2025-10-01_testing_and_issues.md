# 03. 테스트 및 이슈 정리 - 2025-10-01

**테스트 일시:** 2025년 10월 1일
**테스트 환경:** iPhone + Expo Go
**테스트 방법:** 실제 디바이스 테스트

---

## 🧪 테스트 결과

### ✅ 정상 동작 확인

#### 1. 타이머 기능
- **산책 시작**: 정상 동작
- **시간 측정**: 1초마다 정확히 증가
- **일시정지 (휴식)**: 산책 시간 정지, 휴식 시간 측정 시작
- **재개**: 휴식 시간 정지, 산책 시간 재개
- **완료**: 세션 저장 확인

**테스트 로그:**
```
LOG  Walk completed: {
  "completedAt": 2025-10-01T08:19:34.318Z,
  "id": "0b2da57f-a60d-41fd-a15d-4c0d092a731f",
  "restDuration": 7253,
  "startedAt": 2025-10-01T08:19:07.356Z,
  "walkDuration": 19709
}
```

#### 2. 백그라운드 복원
**테스트 시나리오:**
1. 산책 시작 (타이머: 00:00:30)
2. iPhone 홈 버튼 (백그라운드로 이동)
3. 25초 대기
4. 앱 다시 열기

**결과:** ✅ 타이머가 00:00:55로 복원됨

**동작 원리:**
- `lastUpdatedAt` 저장 (30초 시점)
- 현재 시간과 비교 (55초)
- 차이 계산 (25초)
- UI 자동 업데이트

#### 3. 상태 전환
- IDLE → WALKING ✅
- WALKING → RESTING ✅
- RESTING → WALKING ✅
- WALKING/RESTING → COMPLETED ✅

#### 4. 애니메이션
- **배경 스크롤**: 산책 중 정상 동작
- **배경 정지**: 휴식 중 정상 동작
- **고양이 바운스**: 산책 중 정상
- **캠핑 씬**: 휴식 중 정상 (텐트, 고양이, 불 깜빡임)

#### 5. UI/UX
- **버튼 텍스트**: 정상 표시
- **타이머 표시**: 정상 표시
- **레이아웃**: 버튼 개수와 무관하게 고양이 위치 고정

---

## 🐛 발견된 이슈 및 해결

### Issue #1: 버튼 텍스트가 보이지 않음
**증상:**
- 버튼은 보이지만 내부 텍스트가 표시되지 않음

**원인:**
- `theme.textStyles.body` spread 문제
- `theme.typography.fontWeight.semiBold` 존재하지 않음

**해결:**
```typescript
// 수정 전
text: {
  ...theme.textStyles.body,
  fontWeight: theme.typography.fontWeight.semiBold,
}

// 수정 후
text: {
  fontSize: 16,
  fontWeight: '600',
}
```

**파일:** `Button.tsx`

---

### Issue #2: 타이머가 화면 밖으로 넘어감
**증상:**
- 타이머 폰트 크기가 너무 커서 "휴식 시간"이 화면 오른쪽으로 잘림

**원인:**
- `fontSize: 48` (너무 큼)
- `padding: 16` (너무 큼)

**해결:**
```typescript
// 수정 전
time: {
  fontSize: 48,
  fontWeight: '700',
}

// 수정 후
time: {
  fontSize: 28,
  fontWeight: '700',
}
```

**추가 수정:**
- `container`에 `flex: 1` 추가 (공간 균등 분배)
- `padding: 16` → `padding: 8`
- `label fontSize: 14` → `12`

**파일:** `TimerDisplay.tsx`

---

### Issue #3: 배경 스크롤 좌우 여백
**증상:**
- 배경 나무가 화면 좌우 끝까지 가지 않고 여백이 보임

**원인:**
- `BackgroundScroll`이 `content` 내부에 있어서 `paddingHorizontal`의 영향을 받음

**해결:**
- `BackgroundScroll`을 `content` 밖으로 이동
- `SafeAreaView` 바로 아래 배치
- `content`에 `zIndex: 1` 추가

**파일:** `WalkScreen.tsx`

---

### Issue #4: 나무가 화면 최상단에 붙음
**증상:**
- 배경 나무가 화면 상단에 붙어서 표시됨

**원인:**
- `BackgroundScroll` container의 정렬 설정 없음

**해결:**
```typescript
container: {
  position: 'absolute',
  width: '100%',
  height: '100%',
  flexDirection: 'row',
  justifyContent: 'center',  // ← 추가
  alignItems: 'center',      // ← 추가
  overflow: 'hidden',
}
```

**파일:** `BackgroundScroll.tsx`

---

### Issue #5: 배경 재개 시 속도 느려짐 / 위치 초기화
**증상:**
- 휴식 후 재개하면 배경이 처음 위치로 돌아가거나 속도가 느려짐

**원인:**
- `isScrolling`이 변경될 때마다 새 애니메이션 생성
- `Animated.loop`의 `start()`/`stop()` 반복 호출 문제

**시도한 해결책:**
1. ❌ 애니메이션 재사용 시도 → 동작하지 않음
2. ❌ 속도 변수로 제어 시도 → 복잡함
3. ✅ 원래 방식 유지 (재개 시 초기화됨)

**최종 결정:**
- **Phase F-2 (스프라이트 시트)에서 해결 예정**
- 현재는 이모지 임시 배경이므로 타협
- 이미지 기반 배경으로 교체 시 자연스럽게 해결됨

**관련 파일:** `BackgroundScroll.tsx`

---

### Issue #6: 고양이가 버튼에 따라 수직 이동
**증상:**
- IDLE (버튼 1개) vs WALKING (버튼 2개) 전환 시 고양이 위치가 변함

**원인:**
- `animationArea`가 `flex: 1`로 설정되어 남은 공간을 차지
- 버튼 영역 높이 변화 → animationArea 크기 변화 → 고양이 위치 변화

**해결:**
```typescript
// 수정 전
animationArea: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
}

// 수정 후
animationArea: {
  position: 'absolute',
  top: '35%',
  left: 0,
  right: 0,
  height: 200,
  justifyContent: 'center',
  alignItems: 'center',
}
```

**추가 수정:**
- 타이머와 버튼을 `bottomContainer`로 그룹화
- `position: absolute, bottom: 0`으로 하단 고정
- 헤더도 상단 고정

**파일:** `WalkScreen.tsx`

---

## 📋 현재 알려진 제한사항

### 1. 배경 스크롤 재개 이슈
**상태:** 미해결 (의도적)
- 휴식 후 재개 시 배경이 처음 위치로 리셋됨
- 이모지 기반 임시 배경의 한계
- **해결 예정:** Phase F-2 (스프라이트 시트 이미지)

### 2. theme 시스템 미사용
**상태:** 미해결 (의도적)
- Button, TimerDisplay에서 theme 대신 하드코딩
- `textStyles` spread 문제
- **해결 예정:** Phase H (theme 시스템 재구성)

### 3. SafeAreaView 경고
**로그:**
```
WARN  SafeAreaView has been deprecated and will be removed in a future release.
Please use 'react-native-safe-area-context' instead.
```
- **해결 예정:** Phase H

### 4. 히스토리 화면 없음
**상태:** 미구현
- 세션은 저장되지만 UI 없음
- **해결 예정:** Phase G

---

## 🔧 테스트 중 수정한 파일

### 1. Button.tsx
- textStyles spread 제거 → 하드코딩
- getTextStyle() switch 함수 추가

### 2. TimerDisplay.tsx
- theme 의존성 제거
- 폰트 크기 조정 (48 → 28)
- flex: 1 추가

### 3. BackgroundScroll.tsx
- container에 justifyContent, alignItems 추가
- 애니메이션 로직 여러 번 수정 시도

### 4. WalkScreen.tsx
- BackgroundScroll 위치 변경 (content 밖으로)
- animationArea 절대 위치 (top: 35%)
- bottomContainer 추가 (하단 고정)
- content 제거, 헤더/하단만 유지

### 5. LocalStorage.ts
- getAllKeys() 반환 타입 수정 (readonly string[])

---

## 🎯 MVP 테스트 체크리스트

### 핵심 기능
- [x] 산책 시작
- [x] 타이머 실시간 업데이트
- [x] 일시정지 (휴식)
- [x] 재개
- [x] 산책 완료
- [x] 세션 저장
- [x] 백그라운드 복원

### UI/UX
- [x] 버튼 표시
- [x] 타이머 표시
- [x] 상태별 UI 변경
- [x] 레이아웃 안정성

### 애니메이션
- [x] 배경 스크롤 (산책 중)
- [x] 배경 정지 (휴식 중)
- [x] 고양이 바운스
- [x] 캠핑 씬
- [ ] 배경 재개 연속성 (알려진 제한사항)

### 데이터
- [x] 세션 저장 (AsyncStorage)
- [x] 타이머 상태 저장
- [x] 상태 복원
- [ ] 세션 목록 UI (미구현)

---

## 📊 테스트 통계

**총 테스트 시간:** 약 2시간
**발견된 이슈:** 6개
**해결된 이슈:** 5개
**보류된 이슈:** 1개 (배경 스크롤)
**컴파일 에러:** 0개

---

## 🚀 다음 단계 우선순위

### High Priority
1. **Phase F-2: 스프라이트 시트 애니메이션**
   - 도트 고양이 PNG 생성
   - 도트 배경 이미지
   - 배경 스크롤 이슈 자연스럽게 해결

2. **Phase G: 히스토리 화면**
   - 완료된 세션 목록
   - 날짜별 통계
   - 세션 삭제

### Medium Priority
3. **theme 시스템 재구성**
   - textStyles 문제 해결
   - Button, TimerDisplay에 theme 적용
   - 일관된 디자인 시스템

4. **SafeAreaView 교체**
   - react-native-safe-area-context 설치
   - 모든 SafeAreaView 교체

### Low Priority
5. **애니메이션 polish**
   - 전환 효과 부드럽게
   - 마이크로 인터랙션 추가
   - 햅틱 피드백

6. **에러 핸들링**
   - 타이머 오류 시 사용자 알림
   - 저장 실패 시 재시도
   - 네트워크 에러 처리 (Phase 3)

---

## 💡 개선 아이디어

### UX 개선
- 산책 완료 시 축하 애니메이션
- 마일스톤 달성 알림 (10분, 30분, 1시간 등)
- 오늘의 총 산책 시간 요약

### 기능 추가
- 목표 시간 설정
- 알림 기능
- 위젯 지원

### 성능 최적화
- 메모이제이션 (useMemo, useCallback)
- 불필요한 리렌더링 최소화
- 애니메이션 최적화

---

## 📝 테스터 피드백 (자체)

### 긍정적
- ✅ 타이머 정확도 매우 높음
- ✅ 백그라운드 복원 완벽함
- ✅ 상태 전환 직관적
- ✅ 애니메이션 귀여움

### 개선 필요
- ⚠️ 배경 재개 시 위치 리셋 (알려진 이슈)
- ⚠️ 완료 후 결과 요약 화면 없음
- ⚠️ 히스토리 확인 불가

---

## 🔗 관련 문서

- [00_project_planning.md](./00_project_planning.md) - 전체 프로젝트 기획
- [01_2025-10-01_initial_setup.md](./01_2025-10-01_initial_setup.md) - 초기 세팅
- [02_2025-10-01_mvp_development.md](./02_2025-10-01_mvp_development.md) - MVP 개발 과정
