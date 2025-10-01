/**
 * CatAnimation
 * 고양이 애니메이션 (이모지 기반)
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { TimerStatus } from '../../constants';

interface CatAnimationProps {
  status: TimerStatus;
}

export const CatAnimation: React.FC<CatAnimationProps> = ({ status }) => {
  const walkBounce = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (status === TimerStatus.WALKING) {
      // 걷기 애니메이션 (상하 바운스)
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(walkBounce, {
            toValue: -10,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(walkBounce, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ])
      );
      animation.start();

      return () => {
        animation.stop();
      };
    } else {
      walkBounce.setValue(0);
    }
  }, [status]);

  const renderCat = () => {
    if (status === TimerStatus.WALKING) {
      return (
        <Animated.View
          style={[
            styles.catContainer,
            {
              transform: [{ translateY: walkBounce }],
            },
          ]}
        >
          <Text style={styles.catEmoji}>🐱</Text>
        </Animated.View>
      );
    }

    if (status === TimerStatus.RESTING) {
      return (
        <View style={styles.campingContainer}>
          <Text style={styles.tent}>⛺</Text>
          <Text style={styles.catEmoji}>🐱</Text>
          <Campfire />
        </View>
      );
    }

    // IDLE
    return (
      <View style={styles.catContainer}>
        <Text style={styles.catEmoji}>🐱</Text>
      </View>
    );
  };

  return <View style={styles.container}>{renderCat()}</View>;
};

/**
 * 모닥불 깜빡임 애니메이션
 */
const Campfire: React.FC = () => {
  const fireOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(fireOpacity, {
          toValue: 0.3,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(fireOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();

    return () => {
      animation.stop();
    };
  }, []);

  return (
    <Animated.View style={{ opacity: fireOpacity }}>
      <Text style={styles.fire}>🔥</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  catContainer: {
    alignItems: 'center',
  },
  catEmoji: {
    fontSize: 80,
  },
  campingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tent: {
    fontSize: 60,
  },
  fire: {
    fontSize: 40,
  },
});
