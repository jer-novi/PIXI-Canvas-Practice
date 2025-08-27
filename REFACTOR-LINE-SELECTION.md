# PixiJS React Event Integration - Refactor Guide

This document outlines the implementation of a hybrid per-line styling system in a PixiJS React application with proper event handling using pixi-viewport and @pixi/react v8.

## ✅ Completed Implementation

### **Event Handling & Viewport Integration**
- ✅ Fixed event propagation between pixi-viewport and text elements
- ✅ Implemented viewport drag toggle (Ctrl+drag for camera, click for selection)
- ✅ Added keyboard shortcuts (Escape to clear selection, Ctrl for viewport)
- ✅ Used native PIXI event listeners for reliable event handling

### **Per-Line Styling System**
- ✅ Created `useLineStyle` hook for individual line styling
- ✅ Implemented hybrid system: global styles + per-line overrides
- ✅ Added single-line selection with yellow highlighting
- ✅ Integrated color picker with line-specific controls

### **PixiJS React v8 Compliance**
- ✅ Proper `extend()` API usage at module level
- ✅ Correct JSX component registration (`pixiText`, `pixiContainer`, etc.)
- ✅ Native PIXI event listeners instead of React event props

## Current Architecture

### **State Management**
```javascript
// Main component state
const [selectedLine, setSelectedLine] = useState(null);
const [viewportDragEnabled, setViewportDragEnabled] = useState(false);
const [lineOverrides, setLineOverrides] = useState({});
```

### **Styling Hooks**
- `useTextStyles(fontLoaded, globalStyles)` - Base styling with global parameters
- `useLineStyle(baseStyle, lineOverrides, isSelected)` - Individual line styling with overrides

## 🏗️ Architectuur Overzicht

### Huidige State Structure

```javascript
// Huidig - alleen globaal
const [fillColor, setFillColor] = useState("#ffffff");
const [fontSize, setFontSize] = useState(36);
```

### Nieuwe State Structure

```javascript
// Nieuw - hybrid systeem (simplified single-select)
const [globalStyles, setGlobalStyles] = useState({
  fillColor: "#ffffff",
  fontSize: 36, 
  letterSpacing: 0,
  lineHeight: 50.4,
  textAlign: "center",
});

const [lineOverrides, setLineOverrides] = useState({
  // lineIndex: { property: value }
  // 0: { fillColor: "#ff0000" },
  // 2: { fontSize: 42, fillColor: "#00ff00" }
});

const [selectedLine, setSelectedLine] = useState(null); // Single-select (simpeler)
const [viewportDragEnabled, setViewportDragEnabled] = useState(false); // Default uit
```

### @pixi/react v8 Correcte Syntax

```javascript
// CORRECT extend() usage
import { extend } from '@pixi/react';
import { Text, Container, Graphics } from 'pixi.js';
import { Viewport } from 'pixi-viewport';

// Extend MOET bovenaan, buiten component
extend({ Text, Container, Graphics, Viewport });

// CORRECT component names (lowercase met pixi prefix)
<pixiText />
<pixiContainer />
<pixiGraphics />
<pixiViewport />
```

## 📝 Stap-voor-Stap Implementatie

### Stap 1: State Management Refactor

#### 1.1 Update CanvasPage.jsx - State Definitie

