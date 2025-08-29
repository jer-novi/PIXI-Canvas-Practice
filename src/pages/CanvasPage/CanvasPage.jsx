import { Application, extend } from "@pixi/react";
import { Text, Container, Graphics } from "pixi.js";
import { Viewport } from "pixi-viewport";

// CRITICAL: extend() MUST be called at module level, outside components
extend({ Text, Container, Graphics, Viewport });

import Controls from "./Controls";
import { useResponsiveCanvas } from "./hooks/useResponsiveCanvas";
import { useResponsiveTextPosition } from "./hooks/useResponsiveTextPosition";
import { useCanvasState } from "./hooks/useCanvasState";
import { useCanvasHandlers } from "./hooks/useCanvasHandlers";
import { CanvasContent } from "./components/CanvasContent";
import ResponsiveLayout from "./components/ResponsiveLayout";
import Navigation from "./components/Navigation";

// Main component that manages state
export default function CanvasPage() {
  // Use custom hooks for state and handlers
  const canvasState = useCanvasState();
  const handlers = useCanvasHandlers(canvasState);

  // Use responsive canvas hook
  const layout = useResponsiveCanvas();

  // Text positioning hook for debug info
  const textPosition = useResponsiveTextPosition(
    layout.canvasWidth,
    layout.canvasHeight,
    canvasState.fontSize,
    canvasState.lineHeight,
    [] // baseline; poem selection and exact lines are handled in CanvasContent
  );

  return (
    <>
      <ResponsiveLayout
        layout={layout}
        controls={
          <Controls
            fontSize={canvasState.fontSize}
            onFontSizeChange={handlers.handleFontSizeChange}
            fillColor={canvasState.fillColor}
            onFillColorChange={canvasState.setFillColor}
            letterSpacing={canvasState.letterSpacing}
            onLetterSpacingChange={canvasState.setLetterSpacing}
            lineHeight={canvasState.lineHeight}
            onLineHeightChange={handlers.handleLineHeightChange}
            lineHeightMultiplier={canvasState.lineHeightMultiplier}
            onLineHeightMultiplierChange={
              handlers.handleLineHeightMultiplierChange
            }
            onResetLineHeight={handlers.handleResetLineHeight}
            textAlign={canvasState.textAlign}
            onTextAlignChange={canvasState.setTextAlign}
            selectedLines={canvasState.selectedLines}
            onLineColorChange={handlers.handleLineColorChange}
            onLineLetterSpacingChange={handlers.handleLineLetterSpacingChange}
            handleResetSelectedLines={handlers.handleResetSelectedLines}
            onApplyGlobalLetterSpacing={handlers.handleApplyGlobalLetterSpacing}
            lineOverrides={canvasState.lineOverrides}
            viewportDragEnabled={canvasState.viewportDragEnabled}
            onViewportToggle={handlers.handleViewportToggle}
            onColorPickerActiveChange={handlers.handleColorPickerActiveChange}
            // Hierarchical color system props
            effectiveTitleColor={canvasState.effectiveTitleColor}
            effectiveAuthorColor={canvasState.effectiveAuthorColor}
            hasTitleColorOverride={canvasState.hasTitleColorOverride}
            hasAuthorColorOverride={canvasState.hasAuthorColorOverride}
            onTitleColorChange={handlers.handleTitleColorChange}
            onAuthorColorChange={handlers.handleAuthorColorChange}
            onResetTitleColor={handlers.handleResetTitleColor}
            onResetAuthorColor={handlers.handleResetAuthorColor}
            onSyncAllColorsToGlobal={handlers.handleSyncAllColorsToGlobal}
            // Deprecated: keeping for backward compatibility
            titleColor={canvasState.titleColor}
            authorColor={canvasState.authorColor}
            availableFonts={canvasState.availableFonts}
            fontFamily={canvasState.fontFamily}
            onFontFamilyChange={handlers.handleFontFamilyChange}
          />
        }
        canvas={
          <Application
            width={layout.canvasWidth}
            height={layout.canvasHeight}
            options={{
              background: 0x1d2230,
              resolution: window.devicePixelRatio || 1,
              autoDensity: true,
            }}
          >
            <CanvasContent
              canvasWidth={layout.canvasWidth}
              canvasHeight={layout.canvasHeight}
              fontSize={canvasState.fontSize}
              fillColor={canvasState.fillColor}
              letterSpacing={canvasState.letterSpacing}
              lineHeight={canvasState.lineHeight}
              textAlign={canvasState.textAlign}
              titleColor={canvasState.effectiveTitleColor}
              authorColor={canvasState.effectiveAuthorColor}
              viewportRef={canvasState.viewportRef}
              contentRef={canvasState.contentRef}
              fontFamily={canvasState.fontFamily}
              onFontFamilyChange={handlers.handleFontFamilyChange}
              selectedLines={canvasState.selectedLines} // Was er al
              lineOverrides={canvasState.lineOverrides} // Was er al
              onLineSelect={handlers.handleLineSelect}
              viewportDragEnabled={canvasState.viewportDragEnabled}
              isColorPickerActive={canvasState.isColorPickerActive}
            />
          </Application>
        }
        navigation={<Navigation />}
      />

      {/* Development Mode Indicator (Clean, Non-Intrusive) */}
      {import.meta.env.DEV && (
        <div
          style={{
            position: "fixed",
            bottom: "10px",
            left: "10px",
            background: "rgba(0,100,0,0.8)",
            color: "white",
            padding: "4px 8px",
            borderRadius: "4px",
            fontSize: "11px",
            fontFamily: "monospace",
            zIndex: 1000,
          }}
        >
          DEV MODE | Console: window.debugCanvas.toggle()
        </div>
      )}
    </>
  );
}
