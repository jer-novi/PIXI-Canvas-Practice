import { useState, useRef } from "react";

export function useCanvasState() {
  // Refs
  const viewportRef = useRef(null);
  const contentRef = useRef(null);

  // UI State
  const [selectedLine, setSelectedLine] = useState(null);
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
    selectedLine,
    setSelectedLine,
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