```javascript
// In CanvasPage component, vervang huidige state met:
const [globalStyles, setGlobalStyles] = useState({
  fillColor: "#ffffff",
  fontSize: 36,
  letterSpacing: 0,
  lineHeight: 36 * 1.4,
  textAlign: "center",
});

const [lineOverrides, setLineOverrides] = useState({});
const [selectedLines, setSelectedLines] = useState(new Set());
const [lastSelectedLine, setLastSelectedLine] = useState(null);

// Helper functions
const updateGlobalStyle = (property, value) => {
  setGlobalStyles((prev) => ({ ...prev, [property]: value }));
};

const updateSelectedLinesStyle = (property, value) => {
  setLineOverrides((prev) => {
    const newOverrides = { ...prev };
    selectedLines.forEach((lineIndex) => {
      newOverrides[lineIndex] = {
        ...newOverrides[lineIndex],
        [property]: value,
      };
    });
    return newOverrides;
  });
};

const clearLineOverride = (lineIndex, property) => {
  setLineOverrides((prev) => {
    const newOverrides = { ...prev };
    if (newOverrides[lineIndex]) {
      delete newOverrides[lineIndex][property];
      if (Object.keys(newOverrides[lineIndex]).length === 0) {
        delete newOverrides[lineIndex];
      }
    }
    return newOverrides;
  });
};
```

#### 1.2 Line Selection Logic (Simplified Single-Select)

```javascript
const handleLineSelect = useCallback((index) => {
  console.log(`Line ${index} selected`);
  // Toggle selection - click same line to deselect
  setSelectedLine(prev => prev === index ? null : index);
}, []);

// Viewport control logic
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
```

### Stap 2: Style Computation Hook

#### 2.1 Nieuwe useLineStyles Hook

Maak nieuw bestand: `src/pages/CanvasPage/hooks/useLineStyles.js`

```javascript
import { useMemo } from "react";
import * as PIXI from "pixi.js";

export function useLineStyles({
  fontLoaded,
  globalStyles,
  lineOverrides,
  poemLines = [],
}) {
  const fontFamily = "Cormorant Garamond";

  return useMemo(() => {
    if (!fontLoaded) {
      // Fallback styles
      return {
        titleStyle: new PIXI.TextStyle({
          fontFamily: "Arial",
          fontSize: 36,
          fill: "white",
        }),
        authorStyle: new PIXI.TextStyle({
          fontFamily: "Arial",
          fontSize: 20,
          fill: "#cccccc",
        }),
        lineStyles: poemLines.map(
          () =>
            new PIXI.TextStyle({
              fontFamily: "Arial",
              fontSize: 24,
              fill: "white",
            })
        ),
      };
    }

    const baseStyle = {
      fontFamily,
      align: globalStyles.textAlign,
      letterSpacing: globalStyles.letterSpacing,
      wordWrap: true,
      wordWrapWidth: 1000,
    };

    // Compute individual line styles
    const lineStyles = poemLines.map((_, index) => {
      const override = lineOverrides[index] || {};

      return new PIXI.TextStyle({
        ...baseStyle,
        fill: override.fillColor || globalStyles.fillColor,
        fontSize: override.fontSize || globalStyles.fontSize,
        lineHeight: override.lineHeight || globalStyles.lineHeight,
        letterSpacing:
          override.letterSpacing !== undefined
            ? override.letterSpacing
            : globalStyles.letterSpacing,
      });
    });

    return {
      titleStyle: new PIXI.TextStyle({
        ...baseStyle,
        fill: globalStyles.fillColor,
        fontSize: globalStyles.fontSize * 1.5,
        fontWeight: "bold",
      }),
      authorStyle: new PIXI.TextStyle({
        ...baseStyle,
        fill: "#cccccc",
        fontSize: globalStyles.fontSize * 0.75,
        fontStyle: "italic",
      }),
      lineStyles,
    };
  }, [fontLoaded, globalStyles, lineOverrides, poemLines]);
}
```

### Stap 3: Correct @pixi/react v8 Implementation

#### 3.1 Fix extend() API Usage

Update `CanvasPage.jsx` top imports:

```javascript
import { extend, Application } from '@pixi/react';
import { Text, Container, Graphics } from 'pixi.js';
import { Viewport } from 'pixi-viewport';

// CRITICAL: extend() MUST be called outside component, at module level
extend({ Text, Container, Graphics, Viewport });
```

#### 3.2 Correct Event Handling Pattern

