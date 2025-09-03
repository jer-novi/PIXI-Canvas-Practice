# Responsive PIXI Canvas Layout Implementation Guide

## 📋 Project Overview

Dit document beschrijft de implementatie van een responsive PIXI.js canvas layout in React 19, met vaste controls (340px) en navigatie (120px) panelen, en een dynamisch canvas dat de resterende ruimte inneemt.

## 🎯 Doelstellingen

- **Fixed-width controls**: 340px minimum breedte, schaalt proportioneel
- **Fixed-width navigation**: 120px minimum breedte, schaalt proportioneel  
- **Dynamic canvas**: Neemt resterende ruimte in, geen horizontale scrollbars
- **Responsive design**: Werkt op verschillende schermgroottes
- **Future-ready**: Voorbereid voor collapsible panels

## 🚫 Waarom de Eerste Aanpak Faalde

### Probleem 1: Complexe Spacer Logic
```javascript
// ❌ Originele aanpak - te complex
const calculateLayout = () => {
  const MIN_SPACER = 20;
  let leftSpacer, rightSpacer;
  
  if (widthBasedHeight <= availableHeight) {
    canvasWidth = availableWidth;
    leftSpacer = rightSpacer = 0;
  } else {
    const totalSpacerWidth = availableWidth - canvasWidth;
    leftSpacer = rightSpacer = Math.max(totalSpacerWidth / 2, 0);
  }
  // Complex aspect ratio calculations...
}
```

**Waarom dit niet werkte:**
- Te veel edge cases en berekeningen
- Spacers creëerden extra complexiteit
- Aspect ratio logic conflicteerde met flexbox
- Moeilijk te debuggen en onderhouden

### Probleem 2: Canvas Sizing Issues
```javascript
// ❌ Canvas kreeg niet de juiste afmetingen
<Application width={canvasWidth} height={height} />
// Default 300x150 omdat layout object niet correct werd doorgegeven
```

### Probleem 3: Dubbele Padding
```css
/* ❌ Dubbele padding veroorzaakte overflow */
.controlsPanel {
  padding: 1rem; /* Outer container */
}
.controlsWrapper {
  padding: 1rem; /* Inner container - DUBBEL! */
}
```

## ✅ De Werkende Oplossing

### 1. Eenvoudige Layout Hook

```javascript
// ✅ Nieuwe aanpak - simpel en direct
export function useResponsiveCanvas() {
  const { width: windowWidth, height: windowHeight } = useWindowSize();
  
  const layout = useMemo(() => {
    // Vaste verhoudingen gebaseerd op 1920px baseline
    const baseControlsWidth = 340;
    const baseNavWidth = 120;
    const baseScreenWidth = 1920;

    // Bereken minimum breedtes met proportionele scaling
    const controlsWidth = controlsVisible ? 
      Math.max(baseControlsWidth, (baseControlsWidth / baseScreenWidth) * windowWidth) : 0;
    const navWidth = navVisible ? 
      Math.max(baseNavWidth, (baseNavWidth / baseScreenWidth) * windowWidth) : 0;

    // Canvas neemt resterende ruimte
    const canvasWidth = windowWidth - controlsWidth - navWidth;
    const canvasHeight = windowHeight;

    return {
      controlsWidth: Math.round(controlsWidth),
      navWidth: Math.round(navWidth),
      canvasWidth: Math.max(300, Math.round(canvasWidth)),
      canvasHeight: Math.max(200, Math.round(canvasHeight)),
      controlsVisible,
      navVisible,
      leftSpacer: 0, // Geen spacers meer!
      rightSpacer: 0
    };
  }, [windowWidth, windowHeight, controlsVisible, navVisible]);

  return { ...layout, toggleControls, toggleNav };
}
```

**Waarom dit werkt:**
- **Eenvoudig**: Directe berekening zonder complexe logic
- **Voorspelbaar**: Altijd dezelfde formule
- **Flexibel**: Makkelijk aan te passen
- **Geen spacers**: Flexbox doet het werk

### 2. Clean Component Architecture

