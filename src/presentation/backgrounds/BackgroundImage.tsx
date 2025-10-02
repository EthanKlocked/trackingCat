/**
 * BackgroundImage
 * 스크롤 가능한 배경 이미지
 */

import React, { useEffect, useRef, useImperativeHandle, forwardRef, useCallback } from 'react';
import { Image, StyleSheet, Animated, Dimensions, Easing } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// 이미지 절대 경로로 import
// TODO: 사용 시 이미지 파일을 assets/backgrounds/ 에 추가하고 아래 주석 해제
// const backgroundImage = require('../../../assets/backgrounds/your_image.jpg');

// 이미지 원본 크기 (이미지에 맞게 수정)
const IMAGE_WIDTH = 2752;
const IMAGE_HEIGHT = 1536;
const backgroundImage = null; // 임시: 이미지 없음

// 화면 높이에 맞춘 이미지 너비 계산
const scale = SCREEN_HEIGHT / IMAGE_HEIGHT;
const SCALED_IMAGE_WIDTH = IMAGE_WIDTH * scale;

// 전체 사이클 duration (ms)
const FULL_CYCLE_DURATION = 10000;

interface BackgroundImageProps {
  isScrolling: boolean;
}

export interface BackgroundImageRef {
  reset: () => void;
}

export const BackgroundImage = forwardRef<BackgroundImageRef, BackgroundImageProps>(
  ({ isScrolling }, ref) => {
    const scrollX = useRef(new Animated.Value(0)).current;
    const isAnimatingRef = useRef(false);
    const currentPositionRef = useRef(0);

    // 무한 반복 애니메이션 함수
    const startAnimation = useCallback(() => {
      if (!isAnimatingRef.current) return;

      // 현재 위치에서 남은 거리 계산
      const currentValue = currentPositionRef.current;
      const remainingDistance = Math.abs(-SCALED_IMAGE_WIDTH - currentValue);
      const totalDistance = SCALED_IMAGE_WIDTH;
      const remainingDuration = (remainingDistance / totalDistance) * FULL_CYCLE_DURATION;

      Animated.sequence([
        Animated.timing(scrollX, {
          toValue: -SCALED_IMAGE_WIDTH,
          duration: remainingDuration,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(scrollX, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
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
    }, [scrollX]);

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

    return (
      <>
        {/* 첫 번째 배경 */}
        <Animated.View
          style={[
            styles.imageContainer,
            {
              width: SCALED_IMAGE_WIDTH,
              transform: [{ translateX: scrollX }],
            },
          ]}
        >
          <Image
            source={backgroundImage}
            style={[styles.image, { width: SCALED_IMAGE_WIDTH }]}
            resizeMode="cover"
          />
        </Animated.View>

        {/* 두 번째 배경 (이어붙이기) */}
        <Animated.View
          style={[
            styles.imageContainer,
            {
              width: SCALED_IMAGE_WIDTH,
              transform: [
                {
                  translateX: Animated.add(scrollX, SCALED_IMAGE_WIDTH),
                },
              ],
            },
          ]}
        >
          <Image
            source={backgroundImage}
            style={[styles.image, { width: SCALED_IMAGE_WIDTH }]}
            resizeMode="cover"
          />
        </Animated.View>

        {/* 세 번째 배경 (추가 이어붙이기) */}
        <Animated.View
          style={[
            styles.imageContainer,
            {
              width: SCALED_IMAGE_WIDTH,
              transform: [
                {
                  translateX: Animated.add(scrollX, SCALED_IMAGE_WIDTH * 2),
                },
              ],
            },
          ]}
        >
          <Image
            source={backgroundImage}
            style={[styles.image, { width: SCALED_IMAGE_WIDTH }]}
            resizeMode="cover"
          />
        </Animated.View>
      </>
    );
  }
);

BackgroundImage.displayName = 'BackgroundImage';

const styles = StyleSheet.create({
  imageContainer: {
    position: 'absolute',
    height: SCREEN_HEIGHT,
    left: 0,
    top: 0,
  },
  image: {
    height: '100%',
  },
});
