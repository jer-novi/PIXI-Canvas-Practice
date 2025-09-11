# Canvas Integration Guide: PIXI Canvas Practice → gedichtgevel.nl

## Overview

Dit document beschrijft hoe je de geavanceerde canvas functionaliteit uit het PIXI Canvas Practice project integreert in het eindproject gedichtgevel.nl. De canvas component zal gebruikt worden om gedichten visueel te bewerken op gevelafbeeldingen.

## Project Overzicht

### PIXI Canvas Practice Project
- **Locatie**: `C:\CODING PROJECTS and WEBSITES\GITHUB-NOVI-USER\pixi-canvas-practice`
- **Doel**: Ontwikkeling van robuuste PIXI.js canvas functionaliteit
- **Status**: Volledig werkend met geavanceerde features

### Eindproject gedichtgevel.nl
- **Locatie**: `C:\CODING PROJECTS and WEBSITES\GITHUB JEZI89\NOVI\Eindopdrachten-Clean\eindproject-fe-gedichtgevel.nl`
- **Doel**: Productie-ready website voor gedicht visualisatie
- **Canvas Status**: Leeg skelet component (`src/components/Core/Canvas/Canvas.jsx`)

## 🎯 Integratiedoelstellingen

### Primary Goals
1. **Poem Canvas Display**: Geselecteerde gedichten weergeven op canvas met volledige PIXI.js functionaliteit
2. **Navigation Integration**: Canvas button (`🎨 Open in canvas`) werkend maken
3. **Poem Data Flow**: Gedichtdata van zoekresultaten naar canvas transporteren
4. **Background System**: Pexels/Flickr achtergronden integreren voor gevelafbeeldingen

### Secondary Goals
1. **Typography Controls**: Font styling, grootte, kleur aanpassingen
2. **Interactive Positioning**: Drag-and-drop functionaliteit voor tekst
3. **Export Functionality**: Canvas exporteren als afbeelding
4. **Responsive Design**: Canvas responsive maken binnen bestaande layout

## 📋 Stap-voor-stap Integratie

### Fase 1: Basis Setup en Dependencies

#### 1.1 Dependencies Installeren
```bash
cd "C:\CODING PROJECTS and WEBSITES\GITHUB JEZI89\NOVI\Eindopdrachten-Clean\eindproject-fe-gedichtgevel.nl"

# PIXI.js Core
pnpm install pixi.js @pixi/react

# Viewport voor camera controls
pnpm install pixi-viewport

# Pexels API voor achtergronden (mogelijk al geïnstalleerd)
pnpm install axios
```

#### 1.2 Vite Configuratie Aanpassen
Voeg toe aan `vite.config.js`:
```javascript
export default defineConfig({
  // Bestaande configuratie...
  
  esbuild: {
    // Sta JSX syntax toe in .js files (zoals Canvas Practice)
    loader: 'jsx',
    include: /src\/.*\.(jsx?|tsx?)$/,
  },
  
  define: {
    // PIXI.js optimalisatie
    __PIXI_DEVTOOLS__: process.env.NODE_ENV === 'development',
  }
})
```

### Fase 2: Core Canvas Component Implementatie

#### 2.1 Canvas Component Vervangen
Vervang `src/components/Core/Canvas/Canvas.jsx` met een aangepaste versie van `CanvasPage.jsx` uit Canvas Practice:

**Belangrijke aanpassingen:**
- Component naam: `Canvas` ipv `CanvasPage`
- Props interface: `{ poemData, backgroundUrl, onSave }`
- Integratie met bestaande eindproject styling

#### 2.2 Benodigde Files Kopiëren
Kopieer de volgende files van Canvas Practice naar eindproject:

**Hooks** (`src/hooks/canvas/`):
- `useResponsiveCanvas.js` → Voor responsive layout
- `useCanvasState.js` → Canvas state management  
- `useCanvasHandlers.js` → Event handlers
- `useFontLoader.js` → Font management
- `usePexels.js` → Background image search

**Components** (`src/components/Core/Canvas/components/`):
- `CanvasContent.jsx` → PIXI.js render logic
- `ResponsiveLayout.jsx` → Layout management
- `Controls.jsx` → Typography controls
- `FloatingPhotoGrid.jsx` → Background selector
- `XYMoveSliders.jsx` → Position controls

**Utils** (`src/utils/canvas/`):
- `textPositioning.js` → Text positioning logic
- `fontUtils.js` → Font loading utilities

