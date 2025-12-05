'use client';

import { createContext, useContext, type ReactNode } from 'react';
import type { AiProvider } from '@/lib/types';

const ProviderContext = createContext<AiProvider | null>(null);

interface ProviderContextProviderProps {
  provider: AiProvider;
  children: ReactNode;
}

export function ProviderContextProvider({ provider, children }: ProviderContextProviderProps) {
  return (
    <ProviderContext.Provider value={provider}>
      {children}
    </ProviderContext.Provider>
  );
}

export function useProvider(): AiProvider {
  const value = useContext(ProviderContext);
  if (!value) {
    throw new Error('useProvider must be used within a ProviderContextProvider');
  }
  return value;
}
