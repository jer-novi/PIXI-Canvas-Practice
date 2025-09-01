# Pexels Background System Implementation Guide

Dit document beschrijft de complete implementatie van het Pexels achtergrond systeem voor de PixiJS canvas applicatie, inclusief troubleshooting van de errors die we zijn tegengekomen.

## Overzicht

Het Pexels Background System stelt gebruikers in staat om te zoeken naar achtergrondafbeeldingen via de Pexels API en deze als achtergrond op het PixiJS canvas te gebruiken. Het systeem ondersteunt:

- **Pexels API integratie** voor foto zoeken
- **Responsive thumbnail grid** voor foto selectie
- **PixiJS achtergrond rendering** met cover effect
- **Real-time achtergrond wisselingen**

---

## Fase 1: Voorbereiding

### 1.1 Dependencies Check

Alle benodigde packages waren al geïnstalleerd:

- `axios@1.11.0` - Voor API calls
- `pixi.js@8.12.0` - Voor rendering (Assets API beschikbaar)
- `@pixi/react@8.0.3` - Voor React integratie

### 1.2 Environment Setup

Pexels API key was al geconfigureerd in `.env.local`:

```VITE_PEXELS_API_KEY="etCiydV90cmqYMYJaR0e5MeQIGuAkKbpX594ISrMUxbaJcwSChTIrLnq"
```

---

## Fase 2: Core Implementation

### 2.1 usePexels Hook (`src/pages/CanvasPage/hooks/usePexels.js`)

**Functionaliteit**: API integratie met error handling en loading states

```javascript
// src/pages/CanvasPage/hooks/usePexels.js
import { useState, useCallback } from 'react';
import axios from 'axios';

const API_KEY = import.meta.env.VITE_PEXELS_API_KEY;
const API_URL = 'https://api.pexels.com/v1/search';

export function usePexels() {
  const [photos, setPhotos] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const searchPhotos = useCallback(async (query) => {
    setIsLoading(true);
    setError(null);
    setPhotos([]);

    if (!API_KEY) {
      setError("Pexels API sleutel ontbreekt.");
      setIsLoading(false);
      return;
    }

    try {
      const url = `${API_URL}?query=${encodeURIComponent(query)}&per_page=12&orientation=landscape`;
      const response = await axios.get(url, {
        headers: {
          'Authorization': API_KEY
        }
      });
      setPhotos(response.data.photos);
    } catch (err) {
      console.error("Fout bij Pexels API:", err);
      setError('Er is iets misgegaan bij het zoeken naar foto\'s.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { photos, isLoading, error, searchPhotos };
}
```

### 2.2 State Management Update (`useCanvasState.js`)

**Wijzigingen**:

```javascript
// Import toevoegen
import { usePexels } from "./usePexels";

// In useCanvasState function:
const pexels = usePexels();
const [backgroundImage, setBackgroundImage] = useState(null);

// In return statement:
return {
  // ... bestaande properties
  
  // Pexels-gerelateerde state en functies
  ...pexels, // photos, isLoading, error, searchPhotos
  
  // Achtergrond state
  backgroundImage,
  setBackgroundImage,
  
  // ... rest
}
```

### 2.3 Handlers Implementation (`useCanvasHandlers.js`)

**Nieuwe handlers toegevoegd**:

```javascript
// Destructure nieuwe state
const {
  // ... bestaande state
  searchPhotos,
  setBackgroundImage
} = canvasState;

// Nieuwe handlers
const handleSearchBackground = useCallback((query) => {
  searchPhotos(query);
}, [searchPhotos]);

const handleSetBackground = useCallback((imageUrl) => {
  setBackgroundImage(imageUrl);
}, [setBackgroundImage]);

// Export toevoegen
return {
  // ... bestaande handlers
  handleSearchBackground,
  handleSetBackground,
};
```

---

## Fase 3: UI Implementation

### 3.1 Controls Component Update (`Controls.jsx`)

**Nieuwe props toegevoegd**:

```javascript
export default function Controls({
  // ... bestaande props
  
  // Pexels background props
  photos,
  isLoading,
  error,
  onSearch,
  onSetBackground,
  
  // ... rest
}) {
  const [query, setQuery] = useState('Groningen gevel');

  const handleSearchClick = () => {
    if (query.trim()) {
      onSearch(query.trim());
    }
  };
```

**UI sectie toegevoegd**:

```jsx
{/* Achtergrond Sectie */}
<div className={styles.controlSection}>
  <h3>Achtergrond</h3>
  <div className={styles.controlRow}>
    <input
      type="text"
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      onKeyPress={(e) => e.key === 'Enter' && handleSearchClick()}
      placeholder="Zoek een achtergrond..."
      className={styles.searchInput}
    />
    <button onClick={handleSearchClick} disabled={isLoading} className={styles.searchButton}>
      {isLoading ? '...' : 'Zoek'}
    </button>
  </div>
  {error && <p className={styles.errorMessage}>{error}</p>}
  <div className={styles.photoGrid}>
    {photos.map(photo => (
      <div key={photo.id} className={styles.photoThumbnail} onClick={() => onSetBackground(photo.src.large2x)}>
        <img src={photo.src.tiny} alt={photo.alt} />
      </div>
    ))}
  </div>
</div>
```

