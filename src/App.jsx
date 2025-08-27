import { Application, extend } from "@pixi/react";
import { Viewport } from "pixi-viewport"; // <-- NIEUW: Importeer Viewport
import { Container, Graphics, Sprite, Text } from "pixi.js"; // add Text here
import { TextDemo } from "./TextDemo";
import CanvasPage from "./pages/CanvasPage/CanvasPage.jsx";
import { useEffect, useState } from "react";

// extend tells @pixi/react what Pixi.js components are available
extend({
  Container,
  Graphics,
  Sprite,
  Text,
  Viewport,
});

export default function App() {
  const [fontMode, setFontMode] = useState("serif");

  useEffect(() => {
    document.body.classList.remove("font-serif", "font-sans");
    document.body.classList.add(
      fontMode === "serif" ? "font-serif" : "font-sans"
    );
  }, [fontMode]);
  return <CanvasPage />;
}
