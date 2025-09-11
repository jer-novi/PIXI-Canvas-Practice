# Dragbar Fixes & Refactor Guide

## Probleem Analyse

De dragbar (XYMoveSliders) heeft meerdere problemen:

1. **Schokkerige beweging** - `isDragging` prop ontbreekt
2. **Grootte verandert** - Responsive CSS issues
3. **3 decimalen werken niet** - Door ontbrekende `isDragging` state
4. **Hide/show knop** - Bestaat maar heeft geen functionaliteit
5. **Positionering instabiel** - Media queries veroorzaken sprongen

## Fix 1: useCanvasState.js - Voeg isDragging state toe

**Locatie**: `src/pages/CanvasPage/hooks/useCanvasState.js`

**Voeg toe na regel 23 (na photoGridVisible state):**

```javascript
const [isDragging, setIsDragging] = useState(false); // Voor XYMoveSliders synchronisatie
```

**Voeg toe in return object na regel 124 (na photoGridVisible):**

```javascript
isDragging,
    setIsDragging,
```

## Fix 2: CanvasContent.jsx - Sync isDragging state

**Locatie**: `src/pages/CanvasPage/components/CanvasContent.jsx`

**Voeg prop toe in functie definitie (regel 18-46):**

```javascript
export function CanvasContent({
                                  // ... bestaande props
                                  isDragging,        // <-- NIEUW: Add deze prop
                                  setIsDragging,     // <-- NIEUW: Add deze prop
                              }) {
```

**Replace setIsDraggingBoth functie (regel 138-141) met:**

```javascript
const setIsDraggingBoth = useCallback((value) => {
    isDraggingRef.current = value;
    setIsDragging(value);      // <-- Local state (behoud dit)
    setIsDragging(value);      // <-- NIEUW: Global state voor XYMoveSliders
}, [setIsDragging]); // <-- NIEUW: Add dependency
```

## Fix 3: CanvasPage.jsx - Voeg isDragging prop toe

**Locatie**: `src/pages/CanvasPage/CanvasPage.jsx`

**Voeg props toe aan CanvasContent (rond regel 179-210):**

```javascript
<CanvasContent
    // ... bestaande props
    isDragging={canvasState.isDragging}           // <-- NIEUW
    setIsDragging={canvasState.setIsDragging}     // <-- NIEUW
/>
```

**Voeg prop toe aan XYMoveSliders (rond regel 217-224):**

```javascript
<XYMoveSliders
    moveMode={canvasState.moveMode}
    selectedLines={canvasState.selectedLines}
    poemOffset={canvasState.poemOffset}
    setPoemOffset={canvasState.setPoemOffset}
    lineOverrides={canvasState.lineOverrides}
    setLineOverrides={canvasState.setLineOverrides}
    isDragging={canvasState.isDragging}          // <-- NIEUW: Deze prop was er niet!
/>
```

## Fix 4: XYMoveSliders.jsx - Hide/Show functionaliteit

**Locatie**: `src/pages/CanvasPage/components/XYMoveSliders.jsx`

**Voeg state toe na de imports:**

```javascript
import React, {useCallback, useMemo, useState} from "react";
import styles from "./XYMoveSliders.module.css";
```

**Voeg state toe in component (na regel 13):**

```javascript
export default function XYMoveSliders({
                                          moveMode,
                                          selectedLines,
                                          poemOffset,
                                          setPoemOffset,
                                          lineOverrides,
                                          setLineOverrides,
                                          isDragging
                                      }) {
    const selectionCount = selectedLines.size;
    const [isVisible, setIsVisible] = useState(true); // <-- NIEUW: Hide/show state
```

**Replace hide button handler (regel 130):**

```javascript
<button
    className={styles.moveButton}
    onClick={() => setIsVisible(!isVisible)}  // <-- NIEUW: Add click handler
>
    {isVisible ? 'Hide (ctrl-h)' : 'Show (ctrl-h)'} {/* <-- NIEUW: Dynamic text */}
</button>
```

**Voeg conditional rendering toe rond hele container (regel 126):**

```javascript
return (
    <>
        {isVisible && (
            <div className={styles.xyMoveContainer}>
                {/* ... hele bestaande inhoud ... */}
            </div>
        )}
    </>
);
```

## Fix 5: XYMoveSliders.module.css - Fix responsive styling

**Locatie**: `src/pages/CanvasPage/components/XYMoveSliders.module.css`

**Replace hele .xyMoveContainer CSS (regel 3-16) met:**

```css
.xyMoveContainer {
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 320px; /* Vaste breedte - geen responsieve verandering */
    min-width: 280px; /* Minimum voor zeer kleine schermen */
    max-width: 340px; /* Maximum om groei te voorkomen */
    padding: 16px;
    background: rgba(249, 249, 249, 0.95);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(221, 221, 221, 0.8);
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    z-index: 1000;
    transition: all 0.3s ease;
}
```

**Replace media query @media (max-width: 1200px) (regel 203-208) met:**

```css
@media (max-width: 1200px) {
    .xyMoveContainer {
        right: 10px; /* Alleen positie aanpassen, niet width */
        bottom: 15px;
    }
}
```

**Replace media query @media (max-width: 768px) (regel 210-232) met:**

```css
@media (max-width: 768px) {
    .xyMoveContainer {
        bottom: 10px;
        right: 10px;
        width: 300px; /* Kleiner maar nog steeds vast */
        padding: 12px;
    }

    .sliderLabel {
        font-size: 12px;
    }

    .status {
        font-size: 11px;
    }
}
```

## Fix 6: Keyboard shortcut voor hide/show (Optioneel)

**Locatie**: `src/pages/CanvasPage/hooks/useKeyboardShortcuts.js`

**Voeg toe in keyboard event handler waar Ctrl+H wordt afgehandeld:**

```javascript
// Als je een toggleDragbar functie wilt toevoegen via props
if ((event.ctrlKey || event.metaKey) && event.key === 'h') {
    event.preventDefault();
    // Roep toggle functie aan via props
    if (toggleDragbar) toggleDragbar();
}
```

## Implementatie Volgorde

1. **Stap 1**: Fix useCanvasState.js (isDragging state)
2. **Stap 2**: Fix CanvasContent.jsx (prop toevoegen en setIsDraggingBoth updaten)
3. **Stap 3**: Fix CanvasPage.jsx (props doorgeven)
4. **Stap 4**: Fix XYMoveSliders.jsx (hide/show functionaliteit)
5. **Stap 5**: Fix CSS styling (stabiele positionering)
6. **Stap 6**: Test alle functionaliteit

## Test Scenario's

Na implementatie test:

1. **Drag smooth-ness**: Sleep poem/lines - geen schokkerige beweging
2. **Decimalen weergave**: Tijdens slepen 3 decimalen, anders 1
3. **Hide/show**: Knop werkt, dragbar verdwijnt/verschijnt
4. **Positionering**: Dragbar blijft rechts, stabiele grootte
5. **Responsief**: Werkt op verschillende schermgroottes

## Verwachte Resultaten

- ✅ Gladde drag-beweging zonder schokken
- ✅ Stabiele dragbar grootte en positie
- ✅ 3 decimalen tijdens slepen, 1 decimaal normaal
- ✅ Werkende hide/show knop
- ✅ Dragbar blijft rechts op alle schermgroottes