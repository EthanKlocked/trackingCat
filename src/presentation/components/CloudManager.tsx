/**
 * CloudManager
 * 여러 구름을 랜덤하게 생성/관리
 */

import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, Dimensions, Animated } from 'react-native';
import { CloudAnimation } from './CloudAnimation';
import { TimerStatus } from '../../constants';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// 고양이 위치 (화면 약 45% 지점)
const CAT_POSITION = SCREEN_HEIGHT * 0.45;
// 구름 등장 가능 범위: 상단 ~ 고양이 위
const CLOUD_MIN_Y = 100;
const CLOUD_MAX_Y = CAT_POSITION - 100;

interface Cloud {
  id: string;
  delay: number;
  yPosition: number;
  duration: number;
  size: number;
}

interface CloudManagerProps {
  status: TimerStatus;
  scrollX: Animated.Value;
  virtualWidth: number;
}

export const CloudManager: React.FC<CloudManagerProps> = ({ status, scrollX, virtualWidth }) => {
  const [clouds, setClouds] = useState<Cloud[]>([]);
  const [isActive, setIsActive] = useState(false);

  // scrollX를 progress(0~1)로 변환
  const progress = scrollX.interpolate({
    inputRange: [-virtualWidth, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  // 시간대별 구름 투명도
  // 0.0~0.5 (아침~저녁): opacity 1.0 (완전 불투명)
  // 0.5~0.6 (저녁→밤): 1.0 → 0.4로 점진적 감소
  // 0.6~0.9 (밤): opacity 0.4 유지 (반투명)
  // 0.9~1.0 (새벽→아침): 0.4 → 1.0로 점진적 복구
  const cloudOpacity = progress.interpolate({
    inputRange: [0, 0.5, 0.6, 0.9, 1.0],
    outputRange: [1.0, 1.0, 0.4, 0.4, 1.0],
    extrapolate: 'clamp',
  });

  // 랜덤 구름 생성 (dependency 없음)
  const createCloud = (): Cloud => {
    return {
      id: `cloud-${Date.now()}-${Math.random()}`,
      delay: Math.random() * 500, // 0~0.5초 랜덤 지연
      yPosition: CLOUD_MIN_Y + Math.random() * (CLOUD_MAX_Y - CLOUD_MIN_Y),
      duration: 18000 + Math.random() * 10000, // 18~28초 (훨씬 느리게)
      size: 80 + Math.random() * 40, // 80~120px
    };
  };

  // 구름 제거
  const removeCloud = useCallback((id: string) => {
    setClouds((prev) => prev.filter((cloud) => cloud.id !== id));
  }, []);

  // status 변경 감지
  useEffect(() => {
    if (status === TimerStatus.IDLE) {
      setIsActive(false);
      setClouds([]);
    } else if (status === TimerStatus.WALKING || status === TimerStatus.RESTING) {
      setIsActive(true);
    }
  }, [status]);

  // 구름 생성 로직 (isActive 상태로만 제어)
  useEffect(() => {
    if (!isActive) return;

    // 초기 구름 1개 생성
    setClouds([createCloud()]);

    // 주기적으로 새 구름 생성
    const intervalId = setInterval(() => {
      setClouds((prev) => {
        // 최대 4개까지 유지 (빈도 더 증가)
        if (prev.length >= 4) {
          return prev;
        }
        // 95% 확률로 새 구름 생성 (더욱 자주)
        if (Math.random() > 0.05) {
          return [...prev, createCloud()];
        }
        return prev;
      });
    }, 2000); // 2초마다 체크 (더욱 자주)

    return () => {
      clearInterval(intervalId);
    };
  }, [isActive]);

  return (
    <Animated.View style={[styles.container, { opacity: cloudOpacity }]} pointerEvents="none">
      {clouds.map((cloud) => (
        <CloudAnimation
          key={cloud.id}
          delay={cloud.delay}
          yPosition={cloud.yPosition}
          duration={cloud.duration}
          size={cloud.size}
          onComplete={() => removeCloud(cloud.id)}
        />
      ))}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
  },
});
