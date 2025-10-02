/**
 * 배경 공통 타입 정의
 */

import { Animated } from 'react-native';

export interface BackgroundProps {
  scrollX: Animated.Value;
  virtualWidth: number;
}

export interface BackgroundAnimationRef {
  reset: () => void;
}
