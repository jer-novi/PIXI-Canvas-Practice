# Drag-and-Drop Implementatie in Pixi.js + React

## Inhoudsopgave

1. [Introductie](#introductie)
2. [Waarom Drag & Drop binnen Pixi?](#waarom-drag--drop-binnen-pixi)
3. [Implementatie Stappenplan](#implementatie-stappenplan)
4. [Problemen & Oplossingen](#problemen--oplossingen)
5. [Best Practices](#best-practices)
6. [Tips voor Uitbreiding](#tips-voor-uitbreiding)
7. [Conclusie](#conclusie)

## Introductie

Dit document beschrijft de implementatie van drag-and-drop functionaliteit in een Pixi.js + React applicatie voor het manipuleren van gedichtentekst op een canvas. De implementatie maakt gebruik van moderne Pixi React v8 patronen en behandelt complexe uitdagingen zoals event delegation, state synchronisatie, en circulaire dependencies.

### Hoofdfunctionaliteiten
- Drag-and-drop alleen actief in "Line Move" en "Poem Move" modi
- Visuele cursor feedback (grab hand) bij hover
- Synchronisatie met bestaande positie sliders
- Ondersteuning voor zowel individuele regels als volledige gedichten

## Waarom Drag & Drop binnen Pixi?

### Voordelen van Pixi.js voor Canvas Interacties

**Hardware Acceleratie**: Pixi.js gebruikt WebGL voor rendering, wat veel sneller is dan HTML5 Canvas 2D API.

**Event System**: Pixi.js heeft een ingebouwd event systeem dat complexe interacties zoals nested containers, z-index, en bounds checking automatisch afhandelt.

**Performance**: Voor complexe graphics en animaties is Pixi.js geoptimaliseerd voor high-performance rendering.

### Verschillen met Direct HTML Canvas Interacties

#### HTML Canvas Benadering
```javascript
// HTML Canvas: handmatig event handling
canvas.addEventListener('mousedown', (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  // Handmatige hit testing voor elk object
  checkCollision(x, y);
});
```

#### Pixi.js Benadering
```javascript
// Pixi.js: automatische event handling per object
<pixiText 
  interactive={true}
  onPointerDown={(event) => {
    // Event bevat automatisch lokale coördinaten
    // Bounds checking gebeurt automatisch
  }}
/>
```

## Implementatie Stappenplan

### 1. Setup Pixi.js met React

**Component Extensies** (vereist voor Pixi React):
```javascript
import { extend } from '@pixi/react';
import { Container, Text, Graphics, Sprite } from 'pixi.js';
import { Viewport } from 'pixi-viewport';

extend({ Container, Text, Graphics, Sprite, Viewport });
```

**Container Hiërarchie**:
```jsx
<Application width={canvasWidth} height={canvasHeight}>
  <viewport ref={viewportRef}>
    <pixiContainer name="content">
      {/* Draggable poem lines */}
      <pixiText interactive={moveMode !== 'select'} />
    </pixiContainer>
  </viewport>
</Application>
```

### 2. Event Handling Architectuur

**Viewport-Level Event Delegation** (Gekozen Benadering):
```javascript
// CanvasContent.jsx - Centralized event handling
const handlePointerDown = useCallback((event) => {
  const { data: { global }, target } = event;
  
  if (moveMode === 'poem') {
    // Handle poem dragging
    setPoemDragging(true);
    setDragOffset({
      x: global.x - poemOffset.x,
      y: global.y - poemOffset.y
    });
  } else if (moveMode === 'line' && target?.name?.startsWith('line-')) {
    // Handle line dragging
    const lineIndex = parseInt(target.name.replace('line-', ''));
    setLineDragging({ active: true, index: lineIndex });
  }
}, [moveMode, poemOffset]);
```

**Waarom Viewport-Level?**
- **Event Stealing**: MainViewport onderschept alle pointer events
- **Consistency**: Alle drag logic op één plaats
- **Performance**: Minder event listeners

### 3. State Management & Synchronisatie

**React State voor UI Sliders**:
```javascript
const [poemOffset, setPoemOffset] = useState({ x: 0, y: 0 });
const [lineOverrides, setLineOverrides] = useState({});
```

**Synchronisatie tijdens Drag**:
```javascript
const handlePointerMove = useCallback((event) => {
  if (poemDragging) {
    const newOffset = {
      x: event.data.global.x - dragOffset.x,
      y: event.data.global.y - dragOffset.y
    };
    setPoemOffset(newOffset); // Synchroniseert automatisch met sliders
  }
}, [poemDragging, dragOffset]);
```

### 4. Cursor Feedback Implementation

**Inline Cursor Logic** (om circulaire dependencies te voorkomen):
```javascript
const updateCursor = useCallback((event) => {
  const { target } = event;
  const viewport = viewportRef.current;
  if (!viewport) return;

  let cursor = 'default';
  
  if (moveMode === 'poem' && target?.name === 'content') {
    cursor = 'grab';
  } else if (moveMode === 'line' && target?.name?.startsWith('line-')) {
    cursor = 'grab';
  }
  
  viewport.cursor = cursor;
}, [moveMode]);
```

## Problemen & Oplossingen

### 1. Maximum Call Stack Size Exceeded (Hoofdprobleem)

**Probleem**: Circulaire dependencies in useCallback hooks.

```javascript
// FOUT: Circulaire dependency
const handlePointerDown = useCallback(() => {
  // Gebruikt handlePointerMove
}, [handlePointerMove]);

const handlePointerMove = useCallback(() => {
  // Gebruikt handlePointerDown
}, [handlePointerDown]);
```

**Oplossing**: Refs voor veranderende waarden + Stable Event Handlers.

```javascript
// CORRECT: Refs voorkomen circulaire deps
const moveModeRef = useRef(moveMode);
const selectedLinesRef = useRef(selectedLines);

// Stable event handler wrapper
const handlersRef = useRef({ handlePointerDown, handlePointerMove, handlePointerUp });

useEffect(() => {
  handlersRef.current = { handlePointerDown, handlePointerMove, handlePointerUp };
}, [handlePointerDown, handlePointerMove, handlePointerUp]);

// Viewport setup with stable dependencies
useEffect(() => {
  const viewport = viewportRef.current;
  if (!viewport) return;

  const stablePointerDown = (event) => handlersRef.current.handlePointerDown(event);
  viewport.on('pointerdown', stablePointerDown);
  
  return () => viewport.off('pointerdown', stablePointerDown);
}, [viewportRef]); // Alleen viewportRef als dependency
```

### 2. Event Stealing door MainViewport

**Probleem**: Component-level event handlers werkten niet omdat viewport alle events onderschepte.

**Initiële Poging** (Werkte Niet):
```javascript
// In PoemLine component
<pixiText 
  onPointerDown={handleDrag} // Wordt nooit aangeroepen!
/>
```

**Oplossing**: Viewport-level event delegation.

```javascript
// In CanvasContent.jsx
useEffect(() => {
  const viewport = viewportRef.current;
  viewport.on('pointerdown', handlePointerDown);
  viewport.on('pointermove', handlePointerMove);
  viewport.on('pointerup', handlePointerUp);
}, []);
```

### 3. Bounds Checking Errors

**Probleem**: `TypeError: contentBounds.contains is not a function`

```javascript
// FOUT: Verkeerde Pixi API
if (contentBounds.contains(global.x, global.y)) { ... }
```

**Oplossing**: Handmatige bounds checking.

```javascript
// CORRECT: Handmatige bounds checking
const isWithinBounds = (point, bounds) => {
  return point.x >= bounds.x && 
         point.x <= bounds.x + bounds.width &&
         point.y >= bounds.y && 
         point.y <= bounds.y + bounds.height;
};
```

### 4. Coordinate System Transformaties

**Probleem**: Global vs Local coördinaten in Pixi hierarchy.

**Oplossing**: Gebruik Pixi's event.data.global voor consistente coördinaten.

```javascript
const handlePointerDown = (event) => {
  // event.data.global geeft wereldcoördinaten
  // event.data.local geeft lokale container coördinaten
  const globalPos = event.data.global;
  const localPos = event.data.getLocalPosition(targetContainer);
};
```

## Best Practices

### 1. Structuur van Drag & Drop Events

**Centrale Event Handler Pattern**:
```javascript
// Één plaats voor alle drag logic
const DragHandler = {
  handlePointerDown: (event) => { /* ... */ },
  handlePointerMove: (event) => { /* ... */ },
  handlePointerUp: (event) => { /* ... */ }
};
```

**State Management**:
```javascript
// Gebruik refs voor frequently changing values
const dragStateRef = useRef({
  isDragging: false,
  dragOffset: { x: 0, y: 0 },
  activeElement: null
});

// React state voor UI synchronisatie
const [poemOffset, setPoemOffset] = useState({ x: 0, y: 0 });
```

### 2. Performance en Rerenders

**Memo-isatie van Dure Berekeningen**:
```javascript
const contentBounds = useMemo(() => {
  return contentContainer?.getBounds() || { x: 0, y: 0, width: 0, height: 0 };
}, [contentContainer, poemLines, textStyles]);
```

**Event Handler Optimisatie**:
```javascript
// Gebruik throttling voor pointermove events
const throttledMove = useMemo(() => 
  throttle(handlePointerMove, 16), // ~60fps
  [handlePointerMove]
);
```

**Conditional Rendering**:
```javascript
// Alleen interactive maken wanneer nodig
<pixiText 
  interactive={moveMode !== 'select'}
  cursor={moveMode === 'line' ? 'grab' : 'default'}
/>
```

### 3. Error Handling

**Null Checks**:
```javascript
const handlePointerDown = (event) => {
  const viewport = viewportRef.current;
  if (!viewport || !event.data) return;
  
  // Veilige event handling
};
```

**Cleanup**:
```javascript
useEffect(() => {
  const viewport = viewportRef.current;
  if (!viewport) return;

  // Event listeners toevoegen
  viewport.on('pointerdown', handlePointerDown);
  
  // BELANGRIJK: Cleanup
  return () => {
    viewport.off('pointerdown', handlePointerDown);
  };
}, []);
```

## Tips voor Uitbreiding

### 1. Skew/Transformatie Opties

**Matrix Transformaties**:
```javascript
// Voeg skew controls toe aan UI
const applySkewTransform = (container, skewX, skewY) => {
  container.skew.set(skewX * Math.PI / 180, skewY * Math.PI / 180);
};

// In drag handler
const handleSkewDrag = (event) => {
  const skewAmount = (event.data.global.x - startPos.x) * 0.01;
  targetContainer.skew.x = skewAmount;
};
```

### 2. Keyboard Shortcuts

**Event Listener Pattern**:
```javascript
useEffect(() => {
  const handleKeyDown = (event) => {
    if (event.key === 'Escape') {
      setSelectedLines([]);
      setPoemDragging(false);
    }
    if (event.ctrlKey && event.key === 'a') {
      // Select all lines
      setSelectedLines(poemLines.map((_, index) => index));
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [poemLines]);
```

### 3. Dynamische Achtergrondmanipulatie

**Sprite Loading en Positioning**:
```javascript
const BackgroundSprite = ({ imageUrl, draggable = false }) => {
  const [sprite, setSprite] = useState(null);
  
  useEffect(() => {
    Assets.load(imageUrl).then(texture => {
      setSprite(texture);
    });
  }, [imageUrl]);

  if (draggable) {
    return (
      <pixiSprite 
        texture={sprite}
        interactive={true}
        onPointerDown={handleBackgroundDrag}
      />
    );
  }

  return <pixiSprite texture={sprite} />;
};
```

### 4. AI-Gebaseerde Letter Projectie

**Conceptueel Framework**:
```javascript
// AI-powered letter positioning
const AIProjectionSystem = {
  analyzeBuilding: async (buildingImage) => {
    // AI analysis van gebouw geometrie
    return {
      surfaces: [...],
      angles: [...],
      lightingConditions: [...]
    };
  },
  
  projectText: (text, buildingAnalysis) => {
    // Bereken optimale letter posities
    return text.split('').map(char => ({
      char,
      position: { x, y },
      rotation: angle,
      scale: scaleFactor
    }));
  }
};
```

**Machine Learning Integratie**:
```javascript
// TensorFlow.js voor real-time text fitting
import * as tf from '@tensorflow/tfjs';

const textFittingModel = await tf.loadLayersModel('/models/text-fitting.json');

const optimizeTextLayout = (textMetrics, buildingContours) => {
  const prediction = textFittingModel.predict([
    tf.tensor(textMetrics),
    tf.tensor(buildingContours)
  ]);
  
  return prediction.dataSync(); // Optimized positions
};
```

### 5. Geavanceerde Selectie Features

**Multi-Select met Shift/Ctrl**:
```javascript
const handleLineSelection = (lineIndex, event) => {
  if (event.shiftKey) {
    // Range selection
    const start = Math.min(lastSelectedIndex, lineIndex);
    const end = Math.max(lastSelectedIndex, lineIndex);
    const range = Array.from({ length: end - start + 1 }, (_, i) => start + i);
    setSelectedLines(range);
  } else if (event.ctrlKey || event.metaKey) {
    // Toggle selection
    setSelectedLines(prev => 
      prev.includes(lineIndex)
        ? prev.filter(i => i !== lineIndex)
        : [...prev, lineIndex]
    );
  } else {
    // Single selection
    setSelectedLines([lineIndex]);
  }
};
```

**Lasso Selection Tool**:
```javascript
const LassoSelection = () => {
  const [lassoPath, setLassoPath] = useState([]);
  const [isLassoActive, setIsLassoActive] = useState(false);

  const handleLassoMove = (event) => {
    if (!isLassoActive) return;
    
    setLassoPath(prev => [...prev, {
      x: 
      event.data.global.x,
      y: event.data.global.y
    }]);
  };

  const checkLassoIntersection = (elementBounds, lassoPath) => {
    // Point-in-polygon algorithm
    // Return true if element is within lasso
  };
};
```

## Conclusie

### Belangrijkste Inzichten

1. **Event Delegation is Krachtig**: Viewport-level event handling voorkomt complexiteit en performance problemen.

2. **Refs voor Circulaire Dependencies**: Gebruik refs voor frequently changing values om infinite loops te voorkomen.

3. **Pixi.js Event System**: Vertrouw op Pixi's ingebouwde event system voor bounds checking en coordinate transformaties.

4. **State Synchronisatie**: Zorg voor bidirectionele synchronisatie tussen drag operations en UI controls.

### Aanbevelingen voor Toekomstige Uitbreidingen

1. **Microservices Architectuur**: Voor complexe AI features, overweeg aparte services voor image analysis en text optimization.

2. **WebWorkers**: Voor heavy computations zoals text fitting algorithms, gebruik WebWorkers om main thread responsief te houden.

3. **Canvas Fallback**: Implementeer HTML5 Canvas fallback voor devices zonder WebGL ondersteuning.

4. **Accessibility**: Voeg keyboard navigation en screen reader support toe voor drag-and-drop functionaliteit.

5. **Testing**: Implementeer integration tests voor complex drag scenarios using tools zoals Playwright of Cypress.

### Performance Monitoring

**Key Metrics om te Volgen**:
- Frame rate tijdens drag operations
- Memory usage bij complexe text layouts  
- Event handler execution time
- Re-render frequency van React components

**Optimization Strategie√ën**:
- Implement object pooling voor frequently created/destroyed objects
- Use `useMemo` en `useCallback` strategisch
- Profile met React DevTools en browser performance tools
- Monitor Pixi.js texture memory usage

Dit document dient als complete referentie voor het implementeren en uitbreiden van drag-and-drop functionaliteit in Pixi.js + React applicaties, met speciale aandacht voor de unieke uitdagingen van canvas-based interacties.