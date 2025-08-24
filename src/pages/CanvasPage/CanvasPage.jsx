import { useRef } from "react"; // Zorg dat useRef geïmporteerd is
import { Application } from "@pixi/react"; // Stap 1: De Component uit @pixi/react
import { Text, Container } from "pixi.js"; // Stap 2: De Classes uit pixi.js
import { useSearchParams } from "react-router-dom";
import { useState, useEffect, useLayoutEffect } from "react";
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

// Mock data voor en gedicht
const mockPoem = {
  id: 123,
  title: "De Sterrenhemel",
  author: "H. Marsman",
  lines: [
    "De zee, de zee, de zee,",
    "altijd de zee.",
    "Zij is de spiegel van mijn ziel,",
    "de bron van mijn bestaan.",
  ],
};

// Hooks zijn nu geïmporteerd uit aparte bestanden

function CanvasContent({
  canvasWidth,
  canvasHeight,
  fontSize,
  fillColor,
  letterSpacing,
  lineHeight,
}) {
  const width = canvasWidth;
  const height = canvasHeight;
  const [searchParams] = useSearchParams();
  const poemId = searchParams.get("poemId");
  // --- DE FIX ---
  const { app } = useApplication(); // useApp() -> useApplication() returns { app }

  // --- Gebruik de font loader hook ---
  const fontLoaded = useFontLoader("Cormorant Garamond");

  // --- NIEUW: Refs voor de viewport en de content ---
  const viewportRef = useRef(null);
  const contentRef = useRef(null);

  // We gebruiken nu het 'poemId' om te bepalen welke data we tonen.
  const currentPoem = poemId ? mockPoem : null;

  // Responsive text positioning
  const textPosition = useResponsiveTextPosition(
    width,
    height,
    fontSize,
    lineHeight,
    currentPoem?.lines || []
  );

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
    ], // Alle variabelen die de positie/grootte beïnvloeden
  });

  // In een echte app zou je hier een API-call doen.
  const titleStyle = new PIXI.TextStyle({
    fill: fillColor,
    fontSize: fontSize * 1.5,
    fontFamily: "Cormorant Garamond",
    fontWeight: "bold",
    letterSpacing: letterSpacing,
  });

  const authorStyle = new PIXI.TextStyle({
    fill: "#cccccc",
    fontSize: fontSize * 0.75,
    fontFamily: "Cormorant Garamond",
    fontStyle: "italic",
  });

  const lineStyle = new PIXI.TextStyle({
    fill: fillColor,
    fontSize: fontSize,
    fontFamily: "Cormorant Garamond",
    lineHeight: lineHeight,
    letterSpacing: letterSpacing,
  });

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
      ticker={app.ticker}
      events={app.renderer?.events}
    >
      <pixiContainer
        ref={contentRef}
        x={textPosition.containerX}
        y={textPosition.containerY}
        scale={{ x: textPosition.scaleFactor, y: textPosition.scaleFactor }}
      >
        <pixiText
          text={currentPoem.title}
          anchor={{ x: 0.5, y: 0 }}
          y={0}
          style={titleStyle}
        />

        <pixiText
          text={currentPoem.author}
          anchor={{ x: 0.5, y: 0 }}
          y={textPosition.authorY}
          style={authorStyle}
        />

        {currentPoem.lines.map((line, index) => (
          <pixiText
            key={index}
            text={line}
            anchor={{ x: 0.5, y: 0 }}
            y={textPosition.poemStartY + index * lineHeight}
            style={lineStyle}
          />
        ))}
      </pixiContainer>
    </viewport>
  );
}

// Dit is de hoofd-export, die de state beheert
export default function CanvasPage() {
  // De state voor de lettergrootte --- (EERST definiëren)
  const [fontSize, setFontSize] = useState(36);

  // We slaan de kleur op als een hex-string, omdat dat het standaardformaat is voor een <input type="color">
  const [fillColor, setFillColor] = useState("#ffffff");

  const [letterSpacing, setLetterSpacing] = useState(0);

  // Use responsive canvas hook instead of manual calculations
  const layout = useResponsiveCanvas();

  // --- De slimme lineHeight state ---
  const [lineHeight, setLineHeight] = useState(36 * 1.4); // Beginwaarde
  const [lineHeightMultiplier, setLineHeightMultiplier] = useState(1.4);
  const [userHasAdjusted, setUserHasAdjusted] = useState(false);

  // --- De logica ---
  const handleFontSizeChange = (newSize) => {
    setFontSize(newSize);
    // Als de gebruiker de lineHeight nog niet handmatig heeft aangepast,
    // schalen we de lineHeight automatisch mee.
    if (!userHasAdjusted) {
      setLineHeight(newSize * lineHeightMultiplier);
    }
  };

  const handleLineHeightChange = (newHeight) => {
    // Zodra de gebruiker de slider aanraakt, zetten we de 'flag'.
    if (!userHasAdjusted) {
      setUserHasAdjusted(true);
    }
    setLineHeight(newHeight);
    // We berekenen en onthouden de nieuwe, door de gebruiker gekozen verhouding.
    setLineHeightMultiplier(newHeight / fontSize);
  };

  return (
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
          />
        </Application>
      }
      navigation={<Navigation />}
    />
  );
}