```jsx
// ✅ ResponsiveLayout - Eenvoudige flexbox container
const ResponsiveLayout = memo(({ layout, controls, canvas, navigation }) => {
  return (
    <div className={styles.layoutContainer}>
      {/* Controls - vaste breedte */}
      {layout.controlsVisible && (
        <div 
          className={styles.controlsPanel}
          style={{ width: layout.controlsWidth }}
        >
          {controls}
        </div>
      )}

      {/* Canvas - flex: 1 neemt resterende ruimte */}
      <div 
        className={styles.canvasWrapper}
        style={{
          width: layout.canvasWidth,
          height: layout.canvasHeight,
        }}
      >
        {canvas}
      </div>

      {/* Navigation - vaste breedte */}
      {layout.navVisible && (
        <div 
          className={styles.navPanel}
          style={{ width: layout.navWidth }}
        >
          {navigation}
        </div>
      )}
    </div>
  );
});
```

### 3. CSS Strategy - Flexbox First

```css
/* ✅ Outer container - geen padding, geen border */
.controlsPanel {
  background-color: #2a3441;
  color: #cfd4db;
  padding: 0; /* Geen dubbele padding! */
  overflow-y: auto;
  box-sizing: border-box;
  flex-shrink: 0;
}

/* ✅ Inner container - alle styling hier */
.controlsWrapper {
  width: 100%; /* Niet meer fixed 340px */
  height: 100%;
  background-color: #272d37;
  color: #cfd4db;
  padding: 1rem; /* Alleen hier padding */
  overflow-y: auto;
  box-sizing: border-box;
  border-right: 1px solid #3d4a5c; /* Border aan binnenkant */
}

/* ✅ Canvas wrapper - flex: 1 */
.canvasWrapper {
  flex: 1;
  background-color: #1d2230;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 0; /* Belangrijk voor flex shrinking */
}
```

## 🔧 Stap-voor-Stap Implementatie

### Stap 1: Window Size Hook
```javascript
// useWindowSize.js - Basis voor responsive gedrag
export function useWindowSize() {
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return size;
}
```

### Stap 2: Responsive Canvas Hook
```javascript
// useResponsiveCanvas.js - Centrale layout logic
export function useResponsiveCanvas() {
  // Zie bovenstaande implementatie
}
```

### Stap 3: Layout Component
```jsx
// ResponsiveLayout.jsx - Flexbox container
const ResponsiveLayout = memo(({ layout, controls, canvas, navigation }) => {
  // Zie bovenstaande implementatie
});
```

### Stap 4: Integration in Main Component
```jsx
// CanvasPage.jsx - Alles samenbrengen
export default function CanvasPage() {
  const layout = useResponsiveCanvas(); // Layout hook

  return (
    <ResponsiveLayout
      layout={layout}
      controls={<Controls ... />}
      canvas={
        <Application
          width={layout.canvasWidth}  // ✅ Correcte afmetingen
          height={layout.canvasHeight}
          options={{ background: 0x1d2230 }}
        >
          <CanvasContent ... />
        </Application>
      }
      navigation={<Navigation />}
    />
  );
}
```

## 🎨 CSS Best Practices

### 1. Box-Sizing Strategy
```css
/* ✅ Altijd border-box voor voorspelbare sizing */
* {
  box-sizing: border-box;
}

/* ✅ Padding en borders tellen mee in width/height */
.controlsWrapper {
  width: 100%;
  padding: 1rem;
  border-right: 1px solid #3d4a5c;
  box-sizing: border-box; /* Border valt binnen width */
}
```

### 2. Flexbox Layout Patterns
```css
/* ✅ Main container - horizontal flexbox */
.layoutContainer {
  display: flex;
  width: 100vw;
  height: 100vh;
  overflow: hidden; /* Voorkom scrollbars */
}

/* ✅ Fixed width panels */
.controlsPanel,
.navPanel {
  flex-shrink: 0; /* Voorkom shrinking */
}

/* ✅ Dynamic canvas area */
.canvasWrapper {
  flex: 1; /* Neemt resterende ruimte */
  min-width: 0; /* Belangrijk voor flex shrinking */
}
```

