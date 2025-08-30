import { useSearchParams } from "react-router-dom";
import { useEffect, useMemo } from "react";
import { useApplication } from "@pixi/react";
import { poems, getPoemById } from "../../../data/testdata";
import PoemLine from "./poemLine";
import { useFontLoader } from "../../../hooks/useFontLoader";
import { useTextStyles } from "../hooks/useTextStyles";
import { useResponsiveTextPosition } from "../hooks/useResponsiveTextPosition";
import { usePixiAutoRender } from "../hooks/usePixiAutoRender";
import { useAutoRecenter } from "../hooks/useAutoRecenter";
import { debugManager } from "../../../debug/DebugManager";

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
  contentRef,
  selectedLines,
  onLineSelect,
  viewportDragEnabled,
  lineOverrides,
  isColorPickerActive,
  fontFamily,
  fontStatus,
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

  // Viewport plugin control
  useEffect(() => {
    if (viewportRef.current) {
      const viewport = viewportRef.current;

      if (viewportDragEnabled) {
        viewport.drag().pinch().wheel().decelerate();
      } else {
        viewport.plugins.remove("drag");
        viewport.plugins.remove("pinch");
        viewport.plugins.remove("wheel");
        viewport.plugins.remove("decelerate");
      }
    }
  }, [viewportDragEnabled]);

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
      <pixiContainer
        ref={contentRef}
        x={textPosition.containerX}
        y={textPosition.containerY}
        scale={{ x: textPosition.scaleFactor, y: textPosition.scaleFactor }}
        eventMode="passive"
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

        {currentPoem.lines.map((line, index) => (
          <PoemLine
            key={index}
            line={line}
            x={0}
            y={textPosition.poemStartY + index * lineHeight}
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
          />
        ))}
      </pixiContainer>
    </pixiViewport>
  );
}
