// src/pages/CanvasPage/hooks/useCanvasState.js

import { useState, useRef } from "react";
import { useSelection } from "./useSelection"; // <-- STAP 2.1: Importeer de hook

export function useCanvasState() {
  // Refs
  const viewportRef = useRef(null);
  const contentRef = useRef(null);

  // UI State
  // const [selectedLine, setSelectedLine] = useState(null); // <-- STAP 2.2: VERWIJDER DEZE
  const selection = useSelection(); // <-- STAP 2.3: Gebruik de nieuwe hook

  const [viewportDragEnabled, setViewportDragEnabled] = useState(false);
  const [lineOverrides, setLineOverrides] = useState({});
  const [isColorPickerActive, setIsColorPickerActive] = useState(false);

  // Text Styling State
  const [fontSize, setFontSize] = useState(36);
  const [fillColor, setFillColor] = useState("#ffffff");
  const [letterSpacing, setLetterSpacing] = useState(0);
  const [titleColor, setTitleColor] = useState("#ffffff");
  const [authorColor, setAuthorColor] = useState("#cccccc");
  const [lineHeight, setLineHeight] = useState(36 * 1.4);
  const [lineHeightMultiplier, setLineHeightMultiplier] = useState(1.4);
  const [textAlign, setTextAlign] = useState("center");

  // Internal State
  const [userHasAdjusted, setUserHasAdjusted] = useState(false);

  return {
    // Refs
    viewportRef,
    contentRef,

    // UI State
    ...selection, // <-- STAP 2.4: Voeg alle selection state & handlers toe
    viewportDragEnabled,
    setViewportDragEnabled,
    lineOverrides,
    setLineOverrides,
    isColorPickerActive,
    setIsColorPickerActive,

    // Text Styling State
    fontSize,
    setFontSize,
    fillColor,
    setFillColor,
    letterSpacing,
    setLetterSpacing,
    titleColor,
    setTitleColor,
    authorColor,
    setAuthorColor,
    lineHeight,
    setLineHeight,
    lineHeightMultiplier,
    setLineHeightMultiplier,
    textAlign,
    setTextAlign,

    // Internal State
    userHasAdjusted,
    setUserHasAdjusted,
  };
}
