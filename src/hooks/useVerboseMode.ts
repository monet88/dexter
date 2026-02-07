import { useState, useCallback } from 'react';

export interface UseVerboseModeResult {
  isVerbose: boolean;
  toggle: () => void;
}

export function useVerboseMode(): UseVerboseModeResult {
  const [isVerbose, setIsVerbose] = useState(false);

  const toggle = useCallback(() => {
    setIsVerbose(prev => !prev);
  }, []);

  return { isVerbose, toggle };
}
