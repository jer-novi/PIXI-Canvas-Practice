// src/pages/CanvasPage/components/XYMoveSliders.jsx
import React, { useCallback, useMemo } from "react";
import styles from "./XYMoveSliders.module.css";

export default function XYMoveSliders({
  moveMode,
  selectedLines,
  poemOffset,
  setPoemOffset,
  lineOverrides,
  setLineOverrides,
}) {
  const selectionCount = selectedLines.size;
  const selectedLineArray = Array.from(selectedLines);

  // Determine if sliders should be active
  const isActive = useMemo(() => {
    if (moveMode === 'edit') return false;
    if (moveMode === 'poem') return true;
    if (moveMode === 'line') return selectionCount > 0;
    return false;
  }, [moveMode, selectionCount]);

  // Get current position values based on mode
  const currentPosition = useMemo(() => {
    if (moveMode === 'poem') {
      return { x: poemOffset.x, y: poemOffset.y };
    }
    if (moveMode === 'line' && selectionCount > 0) {
      // For line mode, show position of first selected line
      const firstLineIndex = selectedLineArray[0];
      const override = lineOverrides[firstLineIndex];
      return { 
        x: override?.xOffset || 0, 
        y: override?.yOffset || 0 
      };
    }
    return { x: 0, y: 0 };
  }, [moveMode, poemOffset, lineOverrides, selectedLineArray, selectionCount]);

  // Handle X position change
  const handleXChange = useCallback((e) => {
    const newX = parseInt(e.target.value, 10);
    
    if (moveMode === 'poem') {
      setPoemOffset(prev => ({ ...prev, x: newX }));
    } else if (moveMode === 'line' && selectionCount > 0) {
      // Apply X offset to all selected lines
      setLineOverrides(prev => {
        const newOverrides = { ...prev };
        selectedLineArray.forEach(lineIndex => {
          newOverrides[lineIndex] = {
            ...newOverrides[lineIndex],
            xOffset: newX
          };
        });
        return newOverrides;
      });
    }
  }, [moveMode, selectionCount, selectedLineArray, setPoemOffset, setLineOverrides]);

  // Handle Y position change
  const handleYChange = useCallback((e) => {
    const newY = parseInt(e.target.value, 10);
    
    if (moveMode === 'poem') {
      setPoemOffset(prev => ({ ...prev, y: newY }));
    } else if (moveMode === 'line' && selectionCount > 0) {
      // Apply Y offset to all selected lines
      setLineOverrides(prev => {
        const newOverrides = { ...prev };
        selectedLineArray.forEach(lineIndex => {
          newOverrides[lineIndex] = {
            ...newOverrides[lineIndex],
            yOffset: newY
          };
        });
        return newOverrides;
      });
    }
  }, [moveMode, selectionCount, selectedLineArray, setPoemOffset, setLineOverrides]);

  // Reset to center
  const handleResetX = useCallback(() => {
    if (moveMode === 'poem') {
      setPoemOffset(prev => ({ ...prev, x: 0 }));
    } else if (moveMode === 'line' && selectionCount > 0) {
      setLineOverrides(prev => {
        const newOverrides = { ...prev };
        selectedLineArray.forEach(lineIndex => {
          if (newOverrides[lineIndex]) {
            newOverrides[lineIndex] = {
              ...newOverrides[lineIndex],
              xOffset: 0
            };
          }
        });
        return newOverrides;
      });
    }
  }, [moveMode, selectionCount, selectedLineArray, setPoemOffset, setLineOverrides]);

  const handleResetY = useCallback(() => {
    if (moveMode === 'poem') {
      setPoemOffset(prev => ({ ...prev, y: 0 }));
    } else if (moveMode === 'line' && selectionCount > 0) {
      setLineOverrides(prev => {
        const newOverrides = { ...prev };
        selectedLineArray.forEach(lineIndex => {
          if (newOverrides[lineIndex]) {
            newOverrides[lineIndex] = {
              ...newOverrides[lineIndex],
              yOffset: 0
            };
          }
        });
        return newOverrides;
      });
    }
  }, [moveMode, selectionCount, selectedLineArray, setPoemOffset, setLineOverrides]);

  // Reset both X and Y to center
  const handleResetBoth = useCallback(() => {
    if (moveMode === 'poem') {
      setPoemOffset({ x: 0, y: 0 });
    } else if (moveMode === 'line' && selectionCount > 0) {
      setLineOverrides(prev => {
        const newOverrides = { ...prev };
        selectedLineArray.forEach(lineIndex => {
          if (newOverrides[lineIndex]) {
            newOverrides[lineIndex] = {
              ...newOverrides[lineIndex],
              xOffset: 0,
              yOffset: 0
            };
          }
        });
        return newOverrides;
      });
    }
  }, [moveMode, selectionCount, selectedLineArray, setPoemOffset, setLineOverrides]);

  // Status text
  const statusText = useMemo(() => {
    if (moveMode === 'edit') {
      return "Position controls disabled in Edit mode";
    }
    if (moveMode === 'poem') {
      return `Move entire poem: x: ${currentPosition.x}, y: ${currentPosition.y}`;
    }
    if (moveMode === 'line') {
      if (selectionCount === 0) {
        return "⚠️ Select lines first to enable movement";
      } else {
        return `Move ${selectionCount} line${selectionCount > 1 ? 's' : ''}: x: ${currentPosition.x}, y: ${currentPosition.y}`;
      }
    }
    return "";
  }, [moveMode, selectionCount, currentPosition]);

  return (
    <div className={styles.xyMoveContainer}>
      <div className={styles.moveLabel}>Position</div>
      
      {/* Status text */}
      <div className={styles.status}>{statusText}</div>

      {/* X Position Control */}
      <div className={styles.sliderGroup}>
        <label className={styles.sliderLabel}>
          X: <span className={styles.value}>{currentPosition.x}px</span>
        </label>
        <div className={styles.sliderContainer}>
          <input
            type="range"
            min="-500"
            max="500"
            step="1"
            value={currentPosition.x}
            onChange={handleXChange}
            disabled={!isActive}
            className={styles.slider}
          />
          <button
            type="button"
            onClick={handleResetX}
            disabled={!isActive}
            className={styles.resetButton}
            title="Reset X to center"
          >
            0
          </button>
        </div>
      </div>

      {/* Y Position Control */}
      <div className={styles.sliderGroup}>
        <label className={styles.sliderLabel}>
          Y: <span className={styles.value}>{currentPosition.y}px</span>
        </label>
        <div className={styles.sliderContainer}>
          <input
            type="range"
            min="-500"
            max="500"
            step="1"
            value={currentPosition.y}
            onChange={handleYChange}
            disabled={!isActive}
            className={styles.slider}
          />
          <button
            type="button"
            onClick={handleResetY}
            disabled={!isActive}
            className={styles.resetButton}
            title="Reset Y to center"
          >
            0
          </button>
        </div>
      </div>

      {/* Reset Both Button */}
      <button
        type="button"
        onClick={handleResetBoth}
        disabled={!isActive}
        className={styles.resetBothButton}
        title="Reset both X and Y to center"
      >
        Reset to Center
      </button>
    </div>
  );
}