// contexts/ScrollContext.tsx
import React, { createContext } from 'react';

interface ScrollContextType {
  isScrolling: boolean;
  setIsScrolling: (scrolling: boolean) => void;
}

export const ScrollContext = createContext<ScrollContextType>({
  isScrolling: false,
  setIsScrolling: () => {},
});