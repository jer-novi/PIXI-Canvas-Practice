import { useState, useCallback } from 'react';

export function useSelection() {
  const [selectedElements, setSelectedElements] = useState(new Set());
  const [selectionMode, setSelectionMode] = useState('single'); // 'single' | 'multiple'

  const selectElement = useCallback((elementId) => {
    setSelectedElements(prev => {
      const newSelection = new Set(prev);
      
      if (selectionMode === 'single') {
        newSelection.clear();
        newSelection.add(elementId);
      } else {
        if (newSelection.has(elementId)) {
          newSelection.delete(elementId);
        } else {
          newSelection.add(elementId);
        }
      }
      
      return newSelection;
    });
  }, [selectionMode]);

  const clearSelection = useCallback(() => {
    setSelectedElements(new Set());
  }, []);

  const isSelected = useCallback((elementId) => {
    return selectedElements.has(elementId);
  }, [selectedElements]);

  return {
    selectedElements: Array.from(selectedElements),
    selectionMode,
    setSelectionMode,
    selectElement,
    clearSelection,
    isSelected,
  };
}
