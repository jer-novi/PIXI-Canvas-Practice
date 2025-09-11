// src/pages/CanvasPage/hooks/useKeyboardShortcuts.js

import { useEffect, useRef, useCallback } from "react";

/**
 * Hook for managing keyboard shortcuts including mode cycling with SPACEBAR
 * and selection management with ESCAPE.
 * 
 * @param {Object} options - Configuration object
 * @param {string} options.moveMode - Current move mode ('edit', 'line', 'poem')
 * @param {Function} options.setMoveMode - Function to set the move mode
 * @param {Set} options.selectedLines - Set of currently selected line indices
 * @param {Function} options.clearSelection - Function to clear all selections
 * @param {Function} options.selectAll - Function to select all lines
 * @param {Object} options.currentPoem - Current poem data with lines array
 */
export function useKeyboardShortcuts({
  moveMode,
  setMoveMode,
  selectedLines,
  clearSelection,
  selectAll,
  currentPoem,
  xySlidersVisible,
  setXySlidersVisible
}) {
  // Keep track of previous selection to restore when returning to edit/line mode
  const previousSelectionRef = useRef(new Set());
  
  // Store previous selection when switching to poem mode
  useEffect(() => {
    if (moveMode !== 'poem' && selectedLines.size > 0) {
      previousSelectionRef.current = new Set(selectedLines);
    }
  }, [moveMode, selectedLines]);

  // Cycle through modes: edit -> line (if selection exists) -> poem -> edit
  const cycleModes = useCallback(() => {
    const hasSelection = selectedLines.size > 0;
    const hasPreviousSelection = previousSelectionRef.current.size > 0;
    
    switch (moveMode) {
      case 'edit':
        if (hasSelection) {
          // Go to line mode if there's a current selection
          setMoveMode('line');
        } else if (hasPreviousSelection) {
          // Restore previous selection and go to line mode
          setMoveMode('line');
          // Note: Selection restoration will be handled by the parent component
        } else {
          // Skip line mode if no selection exists, go directly to poem
          setMoveMode('poem');
        }
        break;
        
      case 'line':
        // Always go to poem mode from line mode
        setMoveMode('poem');
        break;
        
      case 'poem':
        // Return to edit mode and potentially restore selection
        setMoveMode('edit');
        break;
        
      default:
        // Fallback to edit mode
        setMoveMode('edit');
        break;
    }
  }, [moveMode, selectedLines, setMoveMode]);

  // Reset to edit mode and clear selection
  const resetToEditMode = useCallback(() => {
    clearSelection();
    previousSelectionRef.current = new Set();
    setMoveMode('edit');
  }, [clearSelection, setMoveMode]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      // Prevent shortcuts when user is typing in input fields
      if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
        return;
      }

      switch (event.key) {
        case ' ': // SPACEBAR
          event.preventDefault();
          cycleModes();
          break;
          
        case 'Escape':
          event.preventDefault();
          resetToEditMode();
          break;
          
        case 'a':
        case 'A':
          if (event.altKey) {
            event.preventDefault();
            if (currentPoem?.lines) {
              selectAll(currentPoem.lines.length);
            }
          }
          break;

        case 'h':
        case 'H':
          if (event.altKey) {
            event.preventDefault();
            setXySlidersVisible(prev => !prev);
          }
          break;
      }
    };

    // Add event listener
    document.addEventListener('keydown', handleKeyDown);
    
    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [moveMode, selectedLines, currentPoem, setMoveMode, clearSelection, selectAll, cycleModes, resetToEditMode, setXySlidersVisible]);

  // Return function to restore previous selection (to be used by parent component)
  const restorePreviousSelection = () => {
    if (previousSelectionRef.current.size > 0) {
      // The parent component should handle the actual selection restoration
      return previousSelectionRef.current;
    }
    return new Set();
  };

  return {
    restorePreviousSelection,
    cycleModes,
    resetToEditMode
  };
}