### Fase 3: Navigation & Routing Integration

#### 3.1 Canvas Route Toevoegen
In `src/main.jsx`, voeg canvas route toe:
```javascript
const router = createBrowserRouter([
    {
        path: '/',
        element: <App/>,
        children: [
            // Bestaande routes...
            {path: 'designgevel', element: <DesignPage/>},
            
            // NIEUWE CANVAS ROUTE
            {path: 'canvas', element: <CanvasPage/>}, 
            {path: 'canvas/:poemId', element: <CanvasPage/>}, // Met poem parameter
        ]
    }
]);
```

#### 3.2 Canvas Page Component Maken
Maak `src/pages/Canvas/CanvasPage.jsx`:
```javascript
import React from 'react';
import { useParams, useSearchParams } from 'react-router';
import Canvas from '@/components/Core/Canvas/Canvas.jsx';

export function CanvasPage() {
    const { poemId } = useParams();
    const [searchParams] = useSearchParams();
    
    // Haal poem data op basis van ID
    const poemData = getPoemData(poemId);
    
    return (
        <div className="canvas-page">
            <Canvas 
                poemData={poemData}
                onSave={handleCanvasSave}
            />
        </div>
    );
}
```

#### 3.3 Navigation Button Activeren
In `src/components/poem/PoemActionButtons.jsx`, uncomment en implementeer:
```javascript
const PoemActionButtons = memo(({
    // ... andere props
    onNavigateToCanvas,
}) => {
    
    const handleNavigateToCanvas = () => {
        if (onNavigateToCanvas && poem) {
            // Navigate naar canvas met poem data
            onNavigateToCanvas(poem);
        }
    };
    
    return (
        // ... bestaande JSX
        <motion.button
            className={`${styles.expandButton} ${styles.canvasButton}`}
            onClick={handleNavigateToCanvas} // ACTIVEER DEZE FUNCTIE
            aria-label="Open dit gedicht in de canvas editor"
            whileHover={buttonVariants.button.hover}
            whileTap={buttonVariants.button.tap}
        >
            <span className={styles.expandIcon}>🎨</span>
            Open in canvas
        </motion.button>
    );
});
```

### Fase 4: Poem Data Integration

#### 4.1 Poem Data Flow Setup
In parent components die `PoemActionButtons` gebruiken:
```javascript
// In SearchResults, PoemResultItem, etc.
import { useNavigate } from 'react-router';

function PoemResultItem({ poem, ...props }) {
    const navigate = useNavigate();
    
    const handleNavigateToCanvas = (poemData) => {
        // Store poem data tijdelijk (localStorage of context)
        sessionStorage.setItem('canvas-poem-data', JSON.stringify(poemData));
        
        // Navigate naar canvas
        navigate(`/canvas/${poemData.id}?source=search`);
    };
    
    return (
        <PoemActionButtons
            // ... andere props
            onNavigateToCanvas={handleNavigateToCanvas}
        />
    );
}
```

#### 4.2 Poem Data Service
Maak `src/services/canvas/canvasDataService.js`:
```javascript
/**
 * Service voor het beheren van poem data tussen zoek en canvas
 */
export class CanvasDataService {
    static STORAGE_KEY = 'canvas-poem-data';
    
    static storePoemForCanvas(poemData) {
        sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(poemData));
    }
    
    static getPoemForCanvas() {
        const stored = sessionStorage.getItem(this.STORAGE_KEY);
        return stored ? JSON.parse(stored) : null;
    }
    
    static clearPoemData() {
        sessionStorage.removeItem(this.STORAGE_KEY);
    }
}
```

### Fase 5: Environment & Configuration

#### 5.1 Environment Variables
Voeg toe aan `.env`:
```env
# Bestaande Supabase vars...

# Pexels API (voor achtergronden)
VITE_PEXELS_API_KEY=your_pexels_api_key_here

# Canvas configuratie
VITE_CANVAS_DEBUG=true
VITE_CANVAS_MAX_WIDTH=1920
VITE_CANVAS_MAX_HEIGHT=1080
```

#### 5.2 Font Files
Kopieer font files van Canvas Practice naar eindproject:
```
public/fonts/
├── cormorant-garamond/
│   ├── CormorantGaramond-Regular.woff2
│   ├── CormorantGaramond-Bold.woff2
│   └── CormorantGaramond-Italic.woff2
└── montserrat/
    ├── Montserrat-Regular.woff2
    ├── Montserrat-Bold.woff2
    └── Montserrat-Italic.woff2
```

