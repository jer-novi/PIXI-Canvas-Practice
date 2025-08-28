import { useCallback, useEffect } from "react";
import {
  handleFontSizeChangeUtil,
  handleLineHeightChangeUtil,
  resetLineHeightUtil,
} from "../utils/lineHeightUtils";

export function useCanvasHandlers(canvasState) {
  const {
    selectedLine,
    setSelectedLine,
    lineOverrides,
    setLineOverrides,
    viewportDragEnabled,
    setViewportDragEnabled,
    fontSize,
    setFontSize,
    lineHeight,
    setLineHeight,
    lineHeightMultiplier,
    setLineHeightMultiplier,
    userHasAdjusted,
    setUserHasAdjusted,
  } = canvasState;

  // Line selection handler
  const handleLineSelect = useCallback((index) => {
    console.log(`Line ${index} selected`);
    setSelectedLine((prev) => (prev === index ? null : index));
  }, [setSelectedLine]);

  // Line color change for selected line
  const handleLineColorChange = useCallback((color) => {
    if (selectedLine !== null) {
      setLineOverrides(prev => ({
        ...prev,
        [selectedLine]: {
          ...prev[selectedLine],
          fillColor: color
        }
      }));
    }
  }, [selectedLine, setLineOverrides]);

  // Reset individual line style
  const handleResetSelectedLine = useCallback(() => {
    if (selectedLine !== null) {
      setLineOverrides(prev => {
        const next = { ...prev };
        delete next[selectedLine];
        return next;
      });
    }
  }, [selectedLine, setLineOverrides]);

  // Viewport control
  const handleViewportToggle = useCallback((enabled) => {
    setViewportDragEnabled(enabled);
    console.log(`Viewport dragging: ${enabled ? 'enabled' : 'disabled'}`);
  }, [setViewportDragEnabled]);

  // Color picker active state
  const handleColorPickerActiveChange = useCallback((isActive) => {
    canvasState.setIsColorPickerActive(isActive);
  }, [canvasState]);

  // Font size change with utility
  const handleFontSizeChange = useCallback((newSize) =>
    handleFontSizeChangeUtil(newSize, {
      userHasAdjusted,
      lineHeightMultiplier,
      setFontSize,
      setLineHeight,
    }), [userHasAdjusted, lineHeightMultiplier, setFontSize, setLineHeight]);

  // Line height change with utility
  const handleLineHeightChange = useCallback((newHeight) =>
    handleLineHeightChangeUtil(newHeight, {
      userHasAdjusted,
      setUserHasAdjusted,
      setLineHeight,
      fontSize,
      setLineHeightMultiplier,
    }), [userHasAdjusted, setUserHasAdjusted, setLineHeight, fontSize, setLineHeightMultiplier]);

  // Reset line height
  const handleResetLineHeight = useCallback(() =>
    resetLineHeightUtil({
      currentFontSize: fontSize,
      defaultMultiplier: 1.4,
      setLineHeight,
      setLineHeightMultiplier,
      setUserHasAdjusted,
    }), [fontSize, setLineHeight, setLineHeightMultiplier, setUserHasAdjusted]);

  // Line height multiplier change
  const handleLineHeightMultiplierChange = useCallback((newMultiplier) => {
    if (!userHasAdjusted) setUserHasAdjusted(true);
    setLineHeightMultiplier(newMultiplier);
    setLineHeight(fontSize * newMultiplier);
  }, [userHasAdjusted, setUserHasAdjusted, setLineHeightMultiplier, setLineHeight, fontSize]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setSelectedLine(null);
      }
      if (event.ctrlKey && !viewportDragEnabled) {
        setViewportDragEnabled(true);
      }
    };

    const handleKeyUp = (event) => {
      if (!event.ctrlKey && viewportDragEnabled) {
        setViewportDragEnabled(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [viewportDragEnabled, setSelectedLine, setViewportDragEnabled]);

  return {
    handleLineSelect,
    handleLineColorChange,
    handleResetSelectedLine,
    handleViewportToggle,
    handleColorPickerActiveChange,
    handleFontSizeChange,
    handleLineHeightChange,
    handleResetLineHeight,
    handleLineHeightMultiplierChange,
  };
}