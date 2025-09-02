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
  
  // Sort selected lines by index to find the anchor (topmost line)
  const sortedSelectedLines = useMemo(() => {
    return Array.from(selectedLines).sort((a, b) => a - b);
  }, [selectedLines]);

  const anchorLineIndex = useMemo(() => {
    return sortedSelectedLines.length > 0 ? sortedSelectedLines[0] : null;
  }, [sortedSelectedLines]);

  // Determine if sliders should be active
  const isActive = useMemo(() => {
    if (moveMode === 'edit') return false;
    if (moveMode === 'poem') return true;
    if (moveMode === 'line') return selectionCount > 0;
    return false;
  }, [moveMode, selectionCount]);

  // Get current position values based on mode and anchor line
  const currentPosition = useMemo(() => {
    if (moveMode === 'poem') {
      return { x: poemOffset.x, y: poemOffset.y };
    }
    if (moveMode === 'line' && anchorLineIndex !== null) {
      const override = lineOverrides[anchorLineIndex];
      return { 
        x: override?.xOffset || 0, 
        y: override?.yOffset || 0 
      };
    }
    return { x: 0, y: 0 };
  }, [moveMode, poemOffset, lineOverrides, anchorLineIndex]);

  // --- REFACTORED: Handle position changes with relative offsets ---

  const handlePositionChange = useCallback((axis, newValue) => {
    if (moveMode === 'poem') {
      setPoemOffset(prev => ({ ...prev, [axis]: newValue }));
      return;
    }

    if (moveMode === 'line' && anchorLineIndex !== null) {
      const currentAnchorPos = lineOverrides[anchorLineIndex]?.[`${axis}Offset`] || 0;
      const delta = newValue - currentAnchorPos;

      setLineOverrides(prev => {
        const newOverrides = { ...prev };
        sortedSelectedLines.forEach(lineIndex => {
          const currentOffset = prev[lineIndex]?.[`${axis}Offset`] || 0;
          newOverrides[lineIndex] = {
            ...newOverrides[lineIndex],
            [`${axis}Offset`]: currentOffset + delta,
          };
        });
        return newOverrides;
      });
    }
  }, [moveMode, anchorLineIndex, lineOverrides, setPoemOffset, setLineOverrides, sortedSelectedLines]);

  const handleXChange = (e) => handlePositionChange('x', parseInt(e.target.value, 10));
  const handleYChange = (e) => handlePositionChange('y', parseInt(e.target.value, 10));

  // --- REFACTORED: Handle resets ---

  const handleReset = useCallback((axis) => {
    if (moveMode === 'poem') {
      if (axis) {
        setPoemOffset(prev => ({ ...prev, [axis]: 0 }));
      } else {
        setPoemOffset({ x: 0, y: 0 });
      }
      return;
    }

    if (moveMode === 'line' && selectionCount > 0) {
      setLineOverrides(prev => {
        const newOverrides = { ...prev };
        sortedSelectedLines.forEach(lineIndex => {
          if (newOverrides[lineIndex]) {
            if (axis) {
              newOverrides[lineIndex][`${axis}Offset`] = 0;
            } else {
              newOverrides[lineIndex].xOffset = 0;
              newOverrides[lineIndex].yOffset = 0;
            }
          } else if (!axis) {
            // Ensure override object exists for reset all
            newOverrides[lineIndex] = { xOffset: 0, yOffset: 0 };
          }
        });
        return newOverrides;
      });
    }
  }, [moveMode, selectionCount, sortedSelectedLines, setPoemOffset, setLineOverrides]);

  const handleResetX = () => handleReset('x');
  const handleResetY = () => handleReset('y');
  const handleResetBoth = () => handleReset(null);

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
      }
      const anchorType = anchorLineIndex === -2 ? 'Title' : anchorLineIndex === -1 ? 'Author' : `Line ${anchorLineIndex + 1}`;
      return `Move ${selectionCount} item(s) (Anchor: ${anchorType}): x: ${currentPosition.x}, y: ${currentPosition.y}`;
    }
    return "";
  }, [moveMode, selectionCount, currentPosition, anchorLineIndex]);

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
