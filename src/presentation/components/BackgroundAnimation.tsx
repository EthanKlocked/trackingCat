/**
 * BackgroundAnimation
 * 배경 스크롤 애니메이션 래퍼 (배경 컴포넌트를 받아서 애니메이션 적용)
 */

import React, { useEffect, useRef, useImperativeHandle, forwardRef, useCallback, ReactNode } from 'react';
import { Animated, Easing } from 'react-native';
import { BackgroundAnimationRef } from '../backgrounds/types';

export type { BackgroundAnimationRef };

// 가상 배경 너비 (화면 너비 기준 배수)
const VIRTUAL_WIDTH_MULTIPLIER = 15; // 화면 너비의 15배 (긴 배경 효과)

// 전체 사이클 duration (ms)
const FULL_CYCLE_DURATION = 60000; // 60초 (1분에 한 사이클)

interface BackgroundAnimationProps {
  isScrolling: boolean;
  children: (scrollX: Animated.Value, virtualWidth: number) => ReactNode;
  screenWidth: number;
}

export const BackgroundAnimation = forwardRef<BackgroundAnimationRef, BackgroundAnimationProps>(
  ({ isScrolling, children, screenWidth }, ref) => {
    const VIRTUAL_WIDTH = screenWidth * VIRTUAL_WIDTH_MULTIPLIER;

    const scrollX = useRef(new Animated.Value(0)).current;
    const isAnimatingRef = useRef(false);
    const currentPositionRef = useRef(0);

    // 무한 반복 애니메이션 함수
    const startAnimation = useCallback(() => {
      if (!isAnimatingRef.current) return;

      // 현재 위치에서 남은 거리 계산
      const currentValue = currentPositionRef.current;
      const remainingDistance = Math.abs(-VIRTUAL_WIDTH - currentValue);
      const totalDistance = VIRTUAL_WIDTH;
      const remainingDuration = (remainingDistance / totalDistance) * FULL_CYCLE_DURATION;

      Animated.sequence([
        Animated.timing(scrollX, {
          toValue: -VIRTUAL_WIDTH,
          duration: remainingDuration,
          easing: Easing.linear,
          useNativeDriver: false, // 그라디언트 색상 보간을 위해 false
        }),
        Animated.timing(scrollX, {
          toValue: 0,
          duration: 0,
          useNativeDriver: false,
        }),
      ]).start(({ finished }) => {
        if (finished) {
          currentPositionRef.current = 0;
        }
        // 애니메이션 완료 후 재귀 호출로 무한 반복
        if (isAnimatingRef.current) {
          startAnimation();
        }
      });
    }, [scrollX, VIRTUAL_WIDTH]);

    // 외부에서 호출 가능한 reset 메서드
    useImperativeHandle(ref, () => ({
      reset: () => {
        isAnimatingRef.current = false;
        scrollX.stopAnimation();
        scrollX.setValue(0);
        currentPositionRef.current = 0;
      },
    }));

    useEffect(() => {
      if (isScrolling) {
        isAnimatingRef.current = true;
        startAnimation();
      } else {
        isAnimatingRef.current = false;
        // stopAnimation 콜백으로 멈춘 위치 저장
        scrollX.stopAnimation((value) => {
          currentPositionRef.current = value;
        });
      }

      return () => {
        isAnimatingRef.current = false;
        scrollX.stopAnimation((value) => {
          currentPositionRef.current = value;
        });
      };
    }, [isScrolling, startAnimation, scrollX]);

    return <>{children(scrollX, VIRTUAL_WIDTH)}</>;
  }
);

BackgroundAnimation.displayName = 'BackgroundAnimation';
