/**
 * BackgroundScroll
 * 배경 스크롤 애니메이션
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { theme } from '../theme';

interface BackgroundScrollProps {
  isScrolling: boolean; // 스크롤 여부 (산책 중일 때만 true)
}

export const BackgroundScroll: React.FC<BackgroundScrollProps> = ({ isScrolling }) => {
  const scrollX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let animation: Animated.CompositeAnimation;

    if (isScrolling) {
      // 무한 스크롤 애니메이션
      animation = Animated.loop(
        Animated.sequence([
          Animated.timing(scrollX, {
            toValue: -300,
            duration: 6000,
            useNativeDriver: true,
          }),
          Animated.timing(scrollX, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      );
      animation.start();
    }

    return () => {
      if (animation) {
        animation.stop();
      }
    };
  }, [isScrolling]);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.background,
          {
            transform: [{ translateX: scrollX }],
          },
        ]}
      >
        <Text style={styles.tree}>🌳🌳🌳🌳🌳🌳🌳🌳</Text>
      </Animated.View>
      {/* 이어지는 배경 (무한 스크롤용) */}
      <Animated.View
        style={[
          styles.background,
          {
            transform: [
              {
                translateX: Animated.add(scrollX, 300), // 첫 번째 배경 뒤에 붙음
              },
            ],
          },
        ]}
      >
        <Text style={styles.tree}>🌳🌳🌳🌳🌳🌳🌳🌳</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  background: {
    position: 'absolute',
    width: 300,
  },
  tree: {
    fontSize: 40,
    lineHeight: 50,
  },
});