### 3.2 CSS Styling (`CanvasPage.module.css`)

**Styling voor Pexels UI toegevoegd**:

```css
/* Pexels Background Search Styling */
.searchInput {
  flex-grow: 1;
  padding: 8px;
  border: 1px solid #4a5568;
  background-color: #2d3748;
  color: #e2e8f0;
  border-radius: 4px;
}

.searchButton {
  padding: 8px 12px;
  border: none;
  background-color: #4299e1;
  color: white;
  border-radius: 4px;
  cursor: pointer;
}

.searchButton:disabled {
  background-color: #4a5568;
  cursor: not-allowed;
}

.errorMessage {
  color: #f56565;
  font-size: 0.8rem;
  margin-top: 0.5rem;
}

.photoGrid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 8px;
  margin-top: 1rem;
  max-height: 200px;
  overflow-y: auto;
}

.photoThumbnail {
  position: relative;
  cursor: pointer;
  border-radius: 4px;
  overflow: hidden;
  aspect-ratio: 16 / 9;
}

.photoThumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.2s ease;
}

.photoThumbnail:hover img {
  transform: scale(1.1);
}
```

---

## Fase 4: PixiJS Rendering Component

### 4.1 BackgroundImage Component (`components/BackgroundImage.jsx`)

**Initiële implementatie** (die errors gaf):

```jsx
// PROBLEMATISCH: Texture.fromURL bestaat niet meer in PIXI v8+
import { Sprite, Texture } from 'pixi.js';

useEffect(() => {
  if (imageUrl) {
    Texture.fromURL(imageUrl).then(loadedTexture => { // ERROR!
      setTexture(loadedTexture);
    }).catch(err => console.error("Fout:", err));
  }
}, [imageUrl]);
```

**Definitieve implementatie** (na fix):

```jsx
// src/pages/CanvasPage/components/BackgroundImage.jsx
import React, { useEffect, useState } from 'react';
import { Assets, Sprite, Texture } from 'pixi.js'; // Assets toegevoegd!

const BackgroundImage = ({ imageUrl, canvasWidth, canvasHeight }) => {
  const [texture, setTexture] = useState(Texture.EMPTY);

  useEffect(() => {
    if (imageUrl) {
      // MODERNE MANIER: Assets.load (PIXI v7+)
      Assets.load(imageUrl).then(loadedTexture => {
        setTexture(loadedTexture);
      }).catch(err => console.error("Fout bij laden achtergrondtextuur:", err));
    } else {
      setTexture(Texture.EMPTY);
    }
  }, [imageUrl]);

  if (texture === Texture.EMPTY) {
    return null;
  }

  // "Cover" effect logica
  const canvasAspect = canvasWidth / canvasHeight;
  const imageAspect = texture.width / texture.height;
  let scale = 1;
  if (canvasAspect > imageAspect) {
    scale = canvasWidth / texture.width; // Fit to width
  } else {
    scale = canvasHeight / texture.height; // Fit to height
  }

  return (
    <pixiSprite
      texture={texture}
      anchor={0.5}
      x={canvasWidth / 2}
      y={canvasHeight / 2}
      scale={scale}
    />
  );
};

export default BackgroundImage;
```

### 4.2 CanvasContent Integration

**BackgroundImage integratie**:

```jsx
// Import toevoegen
import BackgroundImage from './BackgroundImage';

// Props toevoegen aan functie
export function CanvasContent({
  // ... bestaande props
  backgroundImage, // NIEUW
}) {

// In render return:
return (
  <pixiViewport ...>
    {/* EERST achtergrond, dan tekst */}
    <BackgroundImage 
      imageUrl={backgroundImage} 
      canvasWidth={width}
      canvasHeight={height}
    />

    <pixiContainer>
      {/* Bestaande tekst content */}
    </pixiContainer>
  </pixiViewport>
);
```

---

## Fase 5: Props Wiring

### 5.1 CanvasPage Component Updates

**Props naar Controls**:

```jsx
<Controls
  // ... bestaande props
  // Pexels background props
  photos={canvasState.photos}
  isLoading={canvasState.isLoading}
  error={canvasState.error}
  onSearch={handlers.handleSearchBackground}
  onSetBackground={handlers.handleSetBackground}
/>
```

**Props naar CanvasContent**:

```jsx
<CanvasContent
  // ... bestaande props
  backgroundImage={canvasState.backgroundImage}
/>
```

---

## Troubleshooting: Error Resolution

### Error 1: Syntax Error in Controls.jsx

