import { poems, getPoemById } from "../../data/testdata";
import PoemLine from "./components/poemLine";
import { Application } from "@pixi/react"; // Stap 1: De Component uit @pixi/react
import { Text, Container } from "pixi.js"; // Stap 2: De Classes uit pixi.js
import { useSearchParams } from "react-router-dom";
import {
  useState,
  useLayoutEffect,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import { extend, useApplication } from "@pixi/react";
import * as PIXI from "pixi.js";
import Controls from "./Controls";
import { useFontLoader } from "../../hooks/useFontLoader";
import { useResponsiveCanvas } from "./hooks/useResponsiveCanvas";
import { useResponsiveTextPosition } from "./hooks/useResponsiveTextPosition";
import { usePixiAutoRender } from "./hooks/usePixiAutoRender";
import ResponsiveLayout from "./components/ResponsiveLayout";
import Navigation from "./components/Navigation";
import { useAutoRecenter } from "./hooks/useAutoRecenter";

// Development-only debug tooling (tree-shaken in production)
import { debugManager } from "../../debug/DebugManager";
import {
  handleFontSizeChangeUtil,
  handleLineHeightChangeUtil,
  resetLineHeightUtil,
} from "./utils/lineHeightUtils";

// Hooks zijn nu geïmporteerd uit aparte bestanden

function CanvasContent({
  canvasWidth,
  canvasHeight,
  textAlign,
  fontSize,
  fillColor,
  letterSpacing,
  lineHeight,
  viewportRef,
  contentRef,
  selectedLine,
  onLineSelect,
}) {
  const width = canvasWidth;
  const height = canvasHeight;
  const [searchParams, setSearchParams] = useSearchParams();
  const poemId = searchParams.get("poemId") ?? "123";
  // --- DE FIX ---
  const { app } = useApplication(); // useApp() -> useApplication() returns { app }

  // --- Gebruik de font loader hook ---
  const fontLoaded = useFontLoader("Cormorant Garamond");

  // We gebruiken nu het 'poemId' om te bepalen welke data we tonen.
  const currentPoem = poemId ? getPoemById(poemId) : null;

  // Responsive text positioning
  const textPosition = useResponsiveTextPosition(
    width,
    height,
    fontSize,
    lineHeight,
    currentPoem?.lines || []
  );

  useEffect(() => {
    if (!searchParams.get("poemId")) {
      const params = new URLSearchParams(searchParams);
      params.set("poemId", "123");
      setSearchParams(params, { replace: true }); // geen extra push in history
    }
  }, [searchParams, setSearchParams]);

  // Modern React 19 pattern: Auto-render on layout changes
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
  ]);

  // Resize renderer when canvas dimensions change
  useEffect(() => {
    if (app?.renderer) {
      app.renderer.resize(width, height);
    }
  }, [width, height, app]);

  // --- NIEUW: Roep de auto-recenter hook aan ---
  // Dit effect zorgt voor centrering als de layout of de tekst-stijl verandert.
  useAutoRecenter({
    viewportRef,
    contentRef,
    deps: [
      width,
      height,
      fontSize,
      lineHeight,
      letterSpacing,
      fillColor,
      poemId,
      textAlign,
    ], // Alle variabelen die de positie/grootte beïnvloeden
  });

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

  // --- Development Debug Integration (Clean Separation) ---
  useEffect(() => {
    // Register components with debug manager (development only)
    if (app && viewportRef.current && contentRef.current) {
      debugManager.registerComponents(
        app,
        viewportRef.current,
        contentRef.current
      );
    }
  }, [app, viewportRef.current, contentRef.current]);

  // --- NIEUW: Vertaal de 'textAlign' state naar een 'anchorX' waarde ---
  const anchorX = useMemo(() => {
    return {
      left: 0,
      center: 0.5,
      right: 1,
    }[textAlign];
  }, [textAlign]); // deps-array is het tweede argument van useMemo

  // In een echte app zou je hier een API-call doen.
  const titleStyle = new PIXI.TextStyle({
    fill: fillColor,
    fontSize: fontSize * 1.5,
    fontFamily: "Cormorant Garamond",
    fontWeight: "bold",
    letterSpacing: letterSpacing,
    align: textAlign,
  });

  const authorStyle = new PIXI.TextStyle({
    fill: "#cccccc",
    fontSize: fontSize * 0.75,
    fontFamily: "Cormorant Garamond",
    fontStyle: "italic",
    align: textAlign,
  });

  const lineStyle = {
    fontFamily: "Cormorant Garamond",
    fontSize: fontSize,
    fill: fillColor,
    lineHeight: lineHeight,
    letterSpacing: letterSpacing,
    align: textAlign,
    wordWrap: true,
    wordWrapWidth: 600,
    breakWords: true,
  };

  const selectedLineStyle = {
    ...lineStyle,
    fill: "#ffcc00",
    fontWeight: "bold",
  };

  if (!fontLoaded || !currentPoem) {
    const message = !fontLoaded
      ? "Lettertype laden..."
      : "Geen gedicht gekozen.";
    return (
      <pixiText
        text="Laden..."
        anchor={{ x: 0.5, y: 0.5 }}
        x={width / 2}
        y={height / 2}
        style={{ fill: "white", fontSize: 24, fontFamily: "Arial" }}
      />
    );
  }

  // Wacht tot Pixi app en events-systeem klaar zijn (vereist door pixi-viewport)
  if (!app || !app.renderer || !app.renderer.events) {
    return null;
  }

  // Als er wel een gedicht is, toon de inhoud
  return (
    // --- NIEUW: De Viewport Wrapper ---
    <viewport
      ref={viewportRef}
      screenWidth={width}
      screenHeight={height}
      worldWidth={width}
      worldHeight={height}
      wheel
      pinch
      decelerate
      // --- DE FIX: Geef de ticker en events door ---
      ticker={PIXI.Ticker.shared}
      events={app.renderer.events}
    >
      <pixiContainer
        ref={contentRef}
        x={textPosition.containerX}
        y={textPosition.containerY}
        scale={{ x: textPosition.scaleFactor, y: textPosition.scaleFactor }}
        eventMode="passive" // forward events to children
      >
        <pixiText
          text={currentPoem.title}
          anchor={{ x: anchorX, y: 0 }}
          y={0}
          style={titleStyle}
        />

        <pixiText
          text={currentPoem.author}
          anchor={{ x: anchorX, y: 0 }}
          y={textPosition.authorY}
          style={authorStyle}
        />

        {currentPoem.lines.map((line, index) => (
          <PoemLine
            key={index}
            lineText={line}
            yPosition={120 + index * lineHeight}
            style={lineStyle}
            anchorX={anchorX}
            isSelected={selectedLine === index}
            onSelect={() => onLineSelect(index)}
          />
        ))}
      </pixiContainer>
    </viewport>
  );
}