## 🔧 Technische Implementation Details

### Canvas State Management
```javascript
// Canvas state structure (gebaseerd op Canvas Practice)
const canvasState = {
    // Text styling
    fontSize: 24,
    fontFamily: 'Cormorant Garamond',
    fontWeight: 400,
    fontStyle: 'normal',
    fillColor: '#FFFFFF',
    letterSpacing: 0,
    lineHeight: 1.2,
    textAlign: 'left',
    
    // Positioning
    poemOffset: { x: 0, y: 0 },
    lineOverrides: new Map(), // Per-line customizations
    
    // Selection & interaction
    selectedLines: new Set(),
    moveMode: 'edit', // 'edit', 'line', 'poem'
    
    // Background
    backgroundImage: null,
    photos: [], // Pexels search results
    
    // UI state
    isLoading: false,
    photoGridVisible: false,
};
```

### PIXI.js Integration Pattern
```javascript
// In Canvas.jsx - PIXI component extension (CRITICAL!)
import {Application, extend} from "@pixi/react";
import {Text, Container, Graphics} from "pixi.js";
import {Viewport} from "pixi-viewport";

// MUST be called at module level!
extend({Text, Container, Graphics, Viewport});

export default function Canvas({ poemData, onSave }) {
    return (
        <Application
            width={canvasWidth}
            height={canvasHeight}
            options={{
                background: 0x1d2230,
                resolution: window.devicePixelRatio || 1,
                autoDensity: true,
            }}
        >
            <CanvasContent
                poemData={poemData}
                // ... andere props
            />
        </Application>
    );
}
```

### Responsive Layout Implementation
```javascript
// useResponsiveCanvas hook - aangepast voor eindproject
export function useResponsiveCanvas() {
    const [layout, setLayout] = useState({
        canvasWidth: 800,
        canvasHeight: 600,
        controlsWidth: 340,
        navigationWidth: 120,
        showControls: true,
        showNavigation: true,
    });
    
    const updateLayout = useCallback(() => {
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        // Bereken available space rekening houdend met NavBar
        const availableHeight = viewportHeight - 80; // NavBar height
        
        const controlsWidth = layout.showControls ? 340 : 0;
        const navWidth = layout.showNavigation ? 120 : 0;
        
        const canvasWidth = Math.max(300, viewportWidth - controlsWidth - navWidth);
        const canvasHeight = Math.max(200, availableHeight - 40); // Padding
        
        setLayout(prev => ({
            ...prev,
            canvasWidth,
            canvasHeight,
        }));
    }, [layout.showControls, layout.showNavigation]);
    
    useEffect(() => {
        updateLayout();
        window.addEventListener('resize', updateLayout);
        return () => window.removeEventListener('resize', updateLayout);
    }, [updateLayout]);
    
    return { layout, toggleControls, toggleNav };
}
```

## 📱 Responsive Design Considerations

### Layout Strategy
Het Canvas Practice project gebruikt een drie-kolommen layout:
- **Controls Panel**: Vast 340px breed (inklapbaar)
- **Canvas Area**: Flexibel, vult beschikbare ruimte
- **Navigation Panel**: Vast 120px breed (inklapbaar)

### Eindproject Integration
De eindproject heeft een andere layout structuur:
- **NavBar**: Fixed top navigation (80px hoog)
- **Main Content**: Full viewport minus navbar
- **Canvas Container**: Moet passen binnen main content area

### Mobile Responsiveness
- Panels worden automatisch ingeklapd op smaller screens (< 768px)
- Canvas krijgt minimum afmetingen (300x200px)
- Touch controls voor mobile drag-and-drop

## 🎨 Styling Integration

### SCSS Modules Pattern
Het eindproject gebruikt SCSS modules. Converteer Canvas Practice CSS:

**Van** (Canvas Practice):
```css
/* CanvasPage.module.css */
.canvasPage {
    display: flex;
    height: 100vh;
}
```

**Naar** (eindproject):
```scss
/* Canvas.module.scss */
.canvasPage {
    display: flex;
    height: calc(100vh - 80px); // Account for NavBar
    background: $background-dark;
    
    @include respond-to('mobile') {
        flex-direction: column;
    }
}
```

