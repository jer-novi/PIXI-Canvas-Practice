import { Application, extend } from "@pixi/react";
import { Text, Container, Graphics } from "pixi.js";
import { Viewport } from "pixi-viewport";
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { getPoemById } from "../../data/testdata";

// CRITICAL: extend() MUST be called at module level, outside components
extend({ Text, Container, Graphics, Viewport });

import Controls from "./Controls";
import { useResponsiveCanvas } from "./hooks/useResponsiveCanvas";
import { useCanvasState } from "./hooks/useCanvasState";
import { useCanvasHandlers } from "./hooks/useCanvasHandlers";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";
import { CanvasContent } from "./components/CanvasContent";
import ResponsiveLayout from "./components/ResponsiveLayout";
import Navigation from "./components/Navigation";
import FloatingPhotoGrid from "./components/FloatingPhotoGrid";
import XYMoveSliders from "./components/XYMoveSliders";

// Main component that manages state
export default function CanvasPage() {
  // Get current poem data for keyboard shortcuts
  const [searchParams] = useSearchParams();
  const poemId = searchParams.get("poemId") ?? "123";
  const currentPoem = poemId ? getPoemById(poemId) : null;

  // Use custom hooks for state and handlers
  const canvasState = useCanvasState();
  const handlers = useCanvasHandlers(canvasState);

  // Use keyboard shortcuts hook for mode cycling and selection management
  const keyboardShortcuts = useKeyboardShortcuts({
    moveMode: canvasState.moveMode,
    setMoveMode: canvasState.setMoveMode,
    selectedLines: canvasState.selectedLines,
    clearSelection: canvasState.clearSelection,
    selectAll: canvasState.selectAll,
    currentPoem
  });

  // Use responsive canvas hook
  const layout = useResponsiveCanvas();

  // Text positioning hook for debug info - commented out as not currently used
  // const textPosition = useResponsiveTextPosition(
  //   layout.canvasWidth,
  //   layout.canvasHeight,
  //   canvasState.fontSize,
  //   canvasState.lineHeight,
  //   [] // baseline; poem selection and exact lines are handled in CanvasContent
  // );

  // Handle selection restoration when switching modes
  useEffect(() => {
    // When switching to line mode from edit mode with no current selection,
    // restore the previous selection if it exists
    if (canvasState.moveMode === 'line' && canvasState.selectedLines.size === 0) {
      const previousSelection = keyboardShortcuts.restorePreviousSelection();
      if (previousSelection.size > 0) {
        canvasState.restoreSelection(previousSelection);
      }
    }
  }, [canvasState.moveMode, canvasState.selectedLines.size, keyboardShortcuts, canvasState]);

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
            onLineFontSizeChange={handlers.handleLineFontSizeChange}
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
            // Deprecated: keeping for backward compatibility
            titleColor={canvasState.titleColor}
            authorColor={canvasState.authorColor}
            availableFonts={canvasState.availableFonts}
            fontFamily={canvasState.fontFamily}
            onFontFamilyChange={handlers.handleFontFamilyChange}
            // Pexels background props
            photos={canvasState.photos}
            isLoading={canvasState.isLoading}
            error={canvasState.error}
            onSearch={handlers.handleSearchBackground} // De bestaande voor vrij zoeken
            onCitySearch={handlers.handleCitySearch}
            onSetBackground={handlers.handleSetBackground}
            onNextPage={handlers.handleNextPage}
            onPrevPage={handlers.handlePrevPage}
            hasNextPage={canvasState.hasNextPage}
            hasPrevPage={canvasState.hasPrevPage}
            onResetToCollection={handlers.handleResetToCollection}
            onOpenPhotoGrid={handlers.handleOpenPhotoGrid}
            poemOffset={canvasState.poemOffset}
            setPoemOffset={canvasState.setPoemOffset}
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
              fontStatus={canvasState.fontStatus}
              onFontFamilyChange={handlers.handleFontFamilyChange}
              selectedLines={canvasState.selectedLines} // Was er al
              lineOverrides={canvasState.lineOverrides} // Was er al
              setLineOverrides={canvasState.setLineOverrides} // Add setLineOverrides
              onLineSelect={handlers.handleLineSelect}
              viewportDragEnabled={canvasState.viewportDragEnabled}
              isColorPickerActive={canvasState.isColorPickerActive}
              backgroundImage={canvasState.backgroundImage}
              onNextPage={handlers.handleNextPage}
              onPrevPage={handlers.handlePrevPage}
              hasNextPage={canvasState.hasNextPage}
              hasPrevPage={canvasState.hasPrevPage}
              onSearch={handlers.handleSearchBackground} // De bestaande voor vrij zoeken
              onCitySearch={handlers.handleCitySearch} // De nieuwe voor de dropdowns
              poemOffset={canvasState.poemOffset}
              setPoemOffset={canvasState.setPoemOffset}
              moveMode={canvasState.moveMode}
            />
          </Application>
        }
        navigation={
          <Navigation
            onSyncAllColorsToGlobal={handlers.handleSyncAllColorsToGlobal}
            onSyncAllFontsToGlobal={handlers.handleSyncAllFontsToGlobal}
            moveMode={canvasState.moveMode}
            setMoveMode={canvasState.setMoveMode}
            selectedLines={canvasState.selectedLines}
            clearSelection={canvasState.clearSelection}
          />
        }
      />

      {/* Floating Photo Grid */}
      {canvasState.photoGridVisible && (
        <FloatingPhotoGrid
          photos={canvasState.photos}
          isLoading={canvasState.isLoading}
          error={canvasState.error}
          currentQuery={canvasState.currentQuery}
          onSetBackground={handlers.handleSetBackground}
          onClose={() => canvasState.setPhotoGridVisible(false)}
          onNextPage={handlers.handleNextPage}
          onPrevPage={handlers.handlePrevPage}
          hasNextPage={canvasState.hasNextPage}
          hasPrevPage={canvasState.hasPrevPage}
        />
      )}

      {/* Floating XY Move Sliders - Only show in poem/line modes */}
      {(canvasState.moveMode === 'poem' || canvasState.moveMode === 'line') && (
        <XYMoveSliders
          moveMode={canvasState.moveMode}
          selectedLines={canvasState.selectedLines}
          poemOffset={canvasState.poemOffset}
          setPoemOffset={canvasState.setPoemOffset}
          lineOverrides={canvasState.lineOverrides}
          setLineOverrides={canvasState.setLineOverrides}
        />
      )}

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