// Main component that manages state
export default function CanvasPage() {
  // --- Refs for viewport and content ---
  const viewportRef = useRef(null);
  const contentRef = useRef(null);

  // State for selected line and line selection handler
  const [selectedLine, setSelectedLine] = useState(null);

  // Handle line selection
  const handleLineSelect = useCallback((index) => {
    console.log(`Line ${index} selected`);
    setSelectedLine((prev) => (prev === index ? null : index));
  }, []);

  // Font size state
  const [fontSize, setFontSize] = useState(36);

  // Color and spacing states
  const [fillColor, setFillColor] = useState("#ffffff");
  const [letterSpacing, setLetterSpacing] = useState(0);

  // Use responsive canvas hook
  const layout = useResponsiveCanvas();

  // Line height state
  const [lineHeight, setLineHeight] = useState(36 * 1.4);
  const [lineHeightMultiplier, setLineHeightMultiplier] = useState(1.4);

  // Text positioning hook for debug info
  const textPosition = useResponsiveTextPosition(
    layout.canvasWidth,
    layout.canvasHeight,
    fontSize,
    lineHeight,
    [] // baseline; poem selection and exact lines are handled in CanvasContent
  );
  const [userHasAdjusted, setUserHasAdjusted] = useState(false);

  const [textAlign, setTextAlign] = useState("center");

  // --- De logica ---
  const handleFontSizeChange = (newSize) =>
    handleFontSizeChangeUtil(newSize, {
      userHasAdjusted,
      lineHeightMultiplier,
      setFontSize,
      setLineHeight,
    });

  const handleLineHeightChange = (newHeight) =>
    handleLineHeightChangeUtil(newHeight, {
      userHasAdjusted,
      setUserHasAdjusted,
      setLineHeight,
      fontSize,
      setLineHeightMultiplier,
    });

  const handleResetLineHeight = () =>
    resetLineHeightUtil({
      baseFontSize: 36,
      defaultMultiplier: 1.4,
      setLineHeight,
      setLineHeightMultiplier,
      setUserHasAdjusted,
    });

  // Verhouding-slider handler: update multiplier en afgeleide lineHeight
  const handleLineHeightMultiplierChange = (newMultiplier) => {
    if (!userHasAdjusted) setUserHasAdjusted(true);
    setLineHeightMultiplier(newMultiplier);
    setLineHeight(fontSize * newMultiplier);
  };

  return (
    <>
      <ResponsiveLayout
        layout={layout}
        controls={
          <Controls
            fontSize={fontSize}
            onFontSizeChange={handleFontSizeChange}
            fillColor={fillColor}
            onFillColorChange={setFillColor}
            letterSpacing={letterSpacing}
            onLetterSpacingChange={setLetterSpacing}
            lineHeight={lineHeight}
            onLineHeightChange={handleLineHeightChange}
            lineHeightMultiplier={lineHeightMultiplier}
            onLineHeightMultiplierChange={handleLineHeightMultiplierChange}
            onResetLineHeight={handleResetLineHeight}
            textAlign={textAlign}
            onTextAlignChange={setTextAlign}
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
              fontSize={fontSize}
              fillColor={fillColor}
              letterSpacing={letterSpacing}
              lineHeight={lineHeight}
              textAlign={textAlign}
              viewportRef={viewportRef}
              contentRef={contentRef}
              selectedLine={selectedLine}
              onLineSelect={handleLineSelect}
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
