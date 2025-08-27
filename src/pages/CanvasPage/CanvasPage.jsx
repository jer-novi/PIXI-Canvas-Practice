import { poems, getPoemById } from "../../data/testdata";
import PoemLine from "./components/poemLine";
import { Application, extend, useApplication } from "@pixi/react";
import { Text, Container, Graphics } from "pixi.js";
import { Viewport } from "pixi-viewport";
import { useSearchParams } from "react-router-dom";
import {
  useState,
  useLayoutEffect,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import * as PIXI from "pixi.js";

// CRITICAL: extend() MUST be called at module level, outside components
extend({ Text, Container, Graphics, Viewport });

import Controls from "./Controls";
import { useFontLoader } from "../../hooks/useFontLoader";
import { useTextStyles } from "./hooks/useTextStyles";
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
  viewportDragEnabled,
  lineOverrides,
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
      width,     // Canvas width changes require X recentering
      height,    // Canvas height changes also trigger resize and require X recentering
      poemId,    // New content needs X recentering  
      textAlign, // Text alignment changes need X recentering (MAIN LEARNING FOCUS)
    ], // Only X positioning triggers - Y handled by useResponsiveTextPosition
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

  // Viewport plugin control
  useEffect(() => {
    if (viewportRef.current) {
      const viewport = viewportRef.current;
      
      if (viewportDragEnabled) {
        // Enable viewport controls
        viewport.drag().pinch().wheel().decelerate();
      } else {
        // Disable viewport controls for line selection
        viewport.plugins.remove('drag');
        viewport.plugins.remove('pinch');
        viewport.plugins.remove('wheel');
        viewport.plugins.remove('decelerate');
      }
    }
  }, [viewportDragEnabled]);

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

  // Use the updated useTextStyles hook with global styles
  const globalStyles = {
    fillColor,
    fontSize,
    letterSpacing,
    lineHeight,
    textAlign,
  };
  
  const { titleStyle, authorStyle, lineStyle } = useTextStyles(fontLoaded, globalStyles);

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
        eventMode="passive" // forward events to children
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
            isSelected={selectedLine === index}
            onSelect={() => onLineSelect(index)}
            anchorX={anchorX}
          />
        ))}
      </pixiContainer>
    </pixiViewport>
  );
}

// Main component that manages state
export default function CanvasPage() {
  // --- Refs for viewport and content ---
  const viewportRef = useRef(null);
  const contentRef = useRef(null);

  // State for selected line and line selection handler
  const [selectedLine, setSelectedLine] = useState(null);
  const [viewportDragEnabled, setViewportDragEnabled] = useState(false); // Default disabled
  
  // State for per-line styling overrides
  const [lineOverrides, setLineOverrides] = useState({});

  // Handle line selection
  const handleLineSelect = useCallback((index) => {
    console.log(`Line ${index} selected`);
    setSelectedLine((prev) => (prev === index ? null : index));
  }, []);

  // Handle line color change for selected line
  const handleLineColorChange = useCallback((color) => {
    if (selectedLine !== null) {
      setLineOverrides(prev => ({
        ...prev,
        [selectedLine]: {
          ...prev[selectedLine],
          fillColor: color
        }
      }));
    }
  }, [selectedLine]);

  // Reset individual line style for selected line
  const handleResetSelectedLine = useCallback(() => {
    if (selectedLine !== null) {
      setLineOverrides(prev => {
        const next = { ...prev };
        delete next[selectedLine];
        return next;
      });
    }
  }, [selectedLine]);

  // Viewport control
  const handleViewportToggle = useCallback((enabled) => {
    setViewportDragEnabled(enabled);
    console.log(`Viewport dragging: ${enabled ? 'enabled' : 'disabled'}`);
  }, []);

  // Keyboard shortcuts for viewport control
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setSelectedLine(null); // Clear selection
      }
      if (event.ctrlKey && !viewportDragEnabled) {
        setViewportDragEnabled(true); // Enable viewport on Ctrl hold
      }
    };

    const handleKeyUp = (event) => {
      if (!event.ctrlKey && viewportDragEnabled) {
        setViewportDragEnabled(false); // Disable viewport on Ctrl release
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [viewportDragEnabled]);

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
            selectedLine={selectedLine}
            onLineColorChange={handleLineColorChange}
            onResetSelectedLine={handleResetSelectedLine}
            viewportDragEnabled={viewportDragEnabled}
            onViewportToggle={handleViewportToggle}
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
              viewportDragEnabled={viewportDragEnabled}
              lineOverrides={lineOverrides}
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