### Theme Integration
Gebruik eindproject's theme variables:
```scss
// _variables.scss aanvullingen
$canvas-bg-dark: #1d2230;
$canvas-controls-bg: #2a3441;
$canvas-text-primary: #ffffff;
$canvas-accent: #3b82f6;
```

## 🔗 API Integration

### Pexels API Setup
Canvas Practice gebruikt Pexels voor achtergrondafbeeldingen. In eindproject:

```javascript
// src/services/api/pexelsService.js
import axios from 'axios';

class PexelsService {
    constructor() {
        this.apiKey = import.meta.env.VITE_PEXELS_API_KEY;
        this.baseURL = 'https://api.pexels.com/v1';
        
        this.client = axios.create({
            baseURL: this.baseURL,
            headers: {
                'Authorization': this.apiKey,
            },
        });
    }
    
    async searchPhotos(query, page = 1, perPage = 15) {
        try {
            const response = await this.client.get('/search', {
                params: { query, page, per_page: perPage }
            });
            return response.data;
        } catch (error) {
            console.error('Pexels API Error:', error);
            throw error;
        }
    }
    
    async getCuratedPhotos(page = 1, perPage = 15) {
        try {
            const response = await this.client.get('/curated', {
                params: { page, per_page: perPage }
            });
            return response.data;
        } catch (error) {
            console.error('Pexels API Error:', error);
            throw error;
        }
    }
}

export const pexelsService = new PexelsService();
```

### Integration met Bestaande Poetry API
Verbind canvas met bestaande poetry services:
```javascript
// src/services/canvas/canvasPoemService.js
import { poetryApi } from '@/services/api/poetryApi';

export class CanvasPoemService {
    static async getPoemForCanvas(poemId) {
        try {
            // Gebruik bestaande poetry API
            const poemData = await poetryApi.getPoemById(poemId);
            
            // Transform naar canvas-compatible format
            return {
                id: poemData.id,
                title: poemData.title,
                author: poemData.author,
                lines: poemData.lines,
                // Extra canvas properties
                metadata: {
                    source: 'poetrydb',
                    originalLength: poemData.lines.length,
                    loadedAt: Date.now(),
                }
            };
        } catch (error) {
            console.error('Failed to load poem for canvas:', error);
            throw error;
        }
    }
}
```

## 🧪 Testing Strategy

### Component Testing
```javascript
// src/components/Core/Canvas/__tests__/Canvas.test.jsx
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Canvas from '../Canvas.jsx';

const mockPoemData = {
    title: "Test Poem",
    author: "Test Author", 
    lines: ["Line 1", "Line 2", "Line 3"]
};

describe('Canvas Component', () => {
    test('renders poem data correctly', () => {
        render(
            <BrowserRouter>
                <Canvas poemData={mockPoemData} />
            </BrowserRouter>
        );
        
        expect(screen.getByText('Test Poem')).toBeInTheDocument();
        expect(screen.getByText('Test Author')).toBeInTheDocument();
    });
    
    test('initializes PIXI application', () => {
        const { container } = render(
            <BrowserRouter>
                <Canvas poemData={mockPoemData} />
            </BrowserRouter>
        );
        
        // Check for PIXI canvas element
        const canvas = container.querySelector('canvas');
        expect(canvas).toBeInTheDocument();
    });
});
```

### Integration Testing
Test de complete flow van poem search naar canvas:
```javascript
// src/__tests__/integration/canvas-navigation.test.jsx
test('navigates from search results to canvas', async () => {
    render(<App />);
    
    // Search for poem
    const searchInput = screen.getByRole('searchbox');
    fireEvent.change(searchInput, { target: { value: 'shakespeare' } });
    
    // Wait for results
    await waitFor(() => {
        expect(screen.getByText(/shakespeare/i)).toBeInTheDocument();
    });
    
    // Click canvas button
    const canvasButton = screen.getByLabelText(/open.*canvas/i);
    fireEvent.click(canvasButton);
    
    // Verify navigation to canvas page
    await waitFor(() => {
        expect(window.location.pathname).toMatch(/\/canvas/);
    });
});
```

## ⚠️ Bekende Issues & Workarounds

### 1. PIXI.js Version Compatibility
**Issue**: Canvas Practice gebruikt PIXI.js v8+, eindproject mogelijk oudere versie.
**Solution**: Update naar PIXI v8+ of backward compatibility layer.

### 2. Font Loading Race Conditions  
**Issue**: Tekst kan flashen tijdens font loading.
**Solution**: Gebruik `useFontLoader` hook uit Canvas Practice voor proper loading states.