### 3. Overflow Management
```css
/* ✅ Controls - verticale scroll toegestaan */
.controlsWrapper {
  overflow-y: auto;
  overflow-x: hidden;
}

/* ✅ Navigation - geen scroll */
.navPanel {
  overflow: hidden;
}

/* ✅ Canvas - geen scroll */
.canvasWrapper {
  overflow: hidden;
}
```

## 🐛 Veelvoorkomende Problemen & Oplossingen

### Probleem: Canvas toont 300x150
```javascript
// ❌ Verkeerd - layout niet doorgegeven
<Application width={canvasWidth} height={height} />

// ✅ Correct - layout object gebruiken
<Application width={layout.canvasWidth} height={layout.canvasHeight} />
```

### Probleem: Horizontale scrollbar
```css
/* ❌ Verkeerd - dubbele padding */
.outer { padding: 1rem; }
.inner { padding: 1rem; width: 340px; }

/* ✅ Correct - padding alleen inner */
.outer { padding: 0; width: 340px; }
.inner { padding: 1rem; width: 100%; box-sizing: border-box; }
```

### Probleem: Controls te breed
```css
/* ❌ Verkeerd - geen rekening met padding */
.controlRow input {
  width: 200px; /* Fixed width kan overflow veroorzaken */
}

/* ✅ Correct - flexible sizing */
.controlRow {
  display: flex;
  gap: 0.5rem;
  max-width: 100%;
}
.controlRow input[type="range"] {
  flex: 1;
  min-width: 0;
}
```

## 📱 Responsive Breakpoints

```javascript
// Utility voor verschillende schermgroottes
export function getResponsiveBreakpoints(windowWidth) {
  if (windowWidth < 768) {
    return {
      controlsWidth: Math.max(280, (280/1920) * windowWidth),
      navWidth: Math.max(60, (60/1920) * windowWidth),
    };
  } else if (windowWidth < 1024) {
    return {
      controlsWidth: Math.max(320, (320/1920) * windowWidth),
      navWidth: Math.max(80, (80/1920) * windowWidth),
    };
  } else {
    return {
      controlsWidth: Math.max(340, (340/1920) * windowWidth),
      navWidth: Math.max(120, (120/1920) * windowWidth),
    };
  }
}
```

## 🚀 Future Enhancements

### Collapsible Panels
```javascript
// Toggle functies al geïmplementeerd
const { layout, toggleControls, toggleNav } = useResponsiveCanvas();

// Gebruik in UI
<button onClick={toggleControls}>
  {layout.controlsVisible ? 'Hide' : 'Show'} Controls
</button>
```

### Aspect Ratio Utilities
```javascript
// aspectRatio.js - Voor toekomstige canvas aspect ratio management
export const ASPECT_RATIOS = {
  STANDARD: 4/3,
  WIDESCREEN: 16/9,
  CINEMA: 21/9,
  SQUARE: 1/1,
};

export function calculateCanvasDimensions(availableWidth, availableHeight, aspectRatio = 4/3) {
  // Implementatie voor aspect ratio constraints
}
```

## 📚 Key Learnings

### 1. **Simpliciteit wint**
- Complexe spacer logic was overengineering
- Directe flexbox approach is betrouwbaarder
- Minder code = minder bugs

### 2. **CSS Box Model begrijpen**
- `box-sizing: border-box` is essentieel
- Padding en borders tellen mee in afmetingen
- `min-width: 0` op flex items voorkomt overflow

### 3. **React Hooks Patterns**
- `useMemo` voor expensive calculations
- Custom hooks voor herbruikbare logic
- State colocation waar mogelijk

### 4. **PIXI.js Integration**
- Application component heeft expliciete width/height nodig
- Canvas sizing moet synchroon zijn met layout
- Overflow hidden op canvas wrapper voorkomt scroll

### 5. **Debugging Strategy**
- Start met simpele implementatie
- Test één component tegelijk
- Gebruik browser dev tools voor layout debugging
- Console.log layout values tijdens development

