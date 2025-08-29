// src/pages/CanvasPage/hooks/useCanvasState.js

import { useState, useRef, useMemo } from "react";
import { useSelection } from "./useSelection"; // <-- STAP 2.1: Importeer de hook
import { useFontManager } from "./useFontManager"; // <-- STAP 2.1: Importeer de manager

export function useCanvasState() {
  // Refs
  const viewportRef = useRef(null);
  const contentRef = useRef(null);

  // UI State

  const [viewportDragEnabled, setViewportDragEnabled] = useState(false);
  const [lineOverrides, setLineOverrides] = useState({});
  const [isColorPickerActive, setIsColorPickerActive] = useState(false);

  // const [selectedLine, setSelectedLine] = useState(null); // <-- STAP 2.2: VERWIJDER DEZE
  const selection = useSelection(); // <-- STAP 2.3: Gebruik de nieuwe hook
  const fontManager = useFontManager(); // <-- STAP 2.2: Roep de manager aan

  // Text Styling State
  const [fontFamily, setFontFamily] = useState("Cormorant Garamond"); // <-- STAP 2.3: Nieuwe state voor het lettertype
  const [fontSize, setFontSize] = useState(36);

  const [fillColor, setFillColor] = useState("#ffffff");
  const [letterSpacing, setLetterSpacing] = useState(0);

  // Hierarchical color system: null means use global color, otherwise use override
  const [titleColorOverride, setTitleColorOverride] = useState(null);
  const [authorColorOverride, setAuthorColorOverride] = useState(null);

  // Deprecated: keeping for backward compatibility, will be removed
  const [titleColor, setTitleColor] = useState("#ffffff");
  const [authorColor, setAuthorColor] = useState("#cccccc");

  const [lineHeight, setLineHeight] = useState(36 * 1.4);
  const [lineHeightMultiplier, setLineHeightMultiplier] = useState(1.4);
  const [textAlign, setTextAlign] = useState("center");

  // Internal State
  const [userHasAdjusted, setUserHasAdjusted] = useState(false);

  // Reactive computed values using useMemo
  const effectiveTitleColor = useMemo(() => {
    return titleColorOverride || fillColor;
  }, [titleColorOverride, fillColor]);

  const effectiveAuthorColor = useMemo(() => {
    return authorColorOverride || fillColor;
  }, [authorColorOverride, fillColor]);

  const hasTitleColorOverride = useMemo(() => {
    return titleColorOverride !== null;
  }, [titleColorOverride]);

  const hasAuthorColorOverride = useMemo(() => {
    return authorColorOverride !== null;
  }, [authorColorOverride]);

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

    // NIEUW: Font-gerelateerde state en functies
    fontFamily,
    setFontFamily,
    ...fontManager, // Voegt availableFonts, fontStatus, en loadFont toe

    // Text Styling State
    fontSize,
    setFontSize,
    fillColor,
    setFillColor,
    letterSpacing,
    setLetterSpacing,

    // Hierarchical color system
    titleColorOverride,
    setTitleColorOverride,
    authorColorOverride,
    setAuthorColorOverride,

    // Computed effective colors (now reactive)
    effectiveTitleColor,
    effectiveAuthorColor,
    hasTitleColorOverride,
    hasAuthorColorOverride,

    // Deprecated: keeping for backward compatibility
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
