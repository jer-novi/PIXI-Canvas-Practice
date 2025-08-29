import { useMemo } from "react";
import * as PIXI from "pixi.js";

export function useTextStyles(
  fontLoaded,
  globalStyles,
  fontFamily = "Cormorant Garamond"
) {
  return useMemo(() => {
    const baseFillColor = globalStyles?.fillColor || "white";
    const baseFontSize = globalStyles?.fontSize || 32;
    const baseLetterSpacing = globalStyles?.letterSpacing || 0;
    
    // Hierarchical color system: use override if exists, otherwise use global color
    const baseTitleColor = globalStyles?.effectiveTitleColor || baseFillColor;
    const baseAuthorColor = globalStyles?.effectiveAuthorColor || baseFillColor;
    const fontFamily = globalStyles?.fontFamily || "Cormorant Garamond";

    if (!fontLoaded) {
      return {
        titleStyle: new PIXI.TextStyle({
          fill: baseTitleColor,
          fontSize: 48,
          fontFamily: "Arial",
          fontWeight: "bold",
        }),
        authorStyle: new PIXI.TextStyle({
          fill: baseAuthorColor,
          fontSize: 24,
          fontFamily: "Arial",
          fontStyle: "italic",
        }),
        lineStyle: new PIXI.TextStyle({
          fill: baseFillColor,
          fontSize: baseFontSize,
          fontFamily: "Arial",
          lineHeight: baseFontSize + 12,
          letterSpacing: baseLetterSpacing,
        }),
      };
    }

    return {
      titleStyle: new PIXI.TextStyle({
        fill: baseTitleColor,
        fontSize: 48,
        fontFamily,
        fontWeight: "bold",
      }),
      authorStyle: new PIXI.TextStyle({
        fill: baseAuthorColor,
        fontSize: 24,
        fontFamily,
        fontStyle: "italic",
      }),
      lineStyle: new PIXI.TextStyle({
        fill: baseFillColor,
        fontSize: baseFontSize,
        fontFamily,
        lineHeight: baseFontSize + 12,
        letterSpacing: baseLetterSpacing,
      }),
    };
  }, [fontLoaded, fontFamily, globalStyles]);
}

// New hook for creating individual line styles with overrides
export function useLineStyle(
  baseStyle,
  lineOverrides,
  isSelected,
  isColorPickerActive = false
) {
  return useMemo(() => {
    if (!baseStyle) return null;

    // Start with base style properties
    const styleProps = {
      fill: baseStyle.fill,
      fontSize: baseStyle.fontSize,
      fontFamily: baseStyle.fontFamily,
      lineHeight: baseStyle.lineHeight,
      letterSpacing: baseStyle.letterSpacing,
    };

    // Check if line has color override
    const hasColorOverride = lineOverrides?.fillColor;

    // Apply selection styling ONLY if color picker is not active
    if (isSelected && !isColorPickerActive) {
      styleProps.stroke = "#ffff00"; // Yellow border for selection indicator
      styleProps.strokeThickness = 2; // Subtle border thickness

      // Apply yellow fill ONLY if no color override exists
      if (!hasColorOverride) {
        styleProps.fill = "#ffff00"; // Yellow selection color
      }
    }

    // Apply line-specific overrides
    if (lineOverrides) {
      if (lineOverrides.fillColor) styleProps.fill = lineOverrides.fillColor;
      if (lineOverrides.fontSize) {
        styleProps.fontSize = lineOverrides.fontSize;
        styleProps.lineHeight = lineOverrides.fontSize + 12;
      }
      if (lineOverrides.letterSpacing) {
        styleProps.letterSpacing = lineOverrides.letterSpacing;
      }
    }

    return new PIXI.TextStyle(styleProps);
  }, [baseStyle, lineOverrides, isSelected, isColorPickerActive]);
}
