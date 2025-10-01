/**
 * AppProvider
 * 모든 Context Provider 통합
 */

import React from 'react';
import { TimerProvider } from './TimerContext';
import { SessionProvider } from './SessionContext';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <SessionProvider>
      <TimerProvider>{children}</TimerProvider>
    </SessionProvider>
  );
};
