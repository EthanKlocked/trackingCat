/**
 * WalkScreen
 * 메인 산책 화면
 */

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Dimensions,
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTimer } from "../contexts";
import {
  Button,
  TimerDisplay,
  CatAnimation,
  TimeAnimation,
  CloudManager,
} from "../components";
import { DayCycleBackground } from "../backgrounds";
import { theme } from "../theme";
import { TimerStatus } from "../../constants";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// Animated LinearGradient
const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

// 시간대별 풀밭 색상 (초록 베이스 유지, 명암만 조절)
const GROUND_COLORS = {
  morning: ["rgba(168, 213, 186, 0)", "#A8D5BA", "#7CB342", "#558B2F"], // 기본 초록
  day: ["rgba(180, 230, 200, 0)", "#B4E6C8", "#8BC34A", "#689F38"], // 밝은 초록
  evening: ["rgba(150, 180, 150, 0)", "#96B496", "#6B9B6B", "#4A7C4A"], // 어두운 초록
  night: ["rgba(60, 80, 60, 0)", "#3C503C", "#2D4A2D", "#1E3A1E"], // 매우 어두운 초록
  dawn: ["rgba(120, 150, 130, 0)", "#789682", "#5A7A5A", "#3F5A3F"], // 중간 어두운 초록
};

interface DynamicGroundProps {
  scrollX: Animated.Value;
  virtualWidth: number;
}