## 🎯 Conclusie

De werkende oplossing is **eenvoudiger, voorspelbaarder en onderhoudbaarder** dan de oorspronkelijke complexe aanpak. Door te focussen op:

1. **Directe berekeningen** in plaats van complexe logic
2. **Flexbox** in plaats van absolute positioning
3. **Single responsibility** per component
4. **Clear separation** tussen layout en styling

Hebben we een robuust systeem gebouwd dat makkelijk uit te breiden is voor toekomstige features zoals collapsible panels en verschillende aspect ratios.

## 🔄 Auto-Refresh Implementation (Work in Progress)

### **Probleem: Refresh Required After Scaling**
Na het schalen van het browser venster was een handmatige refresh nodig om de tekst correct te positioneren. Dit is niet acceptabel voor een moderne responsive applicatie.

### **Oplossingspoging 1: Enhanced useEffect Dependencies**
```javascript
// ❌ Eerste poging - niet volledig werkend
useEffect(() => {
  if (app && app.renderer) {
    app.renderer.resize(width, height);
    app.renderer.render(app.stage); // Force render
  }
}, [width, height, app, textPosition.containerX, textPosition.containerY, textPosition.scaleFactor]);
```

**Resultaat**: Gedeeltelijke verbetering, maar nog steeds inconsistent.

### **Oplossingspoging 2: usePixiAutoRender Hook**
```javascript
// 🔄 Moderne React 19 pattern - nog in ontwikkeling
export function usePixiAutoRender(app, dependencies = []) {
  const rafRef = useRef(null);
  const lastDepsRef = useRef(dependencies);

  useEffect(() => {
    if (!app?.renderer || !app?.stage) return;

    const depsChanged = dependencies.some((dep, index) => 
      dep !== lastDepsRef.current[index]
    );

    if (depsChanged) {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }

      rafRef.current = requestAnimationFrame(() => {
        if (app?.renderer && app?.stage) {
          app.renderer.render(app.stage);
        }
        rafRef.current = null;
      });

      lastDepsRef.current = [...dependencies];
    }

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, dependencies);

  const forceRender = () => {
    // Force immediate render implementation
  };

  return { forceRender };
}
```

**Implementatie**:
```javascript
// In CanvasContent component
usePixiAutoRender(app, [
  width, height, 
  textPosition.containerX, textPosition.containerY, textPosition.scaleFactor,
  fontSize, fillColor, letterSpacing, lineHeight
]);
```

**Status**: Geïmplementeerd maar nog niet volledig werkend. Verdere optimalisatie nodig.

### **Text Positioning Improvements**
Tijdens de auto-refresh implementatie zijn ook text positioning verbeteringen doorgevoerd:

```javascript
// useResponsiveTextPosition - Verbeterde versie
export function useResponsiveTextPosition(canvasWidth, canvasHeight, fontSize, lineHeight, poemLines = []) {
  return useMemo(() => {
    // Horizontaal centreren binnen canvas (niet viewport)
    const containerX = canvasWidth / 2;
    
    // Verticaal positioneren - hoger dan midden
    const topMargin = Math.max(60, canvasHeight * 0.15);
    const containerY = topMargin;
    
    // Scale factor alleen bij kleine schermen
    const minCanvasWidth = 400;
    const scaleFactor = canvasWidth < minCanvasWidth ? canvasWidth / minCanvasWidth : 1;
    
    return {
      containerX, containerY, authorY, poemStartY, scaleFactor,
      // Debug info voor troubleshooting
      debug: { canvasWidth, canvasHeight, topMargin, scaleFactor }
    };
  }, [canvasWidth, canvasHeight, fontSize, lineHeight, poemLines.length]);
}
```

### **Volgende Stappen**
- [ ] Onderzoek PIXI Application lifecycle hooks
- [ ] Test alternatieve render triggering methoden
- [ ] Mogelijk gebruik van PIXI Ticker voor consistent rendering
- [ ] Performance profiling van render cycles

---

*Dit document dient als referentie voor toekomstige responsive layout implementaties in React + PIXI.js projecten.*
