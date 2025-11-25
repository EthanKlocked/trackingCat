/**
 * DayCycleBackground
 * 하루 사이클 그라디언트 배경 (아침→낮→저녁→밤→새벽)
 */

import React from "react";
import { StyleSheet, Animated, Dimensions, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import LottieView from "lottie-react-native";
import { BackgroundProps } from "./types";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// Animated LinearGradient 생성
const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

// 하루 사이클 색상 정의 (5개 섹션)
const DAY_CYCLE_COLORS = {
  morning: {
    top: "#FFE5B4", // 연한 복숭아색
    middle: "#FFD89B", // 밝은 주황
    bottom: "#87CEEB", // 하늘색
  },
  day: {
    top: "#87CEEB", // 밝은 하늘색
    middle: "#B0E0E6", // 파우더 블루
    bottom: "#4A90E2", // 파란색
  },
  evening: {
    top: "#FF6B9D", // 핑크
    middle: "#FFA07A", // 연어색
    bottom: "#FF8C42", // 주황
  },
  night: {
    top: "#1a1a2e", // 진한 네이비
    middle: "#16213e", // 어두운 파랑
    bottom: "#0f3460", // 미드나잇 블루
  },
  dawn: {
    top: "#2d3561", // 어두운 보라
    middle: "#5C4D7D", // 보라
    bottom: "#c05c7e", // 장미빛
  },
};

export const DayCycleBackground: React.FC<BackgroundProps> = ({
  scrollX,
  virtualWidth,
}) => {
  // scrollX를 0~1 비율로 변환 (-virtualWidth → 0 = 1 → 0)
  const progress = scrollX.interpolate({
    inputRange: [-virtualWidth, 0],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  // 5개 섹션으로 나눔 (각 0.2)
  // 0.0~0.2: 아침
  // 0.2~0.4: 낮
  // 0.4~0.6: 저녁
  // 0.6~0.8: 밤
  // 0.8~1.0: 새벽

  const topColor = progress.interpolate({
    inputRange: [0, 0.2, 0.4, 0.6, 0.8, 1.0],
    outputRange: [
      DAY_CYCLE_COLORS.morning.top,
      DAY_CYCLE_COLORS.day.top,
      DAY_CYCLE_COLORS.evening.top,
      DAY_CYCLE_COLORS.night.top,
      DAY_CYCLE_COLORS.dawn.top,
      DAY_CYCLE_COLORS.morning.top, // 다시 아침으로 연결
    ],
  });

  const middleColor = progress.interpolate({
    inputRange: [0, 0.2, 0.4, 0.6, 0.8, 1.0],
    outputRange: [
      DAY_CYCLE_COLORS.morning.middle,
      DAY_CYCLE_COLORS.day.middle,
      DAY_CYCLE_COLORS.evening.middle,
      DAY_CYCLE_COLORS.night.middle,
      DAY_CYCLE_COLORS.dawn.middle,
      DAY_CYCLE_COLORS.morning.middle,
    ],
  });

  const bottomColor = progress.interpolate({
    inputRange: [0, 0.2, 0.4, 0.6, 0.8, 1.0],
    outputRange: [
      DAY_CYCLE_COLORS.morning.bottom,
      DAY_CYCLE_COLORS.day.bottom,
      DAY_CYCLE_COLORS.evening.bottom,
      DAY_CYCLE_COLORS.night.bottom,
      DAY_CYCLE_COLORS.dawn.bottom,
      DAY_CYCLE_COLORS.morning.bottom,
    ],
  });

  // 해/달 opacity 계산
  // 해: 아침~저녁 (0.0~0.4)에 보임
  // 달: 밤~새벽 (0.5~1.0)에 보임
  const sunOpacity = progress.interpolate({
    inputRange: [0, 0.05, 0.35, 0.4],
    outputRange: [0, 1, 1, 0],
    extrapolate: "clamp",
  });

  const moonOpacity = progress.interpolate({
    inputRange: [0.5, 0.55, 0.95, 1.0],
    outputRange: [0, 1, 1, 0],
    extrapolate: "clamp",
  });

  // 해/달 위치 (화면을 가로질러 이동)
  // 해: 아침(0.0)에서 저녁(0.4)까지 왼쪽에서 오른쪽으로
  const sunPosition = progress.interpolate({
    inputRange: [0, 0.2, 0.4],
    outputRange: [-50, SCREEN_WIDTH / 2 - 40, SCREEN_WIDTH + 50],
    extrapolate: "clamp",
  });

  // 달: 밤 시작(0.6)에서 새벽 끝(1.0)까지 왼쪽에서 오른쪽으로
  const moonPosition = progress.interpolate({
    inputRange: [0.5, 0.7, 1.0],
    outputRange: [-50, SCREEN_WIDTH / 2 - 40, SCREEN_WIDTH + 50],
    extrapolate: "clamp",
  });

  return (
    <View style={styles.container}>
      <AnimatedLinearGradient
        colors={[topColor, middleColor, bottomColor]}
        style={StyleSheet.absoluteFill}
        locations={[0, 0.5, 1]}
      />

      {/* 해 */}
      <Animated.View
        style={[
          styles.celestialBody,
          {
            opacity: sunOpacity,
            left: sunPosition,
          },
        ]}
      >
        <LottieView
          source={require("../../../assets/lotties/sun.json")}
          autoPlay
          loop
          style={styles.sunMoon}
        />
      </Animated.View>

      {/* 달 */}
      <Animated.View
        style={[
          styles.celestialBody,
          {
            opacity: moonOpacity,
            left: moonPosition,
          },
        ]}
      >
        <LottieView
          source={require("../../../assets/lotties/moon.json")}
          autoPlay
          loop
          style={styles.sunMoon}
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    left: 0,
    top: 0,
  },
  celestialBody: {
    position: "absolute",
    top: 140,
    right: 40,
  },
  sunMoon: {
    width: 80,
    height: 80,
  },
});
