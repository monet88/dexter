import { useState, useMemo, useCallback, useEffect } from 'react';
import { filterCommands, type Command } from '../commands/registry.js';

export interface UseCommandSuggestionsResult {
  suggestions: Command[];
  selectedIndex: number;
  isOpen: boolean;
  moveUp: () => void;
  moveDown: () => void;
  selectCurrent: () => string | null;
  resetSelection: () => void;
}

export function useCommandSuggestions(input: string): UseCommandSuggestionsResult {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const suggestions = useMemo(() => filterCommands(input), [input]);
  const isOpen = useMemo(
    () => input.startsWith('/') && suggestions.length > 0,
    [input, suggestions.length],
  );

  // Reset selection when input changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [input]);

  const moveUp = useCallback(() => {
    setSelectedIndex(prev => Math.max(0, prev - 1));
  }, []);

  const moveDown = useCallback(() => {
    setSelectedIndex(prev => Math.min(suggestions.length - 1, prev + 1));
  }, [suggestions.length]);

  const selectCurrent = useCallback((): string | null => {
    if (!isOpen || suggestions.length === 0) return null;
    const cmd = suggestions[selectedIndex];
    return cmd.args ? `${cmd.name} ` : cmd.name;
  }, [isOpen, suggestions, selectedIndex]);

  const resetSelection = useCallback(() => {
    setSelectedIndex(0);
  }, []);

  return {
    suggestions,
    selectedIndex,
    isOpen,
    moveUp,
    moveDown,
    selectCurrent,
    resetSelection,
  };
}