```javascript
// WRONG (current code):
<pixiText 
  pointerdown={(e) => console.log('clicked')}
  onclick={(e) => console.log('clicked')}
/>

// CORRECT (@pixi/react v8):
<pixiText 
  ref={(textElement) => {
    if (textElement) {
      textElement.removeAllListeners();
      textElement.on('pointerdown', (e) => {
        console.log('Line clicked:', lineText);
        onSelect();
      });
    }
  }}
/>
```

#### 3.3 Viewport Integration with Event Control

```javascript
// Conditional viewport plugins based on state
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
```

### Stap 4: Controls Component Update (Simplified)

#### 4.1 Single-Line Selection Interface

Update `Controls.jsx`:

```javascript
export default function Controls({
  globalStyles,
  onGlobalStyleChange,
  selectedLine,
  onSelectedLineStyleChange,
  onClearLineOverride,
  viewportDragEnabled,
  onViewportToggle,
  // ... andere props
}) {
  const hasSelection = selectedLine !== null;
  const selectionText = hasSelection ? `regel ${selectedLine + 1}` : null;

  return (
    <div className={styles.controlsWrapper}>
      <h2>Styling Controls</h2>

      {/* Selection Info */}
      {hasSelection && (
        <div className={styles.selectionInfo}>
          <span>Geselecteerd: {selectionText}</span>
          <button
            onClick={() => onClearLineOverrides(Array.from(selectedLines))}
            className={styles.clearButton}
          >
            Reset naar globaal
          </button>
        </div>
      )}

      {/* Mode Toggle */}
      <div className={styles.modeToggle}>
        <label>
          <input
            type="radio"
            name="styleMode"
            value="global"
            checked={!hasSelection}
            readOnly
          />
          Globaal (hele gedicht)
        </label>
        <label>
          <input
            type="radio"
            name="styleMode"
            value="selection"
            checked={hasSelection}
            readOnly
          />
          Selectie ({selectionText})
        </label>
      </div>

      {/* Color Control */}
      <div className={styles.controlRow}>
        <label htmlFor="fillColor">
          Kleur {hasSelection ? `(${selectionText})` : "(globaal)"}
        </label>
        <input
          type="color"
          id="fillColor"
          value={hasSelection ? getSelectionColor() : globalStyles.fillColor}
          onChange={(e) => {
            if (hasSelection) {
              onSelectedLinesStyleChange("fillColor", e.target.value);
            } else {
              onGlobalStyleChange("fillColor", e.target.value);
            }
          }}
        />
      </div>

      {/* Font Size Control */}
      <div className={styles.controlRow}>
        <label htmlFor="fontSize">
          Lettergrootte {hasSelection ? `(${selectionText})` : "(globaal)"}
        </label>
        <input
          type="range"
          id="fontSize"
          min="12"
          max="72"
          value={hasSelection ? getSelectionFontSize() : globalStyles.fontSize}
          onChange={(e) => {
            const value = Number(e.target.value);
            if (hasSelection) {
              onSelectedLinesStyleChange("fontSize", value);
            } else {
              onGlobalStyleChange("fontSize", value);
            }
          }}
        />
        <span>
          {hasSelection ? getSelectionFontSize() : globalStyles.fontSize}px
        </span>
      </div>

      {/* Viewport Control Toggle */}
      <div className={styles.controlRow}>
        <label>Camera Control</label>
        <div className={styles.buttonGroup}>
          <button
            className={viewportDragEnabled ? styles.active : ''}
            onClick={() => onViewportToggle(true)}
          >
            Enabled (Ctrl+Drag)
          </button>
          <button
            className={!viewportDragEnabled ? styles.active : ''}
            onClick={() => onViewportToggle(false)}
          >
            Disabled (Line Select)
          </button>
        </div>
        <small>Hold Ctrl to temporarily enable camera dragging</small>
      </div>

      {/* Color Control - Simplified */}
      <div className={styles.controlRow}>
        <label htmlFor="fillColor">
          Kleur {hasSelection ? `(${selectionText})` : "(globaal)"}
        </label>
        <input
          type="color"
          id="fillColor"
          value={hasSelection ? getLineOverrideValue('fillColor') : globalStyles.fillColor}
          onChange={(e) => {
            if (hasSelection) {
              onSelectedLineStyleChange("fillColor", e.target.value);
            } else {
              onGlobalStyleChange("fillColor", e.target.value);
            }
          }}
        />
      </div>

      {/* Font Size Control - Simplified */}
      <div className={styles.controlRow}>
        <label htmlFor="fontSize">
          Lettergrootte {hasSelection ? `(${selectionText})` : "(globaal)"}
        </label>
        <input
          type="range"
          id="fontSize"
          min="12"
          max="72"
          value={hasSelection ? getLineOverrideValue('fontSize') : globalStyles.fontSize}
          onChange={(e) => {
            const value = Number(e.target.value);
            if (hasSelection) {
              onSelectedLineStyleChange("fontSize", value);
            } else {
              onGlobalStyleChange("fontSize", value);
            }
          }}
        />
        <span>
          {hasSelection ? getLineOverrideValue('fontSize') : globalStyles.fontSize}px
        </span>
      </div>
    </div>
  );

  // Helper function for getting line override values
  function getLineOverrideValue(property) {
    // Return override value or fall back to global
    return lineOverrides[selectedLine]?.[property] || globalStyles[property];
  }
}
```

