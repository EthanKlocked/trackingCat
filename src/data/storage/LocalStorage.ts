/**
 * LocalStorage 래퍼
 * AsyncStorage를 감싸서 타입 안전성과 에러 핸들링 제공
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

export class LocalStorage {
  /**
   * 데이터 저장
   */
  static async setItem<T>(key: string, value: T): Promise<void> {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
    } catch (error) {
      console.error(`[LocalStorage] Error saving ${key}:`, error);
      throw error;
    }
  }

  /**
   * 데이터 조회
   */
  static async getItem<T>(key: string): Promise<T | null> {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      if (jsonValue === null) {
        return null;
      }
      return JSON.parse(jsonValue) as T;
    } catch (error) {
      console.error(`[LocalStorage] Error reading ${key}:`, error);
      throw error;
    }
  }

  /**
   * 데이터 삭제
   */
  static async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`[LocalStorage] Error removing ${key}:`, error);
      throw error;
    }
  }

  /**
   * 모든 데이터 삭제 (개발/테스트용)
   */
  static async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('[LocalStorage] Error clearing storage:', error);
      throw error;
    }
  }

  /**
   * 모든 키 조회
   */
  static async getAllKeys(): Promise<readonly string[]> {
    try {
      return await AsyncStorage.getAllKeys();
    } catch (error) {
      console.error('[LocalStorage] Error getting all keys:', error);
      throw error;
    }
  }
}
