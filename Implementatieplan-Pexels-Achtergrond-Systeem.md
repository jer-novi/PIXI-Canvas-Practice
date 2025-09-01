Implementatieplan: Pexels Achtergrond Systeem
Dit document beschrijft de volledige, stap-voor-stap implementatie van een dynamisch achtergrondsysteem met behulp van de Pexels API en axios.

Doel: De gebruiker in staat stellen om te zoeken naar afbeeldingen en een geselecteerde afbeelding als achtergrond op het PIXI.js canvas in te stellen.

Fase 1: Voorbereiding (Checklist)
API Sleutel: Zorg ervoor dat je Pexels API sleutel correct is ingesteld in een .env.local bestand in de root van je project.

VITE_PEXELS_API_KEY="JOUW_SLEUTEL_HIER"

axios Installatie: Zorg ervoor dat axios is geïnstalleerd. Zo niet, voer dit uit in je terminal:

pnpm add axios

Nieuwe Component: Maak alvast een leeg bestand aan voor de achtergrondafbeelding: src/pages/CanvasPage/components/BackgroundImage.jsx.

Fase 2: De Data-laag (usePexels Hook)
We creëren een dedicated hook die alle logica voor de Pexels API bevat.

Actie: Maak het bestand src/pages/CanvasPage/hooks/usePexels.js aan en vul het met de volgende code:

// src/pages/CanvasPage/hooks/usePexels.js
import { useState, useCallback } from 'react';
import axios from 'axios';

const API_KEY = import.meta.env.VITE_PEXELS_API_KEY;
const API_URL = '[https://api.pexels.com/v1/search](https://api.pexels.com/v1/search)';

export function usePexels() {
const [photos, setPhotos] = useState([]);
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState(null);

const searchPhotos = useCallback(async (query) => {
setIsLoading(true);
setError(null);
setPhotos([]);

    if (!API_KEY) {
      setError("Pexels API sleutel ontbreekt. Voeg VITE_PEXELS_API_KEY toe aan je .env.local bestand.");
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
      console.error("Fout bij het ophalen van Pexels data:", err);
      setError('Er is iets misgegaan bij het zoeken naar foto\'s.');
    } finally {
      setIsLoading(false);
    }

}, []);

return { photos, isLoading, error, searchPhotos };
}

Fase 3: State Management (useCanvasState)
We integreren de usePexels hook en voegen state toe voor de geselecteerde achtergrond.

Actie: Pas src/pages/CanvasPage/hooks/useCanvasState.js aan.

// src/pages/CanvasPage/hooks/useCanvasState.js
import { usePexels } from './usePexels'; // <-- Importeren

export function useCanvasState() {
// ... (bestaande state)
const pexels = usePexels(); // <-- De nieuwe hook aanroepen

// Nieuwe state voor de achtergrond
const [backgroundImage, setBackgroundImage] = useState(null); // URL van de gekozen afbeelding

// ... (bestaande useEffect)

return {
// ... (bestaande return-waarden)

    // Pexels-gerelateerde state en functies
    ...pexels, // photos, isLoading, error, searchPhotos

    // Achtergrond state
    backgroundImage,
    setBackgroundImage,

};
}

Fase 4: De UI (Controls.jsx)
We voegen een nieuw sectie toe aan het Controls paneel om te zoeken en resultaten weer te geven.

Actie 1: Voeg de benodigde props toe aan Controls.jsx.
Actie 2: Voeg een useState toe voor de zoekterm.
Actie 3: Voeg de JSX voor de zoekbalk en de resultaten toe.

// src/pages/CanvasPage/Controls.jsx
import React, { useState } from "react"; // <-- useState importeren
import styles from "./CanvasPage.module.css";

export default function Controls({
// ... (bestaande props)
photos,
isLoading,
error,
onSearch, // Dit wordt onze handleSearchBackground
onSetBackground, // Dit wordt onze handleSetBackground
}) {
const [query, setQuery] = useState('Groningen gevel'); // Start met een relevante zoekterm

const handleSearchClick = () => {
if (query.trim()) {
onSearch(query.trim());
}
};

return (
<div className={styles.controlsWrapper}>
<h2>Styling Controls</h2>

      {/* --- NIEUW: Achtergrond Sectie --- */}
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

      {/* --- Bestaande Controls --- */}
      {/* ... (Font selector, font size, color, etc.) ... */}
    </div>

);
}

Actie 4: Voeg de bijbehorende CSS toe aan CanvasPage.module.css.