### Stap 5: Component Updates

#### 5.1 Update CanvasContent with Correct Syntax

```javascript
// CRITICAL: Add extend() at top of file, outside component
import { extend, Application } from '@pixi/react';
import { Text, Container, Graphics } from 'pixi.js';
import { Viewport } from 'pixi-viewport';

extend({ Text, Container, Graphics, Viewport });

function CanvasContent({
  canvasWidth,
  canvasHeight,
  poemId,
  globalStyles,
  lineOverrides,
  viewportRef,
  contentRef,
  selectedLine,
  onLineSelect,
  viewportDragEnabled,
}) {
  // ... existing hooks ...

  const { titleStyle, authorStyle, lineStyles } = useLineStyles({
    fontLoaded,
    globalStyles,
    lineOverrides,
    poemLines: currentPoem?.lines || [],
  });

  // Viewport plugin control
  useEffect(() => {
    if (viewportRef.current) {
      const viewport = viewportRef.current;
      
      if (viewportDragEnabled) {
        viewport.drag().pinch().wheel().decelerate();
      } else {
        viewport.plugins.remove('drag');
        viewport.plugins.remove('pinch');
        viewport.plugins.remove('wheel');
        viewport.plugins.remove('decelerate');
      }
    }
  }, [viewportDragEnabled]);

  return (
    <pixiViewport
      ref={viewportRef}
      screenWidth={canvasWidth}
      screenHeight={canvasHeight}
      worldWidth={canvasWidth}
      worldHeight={canvasHeight}
      events={app.renderer.events}
    >
      <pixiContainer
        ref={contentRef}
        x={textPosition.containerX}
        y={textPosition.containerY}
        scale={{ x: textPosition.scaleFactor, y: textPosition.scaleFactor }}
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
            yPosition={textPosition.poemStartY + index * globalStyles.lineHeight}
            style={lineStyles[index]}
            anchorX={anchorX}
            isSelected={selectedLine === index}
            onSelect={() => onLineSelect(index)}
          />
        ))}
      </pixiContainer>
    </pixiViewport>
  );
}
```

#### 4.2 Update PoemLine Component

```javascript
export default function PoemLine({
  lineText = "",
  yPosition = 0,
  style = {},
  anchorX = 0.5,
  isSelected = false,
  onSelect = () => {},
}) {
  const currentStyle = useMemo(() => {
    if (isSelected) {
      const selectedStyle = style.clone();
      selectedStyle.fill = "#ffcc00"; // Selection highlight
      selectedStyle.fontWeight = "bold";
      return selectedStyle;
    }
    return style;
  }, [isSelected, style]);

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
        onSelect(e); // Pass event for shift/ctrl detection
      }}
    />
  );
}
```

