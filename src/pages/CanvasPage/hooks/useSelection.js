// src/pages/CanvasPage/hooks/useSelection.js

import { useState, useCallback } from "react";

/**
 * Custom hook for managing multi-selection state for poem lines.
 * Handles single click, Ctrl/Cmd-click for toggling, and Shift-click for range selection.
 */
export function useSelection() {
  const [selectedLines, setSelectedLines] = useState(new Set());
  const [lastSelectedLine, setLastSelectedLine] = useState(null);

  const handleSelect = useCallback(
    (index, event) => {
      const newSelection = new Set(selectedLines);

      if (event?.shiftKey && lastSelectedLine !== null) {
        // Range selection
        const start = Math.min(lastSelectedLine, index);
        const end = Math.max(lastSelectedLine, index);
        newSelection.clear(); // Start with a clean slate for the new range
        for (let i = start; i <= end; i++) {
          newSelection.add(i);
        }
      } else if (event?.ctrlKey || event?.metaKey) {
        // Toggle selection (add or remove)
        if (newSelection.has(index)) {
          newSelection.delete(index);
        } else {
          newSelection.add(index);
        }
        setLastSelectedLine(index);
      } else {
        // Single selection
        if (newSelection.has(index) && newSelection.size === 1) {
          newSelection.clear();
          setLastSelectedLine(null);
        } else {
          newSelection.clear();
          newSelection.add(index);
          setLastSelectedLine(index);
        }
      }

      setSelectedLines(newSelection);
    },
    [selectedLines, lastSelectedLine]
  );

  const clearSelection = useCallback(() => {
    setSelectedLines(new Set());
    setLastSelectedLine(null);
  }, []);

  const isSelected = useCallback(
    (index) => {
      return selectedLines.has(index);
    },
    [selectedLines]
  );

  return {
    selectedLines,
    handleSelect,
    clearSelection,
    isSelected,
  };
}
