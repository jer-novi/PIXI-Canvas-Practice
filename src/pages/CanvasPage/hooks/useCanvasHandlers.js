// src/pages/CanvasPage/hooks/useCanvasHandlers.js

import { useCallback, useEffect } from "react";
import {
  handleFontSizeChangeUtil,
  handleLineHeightChangeUtil,
  resetLineHeightUtil,
} from "../utils/lineHeightUtils";

export function useCanvasHandlers(canvasState) {
  const {
    selectedLines, // <-- We hebben nu de Set met selecties nodig

    handleSelect, // <-- Nieuwe handler uit useSelection
    clearSelection, // <-- Nieuwe handler uit useSelection
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

  // Line selection handler is nu een simpele doorgever
  const handleLineSelect = useCallback(
    (index, event) => {
      handleSelect(index, event);
    },
    [handleSelect]
  );

  // Past kleur toe op ALLE geselecteerde regels
  const handleLineColorChange = useCallback(
    (color) => {
      if (selectedLines.size > 0) {
        setLineOverrides((prev) => {
          const newOverrides = { ...prev };
          selectedLines.forEach((index) => {
            newOverrides[index] = { ...newOverrides[index], fillColor: color };
          });
          return newOverrides;
        });
      }
    },
    [selectedLines, setLineOverrides]
  );

  // Reset de stijl voor ALLE geselecteerde regels
  const handleResetSelectedLines = useCallback(() => {
    if (selectedLines.size > 0) {
      setLineOverrides((prev) => {
        const newOverrides = { ...prev };
        selectedLines.forEach((index) => {
          // Verwijder de hele override voor de geselecteerde regel
          // Simpeler dan individuele properties verwijderen
          delete newOverrides[index];
        });
        return newOverrides;
      });
      clearSelection(); // Deselecteer na het resetten
    }
  }, [selectedLines, setLineOverrides, clearSelection]);

  // Viewport control
  const handleViewportToggle = useCallback(
    (enabled) => {
      setViewportDragEnabled(enabled);
    },
    [setViewportDragEnabled]
  );

  // Color picker active state
  const handleColorPickerActiveChange = useCallback(
    (isActive) => {
      canvasState.setIsColorPickerActive(isActive);
    },
    [canvasState]
  );

  // Font size, line height, etc. blijven hetzelfde...
  const handleFontSizeChange = useCallback(
    (newSize) =>
      handleFontSizeChangeUtil(newSize, {
        userHasAdjusted,
        lineHeightMultiplier,
        setFontSize,
        setLineHeight,
      }),
    [userHasAdjusted, lineHeightMultiplier, setFontSize, setLineHeight]
  );

  const handleLineHeightChange = useCallback(
    (newHeight) =>
      handleLineHeightChangeUtil(newHeight, {
        userHasAdjusted,
        setUserHasAdjusted,
        setLineHeight,
        fontSize,
        setLineHeightMultiplier,
      }),
    [
      userHasAdjusted,
      setUserHasAdjusted,
      setLineHeight,
      fontSize,
      setLineHeightMultiplier,
    ]
  );

  const handleResetLineHeight = useCallback(
    () =>
      resetLineHeightUtil({
        currentFontSize: fontSize,
        setLineHeight,
        setLineHeightMultiplier,
        setUserHasAdjusted,
      }),
    [fontSize, setLineHeight, setLineHeightMultiplier, setUserHasAdjusted]
  );

  const handleLineHeightMultiplierChange = useCallback(
    (newMultiplier) => {
      if (!userHasAdjusted) setUserHasAdjusted(true);
      setLineHeightMultiplier(newMultiplier);
      setLineHeight(fontSize * newMultiplier);
    },
    [
      userHasAdjusted,
      setUserHasAdjusted,
      setLineHeightMultiplier,
      setLineHeight,
      fontSize,
    ]
  );

  const handleLineLetterSpacingChange = useCallback(
    (spacing) => {
      if (selectedLines.size > 0) {
        setLineOverrides((prev) => {
          const newOverrides = { ...prev };
          selectedLines.forEach((index) => {
            newOverrides[index] = {
              ...newOverrides[index],
              letterSpacing: spacing,
            };
          });
          return newOverrides;
        });
      }
    },
    [selectedLines, setLineOverrides]
  );

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        clearSelection(); // <-- Gebruik de nieuwe clearSelection functie
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

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [viewportDragEnabled, clearSelection, setViewportDragEnabled]);

  return {
    handleLineSelect,
    handleLineColorChange,
    handleLineLetterSpacingChange,
    handleResetSelectedLines, // <-- Hernoemd voor duidelijkheid
    handleViewportToggle,
    handleColorPickerActiveChange,
    handleFontSizeChange,
    handleLineHeightChange,
    handleResetLineHeight,
    handleLineHeightMultiplierChange,
  };
}