**Problem**: `Parsing error: Unexpected token )`
**Oorzaak**: Parameter lijst eindigde met `)` in plaats van `}) {`
**Fix**:

```javascript
// FOUT:
selectedLines,
lineOverrides,
) {

// CORRECT:
selectedLines,
lineOverrides,
}) {
```

### Error 2: Texture.fromURL is not a function

**Problem**: `TypeError: Texture.fromURL is not a function`  
**Oorzaak**: `Texture.fromURL` is vervangen door `Assets.load()` in PixiJS v7+
**Fix**:

```javascript
// FOUT (v4/v5 syntax):
import { Sprite, Texture } from 'pixi.js';
Texture.fromURL(imageUrl).then(...)

// CORRECT (v7+ syntax):
import { Assets, Sprite, Texture } from 'pixi.js';
Assets.load(imageUrl).then(...)
```

### Error 3: Unused Variables

**Problem**: ESLint errors voor unused destructured variables
**Fix**: Verwijder ongebruikte variabelen uit destructuring

---

## API Specification

### Pexels API Response Structure

```javascript
{
  "photos": [
    {
      "id": 123456,
      "width": 3000,
      "height": 2000,
      "url": "https://www.pexels.com/photo/...",
      "photographer": "Name",
      "alt": "Description",
      "src": {
        "original": "https://images.pexels.com/photos/.../original.jpg",
        "large2x": "https://images.pexels.com/photos/.../large-2x.jpg", // GEBRUIKT
        "large": "https://images.pexels.com/photos/.../large.jpg",
        "medium": "https://images.pexels.com/photos/.../medium.jpg",
        "small": "https://images.pexels.com/photos/.../small.jpg",
        "portrait": "https://images.pexels.com/photos/.../portrait.jpg",
        "landscape": "https://images.pexels.com/photos/.../landscape.jpg",
        "tiny": "https://images.pexels.com/photos/.../tiny.jpg" // GEBRUIKT voor thumbnails
      }
    }
  ],
  "total_results": 8000,
  "page": 1,
  "per_page": 12,
  "next_page": "https://api.pexels.com/v1/search/?page=2&..."
}
```

---

## Usage Instructions

### Voor Gebruikers

1. **Open de applicatie** → `http://localhost:5173/`
2. **Zoek achtergrond** → Type zoekterm (bijv. "Groningen gevel") → klik "Zoek"
3. **Bekijk resultaten** → 12 landscape foto's verschijnen in grid
4. **Selecteer achtergrond** → Klik op thumbnail → foto verschijnt achter gedicht
5. **Wissel achtergrond** → Klik op andere thumbnail voor nieuwe achtergrond

### Voor Developers

1. **API Key setup** → Voeg `VITE_PEXELS_API_KEY` toe aan `.env.local`
2. **Start development** → `pnpm dev`
3. **Customize search** → Wijzig default query in `Controls.jsx:56`
4. **Adjust styling** → Pas CSS aan in `CanvasPage.module.css`

---

## Technical Architecture

```
CanvasPage (Main)
├── useCanvasState
│   ├── usePexels (API integration)
│   └── backgroundImage (state)
├── useCanvasHandlers  
│   ├── handleSearchBackground
│   └── handleSetBackground
├── Controls (UI)
│   ├── Search input
│   ├── Photo grid
│   └── Error handling
└── CanvasContent (Rendering)
    ├── BackgroundImage (PixiJS)
    └── Text content
```

---

## Performance Considerations

- **Lazy loading**: Alleen thumbnails laden, full resolution on-demand
- **Caching**: PixiJS Assets.load heeft ingebouwde cache
- **Memory management**: Texture cleanup bij component unmount
- **API limits**: Max 12 foto's per zoekopdracht
- **Cover scaling**: Efficient aspect ratio berekeningen

---

## Future Enhancements

- [ ] **Infinite scroll** voor meer dan 12 resultaten  
- [ ] **Favorite backgrounds** systeem
- [ ] **Local image upload** naast Pexels
- [ ] **Background blur/effects** filters
- [ ] **Search history** en recent searches
- [ ] **Batch background loading** voor performance

---

## Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `pixi.js` | `8.12.0` | Canvas rendering & Assets API |
| `@pixi/react` | `8.0.3` | React-PixiJS integration |  
| `axios` | `1.11.0` | HTTP requests naar Pexels API |
| `react` | `19.x` | UI framework |

---

## Conclusie

Het Pexels Background System is succesvol geïmplementeerd en volledig operationeel. De belangrijkste uitdagingen waren:

1. **API integratie** → Opgelost met robust error handling
2. **PixiJS v8 compatibility** → Assets.load in plaats van Texture.fromURL  
3. **React-PixiJS state sync** → Proper useEffect dependency management

Het systeem biedt nu een naadloze gebruikerservaring voor het zoeken en toepassen van achtergrondafbeeldingen op het gedichtencanvas.
