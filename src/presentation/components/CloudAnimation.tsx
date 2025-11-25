/**
 * CloudAnimation
 * 단일 구름 애니메이션 (오른쪽→왼쪽)
 */

import React, { useEffect, useRef } from "react";
import { Animated, Dimensions, StyleSheet } from "react-native";
import LottieView from "lottie-react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface CloudAnimationProps {
  delay: number; // 시작 지연 시간 (ms)
  yPosition: number; // 수직 위치 (0 = 상단)
  duration: number; // 애니메이션 지속 시간 (ms)
  onComplete?: () => void; // 애니메이션 완료 콜백
  size?: number; // 구름 크기 (기본 100)
  speedMultiplier?: number; // 속도 배율 (1.0 = 기본, 0.5 = 절반)
}

export const CloudAnimation: React.FC<CloudAnimationProps> = ({
  delay,
  yPosition,
  duration,
  onComplete,
  size = 100,
  speedMultiplier = 1.0,
}) => {
  const translateX = useRef(new Animated.Value(SCREEN_WIDTH)).current;
  const onCompleteRef = useRef(onComplete);
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);
  const startTimeRef = useRef<number>(0);
  const isAnimatingRef = useRef(false);

  // onComplete를 ref로 관리하여 dependency 변경 방지
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // 초기 애니메이션 시작
  useEffect(() => {
    // 지연 후 이동 시작
    const timeoutId = setTimeout(() => {
      isAnimatingRef.current = true;
      startTimeRef.current = Date.now();

      animationRef.current = Animated.timing(translateX, {
        toValue: -size - 50,
        duration: duration / speedMultiplier,
        useNativeDriver: true,
        isInteraction: false,
      });

      animationRef.current.start(({ finished }) => {
        isAnimatingRef.current = false;
        if (finished && onCompleteRef.current) {
          onCompleteRef.current();
        }
      });
    }, delay);

    return () => {
      clearTimeout(timeoutId);
      if (animationRef.current) {
        animationRef.current.stop();
      }
      isAnimatingRef.current = false;
    };
  }, [delay, duration, translateX, size]);

  // speedMultiplier 변경 시 애니메이션 재시작
  useEffect(() => {
    if (!isAnimatingRef.current) return;

    // 현재 위치 저장
    translateX.stopAnimation((currentValue) => {
      const remainingDistance = Math.abs(currentValue - (-size - 50));
      const totalDistance = SCREEN_WIDTH + size + 50;
      const progress = 1 - remainingDistance / totalDistance;
      const remainingDuration = (duration * (1 - progress)) / speedMultiplier;

      // 새로운 속도로 애니메이션 재시작
      animationRef.current = Animated.timing(translateX, {
        toValue: -size - 50,
        duration: remainingDuration,
        useNativeDriver: true,
        isInteraction: false,
      });

      animationRef.current.start(({ finished }) => {
        isAnimatingRef.current = false;
        if (finished && onCompleteRef.current) {
          onCompleteRef.current();
        }
      });
    });
  }, [speedMultiplier]);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          top: yPosition,
          transform: [{ translateX }],
        },
      ]}
    >
      <LottieView
        source={require("../../../assets/lotties/cloud.json")}
        autoPlay
        loop
        style={[styles.cloud, { width: size, height: size }]}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 0,
  },
  cloud: {
    width: 100,
    height: 100,
  },
});
