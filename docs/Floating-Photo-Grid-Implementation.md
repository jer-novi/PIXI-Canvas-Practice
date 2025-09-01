# Floating Photo Grid Implementatie

**Datum:** 01-09-2025  
**Auteur:** Claude Code  
**Versie:** 1.0  

## Overzicht

Dit document beschrijft hoe de **Floating Photo Grid** is geïmplementeerd, waarom deze design keuzes zijn gemaakt, en hoe je dit zelf kunt implementeren in een React applicatie.

## Probleem & Oplossing

### Het Probleem
- De foto grid in het controls panel nam veel ruimte in beslag
- Dropdowns werkten niet door `setCurrentQuery` en `API_URL` errors
- UX was niet optimaal - gebruikers moesten scrollen door een lange lijst controls

### De Oplossing
- **Floating Photo Grid**: Een overlay die boven de canvas zweeft
- **Compacte Controls**: Alleen een hoofdknop + dropdowns in het panel
- **Error Fixes**: Ontbrekende state variabelen toegevoegd

## Technische Implementatie

### 1. Error Fixes in usePexels.js

**Probleem:**
```javascript
// ❌ Deze variabelen waren niet gedefinieerd
setCurrentQuery(query); // ReferenceError: setCurrentQuery is not defined  
const initialUrl = `${API_URL}?query=...`; // ReferenceError: API_URL is not defined
```

**Oplossing:**
```javascript
// ✅ State variabele toegevoegd
export function usePexels() {
  const [currentQuery, setCurrentQuery] = useState(""); // Nieuwe state

  // ✅ Juiste URL constant gebruikt
  const searchPhotos = useCallback(async (query) => {
    setCurrentQuery(query);
    const initialUrl = `${SEARCH_URL}?query=${encodeURIComponent(query)}...`; // Correct
    fetchPexelsData(initialUrl);
  }, [fetchPexelsData]);

  return {
    // ✅ State exporteren
    currentQuery, // Toegevoegd aan export
    // ... andere exports
  };
}
```

### 2. Floating Photo Grid Component

**Bestand:** `src/pages/CanvasPage/components/FloatingPhotoGrid.jsx`

```javascript
import React, { useState, useEffect } from "react";

export default function FloatingPhotoGrid({
  photos, isLoading, error, currentQuery,
  onSetBackground, onClose, onNextPage, onPrevPage,
  hasNextPage, hasPrevPage
}) {
  const [isVisible, setIsVisible] = useState(false);

  // Animatie in bij mount
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    // Wacht op animatie voor het sluiten
    setTimeout(onClose, 300);
  };

  return (
    <div className={`${styles.photoGridOverlay} ${isVisible ? styles.fadeIn : styles.fadeOut}`}>
      <div className={`${styles.floatingPhotoGrid} ${isVisible ? styles.slideIn : styles.slideOut}`}>
        {/* Header met sluitknop */}
        <div className={styles.floatingGridHeader}>
          <h3>{currentQuery ? `Resultaten voor "${currentQuery}"` : "Achtergronden"}</h3>
          <button onClick={handleClose}>✕</button>
        </div>

        {/* Foto grid */}
        <div className={styles.floatingPhotoGridContent}>
          {photos.map((photo) => (
            <div
              key={photo.id}
              onClick={() => {
                onSetBackground(photo.src.large2x);
                handleClose(); // Sluit na selectie
              }}
            >
              <img src={photo.src.tiny} alt={photo.alt} />
            </div>
          ))}
        </div>

        {/* Paginering */}
        {photos.length > 0 && (
          <div className={styles.floatingPaginationControls}>
            <button onClick={onPrevPage} disabled={!hasPrevPage}>← Vorige</button>
            <button onClick={onNextPage} disabled={!hasNextPage}>Volgende →</button>
          </div>
        )}
      </div>
    </div>
  );
}
```

### 3. CSS Animaties & Styling

**Key Classes toegevoegd aan `CanvasPage.module.css`:**

```css
/* Overlay met backdrop */
.photoGridOverlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.photoGridOverlay.fadeIn { opacity: 1; }
.photoGridOverlay.fadeOut { opacity: 0; }

/* Floating container */
.floatingPhotoGrid {
  background-color: #2d3748;
  border-radius: 12px;
  padding: 1.5rem;
  max-width: 90vw;
  max-height: 80vh;
  width: 600px;
  transform: scale(0.9) translateY(20px);
  transition: all 0.3s ease;
}

.floatingPhotoGrid.slideIn {
  transform: scale(1) translateY(0);
}

/* Hoofdknop styling */
.chooseBackgroundButton {
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, #4a5568 0%, #5a6a7d 100%);
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.2s ease;
}

.chooseBackgroundButton:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}
```

### 4. State Management 

**In `useCanvasState.js`:**
```javascript
// UI State sectie
const [photoGridVisible, setPhotoGridVisible] = useState(false);

// Export in return statement  
return {
  // ... andere state
  photoGridVisible,
  setPhotoGridVisible,
};
```

**In `useCanvasHandlers.js`:**
```javascript
// Destructure nieuwe functies
const { 
  getCollectionPhotos, // van usePexels
  setPhotoGridVisible,  // van useCanvasState
} = canvasState;

// Nieuwe handlers
const handleResetToCollection = useCallback(() => {
  getCollectionPhotos();
}, [getCollectionPhotos]);

const handleOpenPhotoGrid = useCallback(() => {
  setPhotoGridVisible(true);
}, [setPhotoGridVisible]);

// Export handlers
return {
  // ... andere handlers
  handleResetToCollection,
  handleOpenPhotoGrid,
};
```

### 5. Component Integratie

