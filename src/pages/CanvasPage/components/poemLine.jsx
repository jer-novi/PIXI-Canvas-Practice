// src/pages/CanvasPage/components/PoemLine.jsx
import { Text } from "pixi.js";
import { extend } from "@pixi/react";

extend({ Text });

export default function PoemLine({
  lineText = "",
  yPosition = 0,
  style = {},
  anchorX = 0.5,
  isSelected = false,
  onSelect = () => {},
}) {
  // Create a new style object to avoid mutating the prop
  const currentStyle = {
    ...style,
    fill: isSelected ? "#ffcc00" : style.fill || "#ffffff",
    fontSize: style.fontSize || 16,
    fontFamily: style.fontFamily || "Arial",
  };

  return (
    <pixiText
      text={lineText}
      anchor={{ x: anchorX, y: 0 }}
      y={yPosition}
      style={currentStyle}
      eventMode="static"
      cursor="pointer"
      pointerdown={(e) => {
        console.log("Line clicked:", lineText);
        onSelect();
      }}
      onPointerTap={onSelect} // also try camelCase variant
    />
  );
}