/_ In src/pages/CanvasPage/CanvasPage.module.css _/

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

Fase 5: De Logica (useCanvasHandlers)
We maken de handlers die de UI verbinden met onze state en de Pexels hook.

Actie: Pas src/pages/CanvasPage/hooks/useCanvasHandlers.js aan.

// src/pages/CanvasPage/hooks/useCanvasHandlers.js

export function useCanvasHandlers(canvasState) {
const {
// ... (bestaande state)
searchPhotos, // <-- van usePexels
setBackgroundImage // <-- van useCanvasState
} = canvasState;

// ... (bestaande handlers)

// NIEUWE HANDLERS
const handleSearchBackground = useCallback((query) => {
searchPhotos(query);
}, [searchPhotos]);

const handleSetBackground = useCallback((imageUrl) => {
setBackgroundImage(imageUrl);
}, [setBackgroundImage]);

return {
// ... (bestaande handlers)
handleSearchBackground,
handleSetBackground,
};
}

Fase 6: De Rendering (BackgroundImage.jsx & CanvasContent.jsx)
Nu de dataflow compleet is, gaan we de afbeelding daadwerkelijk tonen.

Actie 1: Vul de BackgroundImage.jsx component.

// src/pages/CanvasPage/components/BackgroundImage.jsx
import React, { useEffect, useState } from 'react';
import { Sprite, Texture } from 'pixi.js';

const BackgroundImage = ({ imageUrl, canvasWidth, canvasHeight }) => {
const [texture, setTexture] = useState(Texture.EMPTY);

useEffect(() => {
if (imageUrl) {
// Gebruik Texture.fromURL voor eenvoudige, gecachte textuur-lading
Texture.fromURL(imageUrl).then(loadedTexture => {
setTexture(loadedTexture);
}).catch(err => console.error("Fout bij laden achtergrondtextuur:", err));
} else {
setTexture(Texture.EMPTY);
}
}, [imageUrl]);

if (texture === Texture.EMPTY) {
return null; // Render niets als er geen afbeelding is
}

// "Cover" effect logica: schaal de afbeelding om het canvas te vullen zonder vervorming
const canvasAspect = canvasWidth / canvasHeight;
const imageAspect = texture.width / texture.height;
let scale = 1;
if (canvasAspect > imageAspect) {
scale = canvasWidth / texture.width; // Fit to width
} else {
scale = canvasHeight / texture.height; // Fit to height
}

return (
<sprite
texture={texture}
anchor={0.5}
x={canvasWidth / 2}
y={canvasHeight / 2}
scale={scale}
/>
);
};

export default BackgroundImage;

Actie 2: Integreer BackgroundImage in CanvasContent.jsx.

// src/pages/CanvasPage/components/CanvasContent.jsx
import BackgroundImage from './BackgroundImage'; // <-- Importeren

export function CanvasContent({
// ...
backgroundImage, // <-- De nieuwe prop
// ...
}) {

// ...

return (
<pixiViewport ...>
{/_ Render de achtergrond EERST, zodat hij achter de tekst komt _/}
<BackgroundImage 
        imageUrl={backgroundImage} 
        canvasWidth={width}
        canvasHeight={height}
      />

      {/* De bestaande tekst-container */}
      <pixiContainer ...>
        {/* ... (title, author, poem lines) ... */}
      </pixiContainer>
    </pixiViewport>

);
}

Fase 7: Alles Verbinden (CanvasPage.jsx)
De laatste stap is om alle nieuwe props vanuit de CanvasPage door te geven.

Actie: Werk CanvasPage.jsx bij.

// src/pages/CanvasPage/CanvasPage.jsx

export default function CanvasPage() {
// ... (bestaande hooks)

return (
// ...
<ResponsiveLayout
controls={
<Controls
// ... (bestaande props)
photos={canvasState.photos}
isLoading={canvasState.isLoading}
error={canvasState.error}
onSearch={handlers.handleSearchBackground}
onSetBackground={handlers.handleSetBackground}
/>
}
canvas={
<Application ...>
<CanvasContent
// ... (bestaande props)
backgroundImage={canvasState.backgroundImage}
/>
</Application>
}
/>
// ...
);
}

Conclusie
Na het volgen van deze stappen heb je een volledig werkend achtergrondsysteem. Je kunt nu zoeken naar afbeeldingen in het Controls paneel, en door op een thumbnail te klikken, wordt die afbeelding als achtergrond op het canvas gezet. Dit is een solide basis voor de volgende stap: het verslepen van het gedicht over de achtergrond.