**In `CanvasPage.jsx`:**
```javascript
import FloatingPhotoGrid from "./components/FloatingPhotoGrid";

export default function CanvasPage() {
  return (
    <>
      <ResponsiveLayout 
        controls={
          <Controls
            // Nieuwe props toegevoegd
            onResetToCollection={handlers.handleResetToCollection}
            onOpenPhotoGrid={handlers.handleOpenPhotoGrid}
            // ... andere props
          />
        }
        // ... andere props
      />

      {/* Floating Photo Grid */}
      {canvasState.photoGridVisible && (
        <FloatingPhotoGrid
          photos={canvasState.photos}
          currentQuery={canvasState.currentQuery}
          onSetBackground={handlers.handleSetBackground}
          onClose={() => canvasState.setPhotoGridVisible(false)}
          // ... andere props
        />
      )}
    </>
  );
}
```

## React Syntax Uitleg

### 1. useState Hook
```javascript
const [photoGridVisible, setPhotoGridVisible] = useState(false);
//     [waarde,           setter functie    ] = useState(initial waarde)
```

### 2. useCallback Hook  
```javascript
const handleOpenPhotoGrid = useCallback(() => {
  setPhotoGridVisible(true);
}, [setPhotoGridVisible]);
//  [dependency array] - hook draait alleen opnieuw als deze waarden veranderen
```

### 3. useEffect met Cleanup
```javascript
useEffect(() => {
  const timer = setTimeout(() => setIsVisible(true), 10);
  return () => clearTimeout(timer); // Cleanup functie
}, []); // Lege array = alleen bij mount
```

### 4. Conditional Rendering
```javascript
{canvasState.photoGridVisible && (
  <FloatingPhotoGrid ... />
)}
// Component wordt alleen gerenderd als condition true is
```

### 5. Template Literals
```javascript
className={`${styles.photoGridOverlay} ${isVisible ? styles.fadeIn : styles.fadeOut}`}
// Dynamisch CSS classes combineren
```

### 6. Event Handlers met Parameters
```javascript
onClick={() => {
  onSetBackground(photo.src.large2x);
  handleClose();
}}
// Arrow function om parameters door te geven
```

## Design Patterns

### 1. "Lifting State Up" Pattern
State wordt beheerd in parent component (`CanvasPage`) en doorgegeven aan child components via props.

### 2. Custom Hooks Pattern
Logica wordt geëxtraheerd naar herbruikbare hooks (`usePexels`, `useCanvasState`).

### 3. Container/Component Pattern
- **Container**: `CanvasPage.jsx` - beheert state en handlers
- **Components**: `FloatingPhotoGrid`, `Controls` - krijgen props en renderen UI

### 4. Compound Component Pattern
```javascript
<FloatingPhotoGrid>
  <Header />
  <Content />  
  <Pagination />
</FloatingPhotoGrid>
```

## Handige Tips

### 1. State Naming Conventions
```javascript
// ✅ Goed - beschrijvend en consistent
const [isLoading, setIsLoading] = useState(false);
const [photos, setPhotos] = useState([]);

// ❌ Slecht - onduidelijk
const [flag, setFlag] = useState(false);
const [data, setData] = useState([]);
```

### 2. Event Handler Naming
```javascript
// ✅ Goed - duidelijke intentie
const handleOpenPhotoGrid = () => { /* ... */ };
const handleResetToCollection = () => { /* ... */ };

// ❌ Slecht - generiek
const onClick = () => { /* ... */ };
const doSomething = () => { /* ... */ };
```

### 3. Props Destructuring
```javascript
// ✅ Goed - overzichtelijk
export default function MyComponent({ 
  photos, 
  isLoading, 
  onClose 
}) {

// ❌ Slecht - onduidelijk
export default function MyComponent(props) {
  const photos = props.photos;
  // ...
```

### 4. CSS Module Classes
```javascript
// ✅ Goed - scoped classes
import styles from "./Component.module.css";
className={styles.myClass}

// ❌ Vermijd - global CSS conflicts
className="my-class"  
```

### 5. Conditional CSS Classes
```javascript
// ✅ Goed - leesbaar
className={`${styles.base} ${isActive ? styles.active : styles.inactive}`}

// ✅ Ook goed - met clsx library
className={clsx(styles.base, {
  [styles.active]: isActive,
  [styles.inactive]: !isActive
})}
```

## Debugging Tips

### 1. React Developer Tools
- Installeer React DevTools browser extensie
- Bekijk component state en props in real-time

### 2. Console Logging
```javascript
useEffect(() => {
  console.log('📸 Photo grid visibility changed:', photoGridVisible);
}, [photoGridVisible]);
```

### 3. Error Boundaries
```javascript
// Wrap components om errors te vangen
<ErrorBoundary>
  <FloatingPhotoGrid />
</ErrorBoundary>
```

## Samenvatting

Deze implementatie demonstreert:
- ✅ **State Management**: Hoe state tussen components wordt gedeeld
- ✅ **Custom Hooks**: Logica extractie voor herbruikbaarheid  
- ✅ **Event Handling**: User interacties afhandelen
- ✅ **Conditional Rendering**: Components tonen/verbergen
- ✅ **CSS Animations**: Smooth overgangen en micro-interacties
- ✅ **Error Handling**: Robuuste foutafhandeling

De floating photo grid biedt een veel betere UX door:
- 🎯 **Focused Experience**: Foto selectie krijgt volledige aandacht
- 🚀 **Snelle Toegang**: Één klik opent de grid
- 💫 **Smooth Animaties**: Professionele look & feel  
- 📱 **Responsive Design**: Werkt op alle schermgroottes

Deze patterns zijn toepasbaar in elke React applicatie voor modals, overlays, en floating UI elementen.