### Stap 5: Advanced Features

#### 5.1 Bulk Operations

```javascript
// In CanvasPage component
const applyStyleToAllLines = (property, value) => {
  setLineOverrides((prev) => {
    const newOverrides = { ...prev };
    currentPoem?.lines.forEach((_, index) => {
      newOverrides[index] = {
        ...newOverrides[index],
        [property]: value,
      };
    });
    return newOverrides;
  });
};

const resetAllLinesToGlobal = () => {
  setLineOverrides({});
  setSelectedLines(new Set());
};
```

#### 5.2 Keyboard Shortcuts

```javascript
useEffect(() => {
  const handleKeyDown = (event) => {
    if (event.key === "Escape") {
      setSelectedLines(new Set());
    }
    if (event.ctrlKey && event.key === "a") {
      event.preventDefault();
      // Select all lines
      const allLines = new Set(
        Array.from({ length: currentPoem?.lines.length || 0 }, (_, i) => i)
      );
      setSelectedLines(allLines);
    }
  };

  window.addEventListener("keydown", handleKeyDown);
  return () => window.removeEventListener("keydown", handleKeyDown);
}, [currentPoem?.lines.length]);
```

## 🎨 UI/UX Enhancements

### Visual Selection Indicators

```css
/* In CanvasPage.module.css */
.selectionInfo {
  background: rgba(255, 204, 0, 0.1);
  border: 1px solid #ffcc00;
  padding: 8px;
  border-radius: 4px;
  margin-bottom: 16px;
}

.modeToggle {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}

.clearButton {
  background: #ff6b6b;
  color: white;
  border: none;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}
```

## 🧪 Testing Strategy

### 1. Unit Tests

- Test state management functions
- Test style computation logic
- Test selection logic

### 2. Integration Tests

- Test multi-line selection
- Test style application
- Test global vs individual styling

### 3. Manual Testing Checklist

- [ ] Single line selection works
- [ ] Shift+click range selection works
- [ ] Ctrl+click multi-select works
- [ ] Color changes apply to selection only
- [ ] Global changes affect unmodified lines
- [ ] Reset functionality works
- [ ] Keyboard shortcuts work

## 🚀 Migration Path

### Phase 1: Core Infrastructure

1. Implement new state structure
2. Create useLineStyles hook
3. Update basic selection logic

### Phase 2: Enhanced Controls

1. Update Controls component
2. Add selection indicators
3. Implement bulk operations

### Phase 3: Advanced Features

1. Add keyboard shortcuts
2. Implement copy/paste styles
3. Add undo/redo functionality

## 📚 Additional Considerations

### Performance

- Use `useMemo` for style computations
- Consider virtualization for large poems
- Debounce rapid style changes

### Accessibility

- Add ARIA labels for selection state
- Keyboard navigation support
- Screen reader announcements

### Future Extensions

- Style presets/themes
- Import/export styling
- Animation transitions
- More style properties (shadows, borders, etc.)

## 🔧 Troubleshooting

### Common Issues

1. **Styles not updating**: Check dependency arrays in useMemo
2. **Selection not working**: Verify event handling in PoemLine
3. **Performance issues**: Profile style computation frequency

### Debug Tools

```javascript
// Add to CanvasPage for debugging
useEffect(() => {
  console.log("Selected lines:", Array.from(selectedLines));
  console.log("Line overrides:", lineOverrides);
}, [selectedLines, lineOverrides]);
```

---

Dit refactor document geeft je een complete roadmap voor het implementeren van het hybrid per-line styling systeem. Begin met Phase 1 en werk stap voor stap door de implementatie heen.