### 3. Viewport Camera Conflicts
**Issue**: Drag-and-drop kan conflicteren met viewport camera controls.
**Solution**: Gebruik Canvas Practice's event delegation pattern met `Ctrl/Cmd` key modifiers.

### 4. Mobile Touch Performance
**Issue**: Touch events kunnen traag zijn op mobile devices.
**Solution**: Implementeer touch-optimized event handlers en throttling.

## 🚀 Development Workflow

### Development Setup
1. Start beide projecten parallel voor referentie:
   ```bash
   # Terminal 1 - Canvas Practice (referentie)
   cd "C:\CODING PROJECTS and WEBSITES\GITHUB-NOVI-USER\pixi-canvas-practice"
   pnpm dev
   
   # Terminal 2 - Eindproject (development)
   cd "C:\CODING PROJECTS and WEBSITES\GITHUB JEZI89\NOVI\Eindopdrachten-Clean\eindproject-fe-gedichtgevel.nl"
   pnpm dev
   ```

2. Use browser dev tools om canvas performance te monitoren
3. Test op verschillende schermformaten en devices

### Incremental Implementation
1. **Week 1**: Basis canvas component + navigation
2. **Week 2**: Poem data integration + basic text rendering  
3. **Week 3**: Background system + styling controls
4. **Week 4**: Advanced features + mobile optimization

### Debug Tools
Canvas Practice heeft ingebouwde debug functionaliteit:
```javascript
// In browser console (development mode only)
window.debugCanvas.toggle(); // Toggle debug overlay
window.debugCanvas.state();  // Log current canvas state
window.debugCanvas.performance(); // Performance metrics
```

## 📚 Key Learning Points

### PIXI.js Best Practices
1. **extend() Timing**: Altijd op module level, nooit in components
2. **Event Handling**: Gebruik moderne federated event system  
3. **Memory Management**: Proper cleanup van textures en containers
4. **Performance**: Direct PIXI updates tijdens drag operations

### React Integration Patterns
1. **Hook Composition**: Gebruik Canvas Practice's hook architecture
2. **State Synchronization**: Bidirectional sync tussen React state en PIXI
3. **Lifecycle Management**: Proper mount/unmount handling voor PIXI resources

### Responsive Canvas Design
1. **Layout Calculations**: Dynamic sizing gebaseerd op viewport
2. **Content Scaling**: Maintain aspect ratios tijdens resize
3. **Touch Optimization**: Mobile-first interaction patterns

## 🎯 Success Criteria

### Minimum Viable Product (MVP)
- [ ] Canvas component rendert geselecteerde gedichten
- [ ] Navigation button werkt vanuit zoekresultaten  
- [ ] Basic text styling (font, size, color)
- [ ] Simple background image support
- [ ] Export als image functionaliteit

### Enhanced Features
- [ ] Drag-and-drop text positioning
- [ ] Advanced typography controls
- [ ] Pexels background integration
- [ ] Responsive design op alle devices
- [ ] Performance optimization (60fps)

### Production Ready
- [ ] Comprehensive error handling
- [ ] Loading states en feedback
- [ ] Accessibility compliance
- [ ] Cross-browser compatibility
- [ ] Mobile touch optimization

---

## 📞 Support & Resources

### Canvas Practice Documentation
- `C:\CODING PROJECTS and WEBSITES\GITHUB-NOVI-USER\pixi-canvas-practice\CLAUDE.md`
- Live demo draaiend op lokale development server

### Key Files Reference
- **Main Canvas Logic**: `CanvasPage.jsx` → Adapt naar `Canvas.jsx`
- **PIXI Rendering**: `CanvasContent.jsx` → Direct copy + minor mods
- **State Management**: `useCanvasState.js` → Copy + extend voor poem data
- **Typography**: `Controls.jsx` → Integrate met eindproject design system

### External Resources  
- [PIXI.js v8 Documentation](https://pixijs.com/8.x/guides)
- [@pixi/react Documentation](https://github.com/pixijs/pixi-react)
- [pixi-viewport Documentation](https://github.com/davidfig/pixi-viewport)

### Contact
Voor vragen over de implementatie, refereer naar Canvas Practice code en deze documentatie. De volledige werkende implementatie is beschikbaar in het practice project als referentie.

---

*Laatste update: 2025-01-11*
*Auteur: Claude Code Integration Assistant*