import { useSearchParams } from "react-router-dom";
import { useEffect, useMemo, useCallback, useRef } from "react";
import { useApplication } from "@pixi/react";
import { getPoemById } from "../../../data/testdata";
import PoemLine from "./poemLine";
import { useFontLoader } from "../../../hooks/useFontLoader";
import { useTextStyles } from "../hooks/useTextStyles";
import { useResponsiveTextPosition } from "../hooks/useResponsiveTextPosition";
import { usePixiAutoRender } from "../hooks/usePixiAutoRender";
import { useAutoRecenter } from "../hooks/useAutoRecenter";
import { debugManager } from "../../../debug/DebugManager";
import BackgroundImage from "./BackgroundImage"; // <-- Importeren
import { useDraggable } from "../hooks/useDraggable"; // <-- STAP 1: Importeer de hook

export function CanvasContent({
  canvasWidth,
  canvasHeight,
  textAlign,
  fontSize,
  fillColor,
  letterSpacing,
  lineHeight,
  titleColor,
  authorColor,
  viewportRef,
  selectedLines,
  onLineSelect,
  viewportDragEnabled,
  lineOverrides,
  setLineOverrides, // <-- Add setLineOverrides prop
  isColorPickerActive,
  fontFamily,
  fontStatus,
  backgroundImage, // <-- De nieuwe prop
  contentRef,
  poemOffset,
  setPoemOffset, // <-- STAP 2: Ontvang de state setter
  moveMode, // <-- En de moveMode
}) {
  const width = canvasWidth;
  const height = canvasHeight;
  const [searchParams, setSearchParams] = useSearchParams();
  const poemId = searchParams.get("poemId") ?? "123";

  const { app } = useApplication();
  const fontLoaded = useFontLoader("Cormorant Garamond");
  const currentPoem = poemId ? getPoemById(poemId) : null;

  // Responsive text positioning
  const textPosition = useResponsiveTextPosition(
    width,
    height,
    fontSize,
    lineHeight,
    currentPoem?.lines || []
  );

  // Ensure poemId exists in URL
  useEffect(() => {
    if (!searchParams.get("poemId")) {
      const params = new URLSearchParams(searchParams);
      params.set("poemId", "123");
      setSearchParams(params, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  // Auto-render on layout changes
  usePixiAutoRender(app, [
    width,
    height,
    textPosition.containerX,
    textPosition.containerY,
    textPosition.scaleFactor,
    fontSize,
    fillColor,
    letterSpacing,
    lineHeight,
    titleColor,
    authorColor,
  ]);

  // Resize renderer when canvas dimensions change
  useEffect(() => {
    if (app?.renderer) {
      app.renderer.resize(width, height);
    }
  }, [width, height, app]);

  // Auto-recenter viewport
  useAutoRecenter({
    viewportRef,
    contentRef,
    deps: [width, height, poemId, textAlign],
  });

  // Debug logging
  useEffect(() => {
    console.log("Viewport Debug:", {
      app: !!app,
      ticker: !!app?.ticker,
      renderer: !!app?.renderer,
      events: !!app?.renderer?.events,
      width,
      height,
    });
  }, [app, width, height]);

  // Debug logging for drag issues
  useEffect(() => {
    console.log('DEBUG CanvasContent:', {
      contentRef: !!contentRef.current,
      contentRefType: contentRef.current?.constructor?.name,
      moveMode: moveMode,
      appReady: !!app,
      stageReady: !!app?.stage
    });
  }, [contentRef.current, moveMode, app]);

  // Viewport plugin control - mode based
  useEffect(() => {
    if (viewportRef.current) {
      const viewport = viewportRef.current;

      // Disable viewport drag in line/poem modes (but keep Ctrl+drag)
      const shouldDisableViewport = moveMode !== 'edit';
      
      if (viewportDragEnabled && !shouldDisableViewport) {
        viewport.drag().pinch().wheel().decelerate();
      } else {
        viewport.plugins.remove("drag");
        // Keep pinch and wheel for navigation in all modes
        viewport.pinch().wheel().decelerate();
      }
    }
  }, [viewportDragEnabled, moveMode]);

  // Debug manager registration
  useEffect(() => {
    if (app && viewportRef.current && contentRef.current) {
      debugManager.registerComponents(
        app,
        viewportRef.current,
        contentRef.current
      );
    }
  }, [app, viewportRef.current, contentRef.current]);

  // Convert textAlign to anchorX
  const anchorX = useMemo(() => {
    return {
      left: 0,
      center: 0.5,
      right: 1,
    }[textAlign];
  }, [textAlign]);

  // Global styles for text rendering
  const globalStyles = {
    fillColor,
    fontSize,
    letterSpacing,
    lineHeight,
    textAlign,
    effectiveTitleColor: titleColor,
    effectiveAuthorColor: authorColor,
    fontFamily, // <-- 2. Voeg de prop hier toe aan het object
  };

  const { titleStyle, authorStyle, lineStyle } = useTextStyles(
    fontLoaded,
    globalStyles,
    fontStatus // <-- 2. Geef de prop door aan de hook
  );

  const originalPoemOffset = useRef(poemOffset);
  const originalOffsets = useRef(new Map()); // For line drag

  // Poem drag handlers
  const handleDragStart = useCallback(() => {
    if (contentRef.current) {
      originalPoemOffset.current = poemOffset; // Onthoud de startpositie
      contentRef.current.alpha = 0.5; // Visuele feedback
    }
  }, [poemOffset, contentRef]);

  const handleDragMove = useCallback(
    (dragOffset) => {
      // We updaten de state met de originele positie + de nieuwe sleep-offset
      setPoemOffset({
        x: originalPoemOffset.current.x + dragOffset.x,
        y: originalPoemOffset.current.y + dragOffset.y,
      });
    },
    [setPoemOffset]
  );

  const handleDragEnd = useCallback(() => {
    if (contentRef.current) {
      contentRef.current.alpha = 1.0; // Herstel visuele feedback
    }
  }, [contentRef]);

  // Line drag handlers
  const handleLineDragStart = useCallback((index, selectedLines) => {
    console.log('Line drag start:', index, Array.from(selectedLines));
    // Store original positions van alle geselecteerde regels
    selectedLines.forEach(lineIndex => {
      const currentOffset = lineOverrides[lineIndex]?.offset || { x: 0, y: 0 };
      originalOffsets.current.set(lineIndex, currentOffset);
    });
  }, [lineOverrides]);

  const handleLineDragMove = useCallback((draggedIndex, offset, selectedLines) => {
    // Update alle geselecteerde regels
    const updates = {};
    selectedLines.forEach(lineIndex => {
      const originalOffset = originalOffsets.current.get(lineIndex) || { x: 0, y: 0 };
      updates[lineIndex] = {
        ...lineOverrides[lineIndex],
        offset: {
          x: originalOffset.x + offset.x,
          y: originalOffset.y + offset.y
        }
      };
    });
    
    // Update lineOverrides state with all changes at once
    setLineOverrides && setLineOverrides(prev => ({ ...prev, ...updates }));
  }, [lineOverrides, setLineOverrides]);

  const handleLineDragEnd = useCallback(() => {
    console.log('Line drag end');
    originalOffsets.current.clear();
  }, []);

  // STAP 4: Roep de hook aan en koppel hem aan de contentRef
  // We doen dit alleen als de moveMode 'poem' is!
  useDraggable(contentRef, {
    enabled: moveMode === "poem", // Explicit enabled flag
    onDragStart: handleDragStart,
    onDragMove: handleDragMove, 
    onDragEnd: handleDragEnd
  });

  // Loading state
  if (!fontLoaded || !currentPoem) {
    const message = !fontLoaded
      ? "Lettertype laden..."
      : "Geen gedicht gekozen.";
    return (
      <pixiText
        text={message}
        anchor={{ x: 0.5, y: 0.5 }}
        x={width / 2}
        y={height / 2}
        style={{ fill: "white", fontSize: 24, fontFamily: "Arial" }}
      />
    );
  }

  // Wait for PIXI app and events system
  if (!app || !app.renderer || !app.renderer.events) {
    return null;
  }

  return (
    <pixiViewport
      ref={viewportRef}
      screenWidth={width}
      screenHeight={height}
      worldWidth={width}
      worldHeight={height}
      events={app.renderer.events}
    >
      {/* Render de achtergrond EERST, zodat hij achter de tekst komt */}
      <BackgroundImage
        imageUrl={backgroundImage}
        canvasWidth={width}
        canvasHeight={height}
      />

      <pixiContainer
        ref={contentRef}
        x={textPosition.containerX + poemOffset.x}
        y={textPosition.containerY + poemOffset.y}
        scale={{ x: textPosition.scaleFactor, y: textPosition.scaleFactor }}
        eventMode={moveMode === 'poem' ? 'dynamic' : 'passive'}
        interactive={moveMode === 'poem'}
      >
        <pixiText
          text={currentPoem.title}
          x={0}
          anchor={{ x: anchorX, y: 0 }}
          y={0}
          style={titleStyle}
        />

        <pixiText
          text={currentPoem.author}
          x={0}
          anchor={{ x: anchorX, y: 0 }}
          y={textPosition.authorY}
          style={authorStyle}
        />

        {currentPoem.lines.map((line, index) => {
          const lineOffset = lineOverrides[index]?.offset || { x: 0, y: 0 };

          return (
            <PoemLine
              key={index}
              line={line}
              x={0 + lineOffset.x}
              y={textPosition.poemStartY + index * lineHeight + lineOffset.y}
              baseStyle={lineStyle}
              lineOverrides={lineOverrides[index]}
              //isSelected={selectedLine === index} // <-- OUDE LOGICA
              isSelected={selectedLines.has(index)} // <-- NIEUWE LOGICA
              //onSelect={() => onLineSelect(index)} // <-- OUDE LOGICA
              fontStatus={fontStatus} // <-- 3. Geef de prop door aan de PoemLine
              globalFontFamily={fontFamily} // Geef ook de globale font mee als fallback
              onSelect={(event) => onLineSelect(index, event)} // <-- NIEUWE LOGICA: geef event door!
              anchorX={anchorX}
              isColorPickerActive={isColorPickerActive}
              // New drag props
              moveMode={moveMode}
              index={index}
              selectedLines={selectedLines}
              onDragLineStart={handleLineDragStart}
              onDragLineMove={handleLineDragMove}
              onDragLineEnd={handleLineDragEnd}
            />
          );
        })}
      </pixiContainer>
    </pixiViewport>
  );
}