const DynamicGround: React.FC<DynamicGroundProps> = ({
  scrollX,
  virtualWidth,
}) => {
  const progress = scrollX.interpolate({
    inputRange: [-virtualWidth, 0],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  const topColor = progress.interpolate({
    inputRange: [0, 0.2, 0.4, 0.6, 0.8, 1.0],
    outputRange: [
      GROUND_COLORS.morning[0],
      GROUND_COLORS.day[0],
      GROUND_COLORS.evening[0],
      GROUND_COLORS.night[0],
      GROUND_COLORS.dawn[0],
      GROUND_COLORS.morning[0],
    ],
  });

  const color1 = progress.interpolate({
    inputRange: [0, 0.2, 0.4, 0.6, 0.8, 1.0],
    outputRange: [
      GROUND_COLORS.morning[1],
      GROUND_COLORS.day[1],
      GROUND_COLORS.evening[1],
      GROUND_COLORS.night[1],
      GROUND_COLORS.dawn[1],
      GROUND_COLORS.morning[1],
    ],
  });

  const color2 = progress.interpolate({
    inputRange: [0, 0.2, 0.4, 0.6, 0.8, 1.0],
    outputRange: [
      GROUND_COLORS.morning[2],
      GROUND_COLORS.day[2],
      GROUND_COLORS.evening[2],
      GROUND_COLORS.night[2],
      GROUND_COLORS.dawn[2],
      GROUND_COLORS.morning[2],
    ],
  });

  const bottomColor = progress.interpolate({
    inputRange: [0, 0.2, 0.4, 0.6, 0.8, 1.0],
    outputRange: [
      GROUND_COLORS.morning[3],
      GROUND_COLORS.day[3],
      GROUND_COLORS.evening[3],
      GROUND_COLORS.night[3],
      GROUND_COLORS.dawn[3],
      GROUND_COLORS.morning[3],
    ],
  });

  return (
    <AnimatedLinearGradient
      colors={[topColor, color1, color2, bottomColor]}
      style={styles.ground}
      locations={[0, 0.05, 0.3, 1]}
    />
  );
};

export const WalkScreen: React.FC = () => {
  const {
    timerState,
    currentWalkDuration,
    currentRestDuration,
    isLoading,
    startWalk,
    pauseWalk,
    resumeWalk,
    completeWalk,
  } = useTimer();

  const handleStart = async () => {
    try {
      await startWalk();
    } catch (error) {
      console.error("Failed to start walk:", error);
    }
  };

  const handlePause = async () => {
    try {
      await pauseWalk();
    } catch (error) {
      console.error("Failed to pause walk:", error);
    }
  };

  const handleResume = async () => {
    try {
      await resumeWalk();
    } catch (error) {
      console.error("Failed to resume walk:", error);
    }
  };

  const handleComplete = async () => {
    try {
      await completeWalk();
      // TODO: 완료 애니메이션/이벤트 추가 가능
      // - 축하 메시지 표시
      // - 완료 사운드 재생
      // - 결과 화면으로 이동 등
    } catch (error) {
      console.error("Failed to complete walk:", error);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* 배경 (전체 화면) - 시간의 흐름 (IDLE이 아닐 때만 동작) */}
      <TimeAnimation
        isRunning={timerState.status !== TimerStatus.IDLE}
        shouldReset={timerState.status === TimerStatus.IDLE}
        screenWidth={SCREEN_WIDTH}
      >
        {(scrollX, virtualWidth) => (
          <>
            <DayCycleBackground scrollX={scrollX} virtualWidth={virtualWidth} />
            {/* 구름 애니메이션 (시간대별 투명도 적용) */}
            {timerState.status !== TimerStatus.IDLE && (
              <CloudManager
                status={timerState.status}
                scrollX={scrollX}
                virtualWidth={virtualWidth}
              />
            )}
            {/* 풀밭 바닥 - 시간대별 색상 변경 */}
            <DynamicGround scrollX={scrollX} virtualWidth={virtualWidth} />
          </>
        )}
      </TimeAnimation>

      {/* 헤더 (상단 고정) - IDLE 상태에서만 표시 */}
      {timerState.status === TimerStatus.IDLE && (
        <View style={styles.header}>
          <Text style={styles.title}>Tracking Cat</Text>
        </View>
      )}

      {/* 타이머 표시 - 상단 좌우 배치 */}
      {timerState.status !== TimerStatus.IDLE && (
        <View style={styles.topTimerContainer}>
          <TimerDisplay
            duration={currentWalkDuration}
            label="Working"
            color={theme.colors.walking}
          />
          <TimerDisplay
            duration={currentRestDuration}
            label="Relaxing"
            color={theme.colors.resting}
          />
        </View>
      )}

      {/* 풀밭 바닥 - TimeAnimation 내부로 이동하여 scrollX 전달 */}

      {/* 애니메이션 영역 (중앙 고정) */}
      <View style={styles.animationArea}>
        <CatAnimation status={timerState.status} />
        {timerState.status === TimerStatus.IDLE && (
          <Text style={styles.statusText}>산책을 시작해보세요!</Text>
        )}
      </View>

      {/* 하단 고정 영역 */}
      <View style={styles.bottomContainer}>
        {/* 컨트롤 버튼 */}
        <View style={styles.controls}>
          {timerState.status === TimerStatus.IDLE && (
            <Button title="산책 시작" onPress={handleStart} variant="primary" />
          )}

          {timerState.status === TimerStatus.WALKING && (
            <>
              <Button
                title="잠깐 쉼"
                onPress={handlePause}
                variant="secondary"
              />
              <Button
                title="산책 완료"
                onPress={handleComplete}
                variant="outline"
                style={styles.buttonSpacing}
              />
            </>
          )}

          {timerState.status === TimerStatus.RESTING && (
            <>
              <Button
                title="산책 재개"
                onPress={handleResume}
                variant="primary"
              />
              <Button
                title="산책 완료"
                onPress={handleComplete}
                variant="outline"
                style={styles.buttonSpacing}
              />
            </>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingTop: 32,
    paddingHorizontal: 24,
    alignItems: "center",
    zIndex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#2C3E50",
  },
  topTimerContainer: {
    position: "absolute",
    top: 60,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    zIndex: 1,
  },
  animationArea: {
    position: "absolute",
    top: "55%",
    left: 0,
    right: 0,
    height: 200,
    justifyContent: "center",
    alignItems: "center",
  },
  statusText: {
    fontSize: 18,
    color: "#7F8C8D",
  },
  ground: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 330,
  },
  bottomContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingBottom: 32,
    zIndex: 1,
  },
  timerContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 24,
  },
  controls: {
    gap: 16,
  },
  buttonSpacing: {
    marginTop: 8,
  },
});
