// src/pages/CanvasPage/components/PoemLine.jsx
import React, { useRef, useEffect } from 'react';
import { useLineStyle } from '../hooks/useTextStyles';

const PoemLine = ({ 
  line, 
  x, 
  y, 
  baseStyle, 
  lineOverrides,
  isSelected, 
  onSelect,
  anchorX = 0.5
}) => {
  const textRef = useRef();
  
  // Use the new useLineStyle hook to compute the final style
  const computedStyle = useLineStyle(baseStyle, lineOverrides, isSelected);

  useEffect(() => {
    const textElement = textRef.current;
    if (!textElement) return;

    // Add native PIXI event listeners
    const handlePointerDown = (event) => {
      event.stopPropagation();
      if (onSelect) {
        onSelect(event);
      }
    };

    const handlePointerOver = () => {
      textElement.cursor = 'pointer';
    };

    // Set up event handling
    textElement.eventMode = 'static';
    textElement.interactive = true;
    textElement.buttonMode = true;
    
    // Add event listeners
    textElement.on('pointerdown', handlePointerDown);
    textElement.on('pointerover', handlePointerOver);

    // Cleanup
    return () => {
      if (textElement) {
        textElement.off('pointerdown', handlePointerDown);
        textElement.off('pointerover', handlePointerOver);
      }
    };
  }, [onSelect]);

  return (
    <pixiContainer 
      x={x} 
      y={y}
      eventMode="passive"
      interactiveChildren={true}
    >
      <pixiText
        ref={textRef}
        text={line}
        style={computedStyle}
        anchor={{ x: anchorX, y: 0 }}
      />
    </pixiContainer>
  );
};

export default PoemLine;
