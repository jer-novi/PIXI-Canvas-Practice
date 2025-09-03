# **Font Selection System Enhancement - Uitgebreid Refactor Plan**

## **Inhoudsopgave**
1. [Probleem Analyse](#probleem-analyse)
2. [PIXI Text Types Vergelijking](#pixi-text-types-vergelijking)
3. [Huidige Implementatie Assessment](#huidige-implementatie-assessment)
4. [Gedetailleerd Refactor Plan](#gedetailleerd-refactor-plan)
5. [UI/UX Control Inrichting](#ui-ux-control-inrichting)
6. [Quick Wins Voor Text Performance](#quick-wins-voor-text-performance)
7. [PIXI.Assets Integration](#pixi-assets-integration)
8. [Implementatie Roadmap](#implementatie-roadmap)

---

## **Probleem Analyse**

### **Issue A: Line-Level Font Selection Werkt Niet**
- **Locatie**: `src/pages/CanvasPage/hooks/useTextStyles.js:100-110`
- **Probleem**: `useLineStyle` hook verwerkt GEEN `fontFamily` overrides 
- **Missing Code**: `if (lineOverrides.fontFamily) styleProps.fontFamily = lineOverrides.fontFamily;`

### **Issue B: Titel/Auteur Font Systeem Ontbreekt Volledig**
- **Locatie**: Geen font override systeem voor titel/auteur
- **Probleem**: Alleen kleur overrides bestaan (`titleColorOverride`, `authorColorOverride`)
- **Missend**: `titleFontOverride`, `authorFontOverride` state en handlers

### **Issue C: Font Dialog Selector Ontbreekt**
- **Locatie**: `src/pages/CanvasPage/Controls.jsx`
- **Probleem**: Alleen basis dropdown, geen geavanceerde font selector
- **Gewenste UI**: Dialog met preview, categorieën, en search functionaliteit

---

## **PIXI Text Types Vergelijking**

### **1. Canvas Text (`Text`) - HUIDIGE KEUZE ✅**

**Wat het is:**
- Canvas-based text rendering met rich styling support
- Gebruikt HTML5 Canvas voor text rendering
- Elke tekst wordt gerenderd naar een texture

**Voordelen:**
- ✅ Uitstekend voor rich text styling (shadows, strokes, gradients)
- ✅ Goede prestaties voor teksten die weinig veranderen
- ✅ Volledige font family support (web fonts, Google Fonts)
- ✅ Flexibele styling via `TextStyle`
- ✅ Perfect voor gedichten en literaire content

**Nadelen:**
- ❌ Langzamere updates bij frequent veranderen
- ❌ Medium memory usage (één texture per unieke tekst)
- ❌ Minder geschikt voor UI tekst die constant verandert

**Performance Metrics:**
- Rendering Speed: **Medium**
- Update Performance: **Slow** (bij frequente updates)
- Memory Usage: **Medium**
- Styling Flexibility: **High**

### **2. Bitmap Text (`BitmapText`)**

**Wat het is:**
- Pre-rendered font atlas systeem
- Tekst wordt gerenderd uit vooraf gegenereerde character textures
- Snelste rendering methode in PIXI

**Voordelen:**
- ✅ Snelste rendering en update performance
- ✅ Laag memory gebruik (gedeelde texture atlas)
- ✅ Perfect voor UI tekst, scores, counters
- ✅ Excellent voor high-volume text rendering

**Nadelen:**
- ❌ Beperkte styling opties
- ❌ Fonts moeten vooraf geconverteerd worden naar bitmap formaat
- ❌ Minder geschikt voor dynamische font loading
- ❌ Geen built-in support voor web fonts

**Performance Metrics:**
- Rendering Speed: **Fast**
- Update Performance: **Fast**
- Memory Usage: **Low**
- Styling Flexibility: **Limited**

### **3. HTML Text (`HTMLText`)**

**Wat het is:**
- HTML/CSS based text rendering binnen PIXI
- Combineert DOM text rendering met PIXI textures
- Ondersteunt complexe HTML markup

**Voordelen:**
- ✅ Complexe HTML/CSS styling support
- ✅ Multi-style text binnen één component
- ✅ Emoji en special character support
- ✅ Familiar HTML/CSS workflow

**Nadelen:**
- ❌ Langzaamste rendering performance
- ❌ Hoogste memory gebruik
- ❌ Complexere setup en debugging
- ❌ Kan performance issues veroorzaken bij veel tekst

**Performance Metrics:**
- Rendering Speed: **Slow**
- Update Performance: **Medium**
- Memory Usage: **High**
- Styling Flexibility: **Very High**

### **🎯 Conclusie: Huidige Keuze is Correct**

Voor jouw gedichten applicatie is **Canvas Text (`Text`)** de juiste keuze omdat:

1. **Perfect voor literaire content** - Rich styling voor gedichten
2. **Google Fonts compatibility** - Geen conversie nodig
3. **Flexibele typography** - Font families, sizes, spacing, colors
4. **Goede performance** voor relatief statische gedicht tekst
5. **Balanced approach** tussen features en performance

---

## **Gedetailleerd Refactor Plan**

### **FASE 1: Fix Line-Level Font Overrides (Critical - 15 min)**

#### **File: `src/pages/CanvasPage/hooks/useTextStyles.js`**
```javascript
// TOEVOEGEN NA REGEL 108:
if (lineOverrides?.fontFamily) {
  styleProps.fontFamily = lineOverrides.fontFamily;
}

// UPDATE dependency array:
}, [baseStyle, lineOverrides, isSelected, isColorPickerActive]);
```

**Impact**: Direct werkende regel-selectie font changes

### **FASE 2: Titel/Auteur Font Override Systeem (Core - 60 min)**

#### **2A: State Management Updates**
**File: `src/pages/CanvasPage/hooks/useCanvasState.js`**
```javascript
// NIEUWE STATE TOEVOEGEN:
const [titleFontOverride, setTitleFontOverride] = useState(null);
const [authorFontOverride, setAuthorFontOverride] = useState(null);

// NIEUWE COMPUTED VALUES:
const effectiveTitleFont = useMemo(() => {
  return titleFontOverride || fontFamily;
}, [titleFontOverride, fontFamily]);

const effectiveAuthorFont = useMemo(() => {
  return authorFontOverride || fontFamily;
}, [authorFontOverride, fontFamily]);

const hasTitleFontOverride = useMemo(() => {
  return titleFontOverride !== null;
}, [titleFontOverride]);

const hasAuthorFontOverride = useMemo(() => {
  return authorFontOverride !== null;
}, [authorFontOverride]);
```

#### **2B: Handler Integration**
**File: `src/pages/CanvasPage/hooks/useCanvasHandlers.js`**
```javascript
// NIEUWE HANDLERS:
const handleTitleFontChange = useCallback((font) => {
  loadFont(font);
  setTitleFontOverride(font);
}, [loadFont, setTitleFontOverride]);

const handleAuthorFontChange = useCallback((font) => {
  loadFont(font);  
  setAuthorFontOverride(font);
}, [loadFont, setAuthorFontOverride]);

const handleResetTitleFont = useCallback(() => {
  setTitleFontOverride(null);
}, [setTitleFontOverride]);

const handleResetAuthorFont = useCallback(() => {
  setAuthorFontOverride(null);
}, [setAuthorFontOverride]);
```

#### **2C: TextStyles Integration**
**File: `src/pages/CanvasPage/hooks/useTextStyles.js`**
```javascript
// UPDATE useTextStyles function signature:
export function useTextStyles(
  fontLoaded,
  globalStyles,
  titleFont = "Cormorant Garamond", // NEW
  authorFont = "Cormorant Garamond"  // NEW
) {
  // UPDATE titleStyle and authorStyle:
  titleStyle: new PIXI.TextStyle({
    fill: baseTitleColor,
    fontSize: 48,
    fontFamily: titleFont, // CHANGED from hardcoded
    fontWeight: "bold",
  }),
  authorStyle: new PIXI.TextStyle({
    fill: baseAuthorColor,
    fontSize: 24,
    fontFamily: authorFont, // CHANGED from hardcoded  
    fontStyle: "italic",
  }),
}
```

### **FASE 3: Advanced Font Dialog Selector (Enhancement - 3 uur)**

#### **Component Structure:**
```
src/pages/CanvasPage/components/FontDialog/
├── FontDialog.jsx           // Main modal component
├── FontPreview.jsx          // Live font preview 
├── FontCategory.jsx         // Font categorization
├── FontSearch.jsx           // Search functionality
├── FontFavorites.jsx        // Favorites management
└── FontDialog.module.css    // Styling
```

#### **FontDialog Features:**
1. **Live Preview**: Real-time font rendering preview
2. **Categorization**: Serif, Sans-serif, Display, Monospace
3. **Search**: Real-time font name filtering
4. **Favorites**: User font favorites system
5. **Recent Fonts**: Recently used fonts history
6. **Google Fonts Integration**: Dynamic font loading

---

## **UI/UX Control Inrichting**

### **Enhanced Controls Layout Design**

#### **1. Hierarchical Font Controls**
```css
.fontControlSection {
  border-left: 3px solid #3b82f6;
  padding-left: 12px;
  margin: 16px 0;
}

.fontControlRow {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
}

.fontSelector {
  flex: 1;
  min-width: 140px;
}

.fontDialogTrigger {
  width: 36px;
  height: 36px;
  border-radius: 6px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  transition: transform 0.2s;
}

.fontDialogTrigger:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}
```

#### **2. Font Override Indicators**
```css
.fontOverrideIndicator {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #6b7280;
}

.overrideActive::before {
  content: "⚙️";
  font-size: 14px;
}

.globalActive::before {
  content: "🔗";
  font-size: 14px;
}
```

#### **3. Font Loading States**
```jsx
const FontLoadingIndicator = ({ fontStatus, fontName }) => {
  const status = fontStatus[fontName] || 'idle';
  
  return (
    <div className={`fontStatus fontStatus--${status}`}>
      {status === 'loading' && <LoadingSpinner size="small" />}
      {status === 'loaded' && <CheckIcon className="text-green-500" />}
      {status === 'error' && <ErrorIcon className="text-red-500" />}
    </div>
  );
};
```

#### **4. Responsive Font Controls**
```css
@media (max-width: 768px) {
  .fontControlRow {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }
  
  .fontDialogTrigger {
    width: 100%;
    height: 44px;
  }
  
  .fontSelector {
    min-width: unset;
  }
}
```

### **Advanced Font Dialog Design**

#### **Modal Structure:**
```jsx
const FontDialog = ({ isOpen, onClose, onFontSelect, targetType }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="large">
      <ModalHeader>
        <h2>Selecteer Lettertype</h2>
        <span className="targetIndicator">voor {targetType}</span>
      </ModalHeader>
      
      <ModalBody>
        <FontSearch onSearch={handleSearch} />
        <FontCategories selected={category} onChange={setCategory} />
        <FontFavorites favorites={favorites} onSelect={onFontSelect} />
        <FontGrid fonts={filteredFonts} onSelect={onFontSelect} />
      </ModalBody>
      
      <ModalFooter>
        <FontPreview selectedFont={selectedFont} previewText={previewText} />
        <div className="actions">
          <Button onClick={onClose}>Annuleren</Button>
          <Button primary onClick={() => onFontSelect(selectedFont)}>
            Toepassen
          </Button>
        </div>
      </ModalFooter>
    </Modal>
  );
};
```

---

## **Quick Wins Voor Text Performance**

### **1. Text Resolution Enhancement**
```javascript
// Verbeter text scherpte door font size te verdubbelen en schalen
const createHighResText = (text, baseStyle) => {
  const highResStyle = new PIXI.TextStyle({
    ...baseStyle,
    fontSize: baseStyle.fontSize * 2 // Double the font size
  });
  
  const textObject = new PIXI.Text(text, highResStyle);
  textObject.scale.set(0.5); // Scale down 50%
  
  return textObject;
};
```

### **2. Text Caching Strategy**
```javascript
// Cache frequently used text styles
const textStyleCache = new Map();

const getCachedTextStyle = (styleKey, styleConfig) => {
  if (!textStyleCache.has(styleKey)) {
    textStyleCache.set(styleKey, new PIXI.TextStyle(styleConfig));
  }
  return textStyleCache.get(styleKey);
};
```

### **3. Font Loading Optimization**
```javascript
// Preconnect to Google Fonts for faster loading
const addFontPreconnect = () => {
  const preconnect = document.createElement('link');
  preconnect.rel = 'preconnect';
  preconnect.href = 'https://fonts.googleapis.com';
  document.head.appendChild(preconnect);
  
  const gstatic = document.createElement('link');
  gstatic.rel = 'preconnect';
  gstatic.href = 'https://fonts.gstatic.com';
  gstatic.crossOrigin = '';
  document.head.appendChild(gstatic);
};
```

### **4. Selective Text Re-rendering**
```javascript
// Only update text when necessary
const useOptimizedTextUpdate = (textRef, content, style) => {
  const prevContent = useRef();
  const prevStyleHash = useRef();
  
  useEffect(() => {
    const styleHash = JSON.stringify(style);
    
    if (prevContent.current !== content || prevStyleHash.current !== styleHash) {
      if (textRef.current) {
        textRef.current.text = content;
        textRef.current.style = new PIXI.TextStyle(style);
      }
      
      prevContent.current = content;
      prevStyleHash.current = styleHash;
    }
  }, [content, style]);
};
```

### **5. Memory Management voor Fonts**
```javascript
// Cleanup unused font textures
const cleanupUnusedFonts = () => {
  // Remove unused font links from DOM
  const unusedLinks = document.querySelectorAll(
    'link[href*="fonts.googleapis.com"]:not([data-used="true"])'
  );
  
  unusedLinks.forEach(link => {
    if (!link.dataset.lastUsed || 
        Date.now() - parseInt(link.dataset.lastUsed) > 300000) { // 5 min
      link.remove();
    }
  });
};
```

---

## **PIXI.Assets Integration**

### **Wat is PIXI.Assets?**

PIXI.Assets is het moderne asset management systeem van PIXI.js v7+:
- **One-stop shop** voor alle resource management
- **Promise-based** moderne API (vervangt oude Loader)
- **Automatic format detection** en optimization
- **Caching system** met intelligent memory management
- **Bundle support** voor georganiseerde loading

### **PIXI.Assets vs Google Fonts: Wanneer Gebruiken?**

#### **✅ PIXI.Assets is Geschikt Voor:**

1. **Custom Font Files** (.ttf, .woff, .woff2)
```javascript
// Laden van custom fonts via PIXI.Assets
await Assets.init({ basePath: 'assets/fonts/' });

const customFont = await Assets.load('custom-font.woff2');
const titleStyle = new PIXI.TextStyle({
  fontFamily: 'CustomFont', // Font family name from file
  fontSize: 48
});
```

2. **Pre-bundled Font Collections**
```javascript
const fontBundle = {
  'game-fonts': [
    { alias: 'title-font', src: 'fonts/title.woff2' },
    { alias: 'body-font', src: 'fonts/body.woff2' },
    { alias: 'ui-font', src: 'fonts/ui.woff2' }
  ]
};

await Assets.addBundle('game-fonts', fontBundle);
const fonts = await Assets.loadBundle('game-fonts');
```

3. **Optimized Loading Strategies**
```javascript
// Background loading voor betere UX
Assets.backgroundLoad(['fonts/heading.woff2', 'fonts/body.woff2']);

// Later gebruik direct beschikbaar
const headingFont = await Assets.load('fonts/heading.woff2');
```

#### **❌ PIXI.Assets is NIET Geschikt Voor:**

1. **Google Fonts** - Deze blijven beter via CSS/HTML laden
2. **Dynamic font discovery** - Google Fonts API is hier beter voor
3. **Web font fallbacks** - Browser native loading is robuuster

### **Optimale Hybrid Approach voor Jouw Project:**

```javascript
// useFontManager.js - Enhanced versie
export function useFontManager() {
  const [fontStatus, setFontStatus] = useState({
    "Cormorant Garamond": "loaded"
  });
  
  // Google Fonts loading (huidige methode)
  const loadGoogleFont = useCallback((fontName) => {
    // Bestaande Google Fonts logic...
  }, []);
  
  // PIXI.Assets voor custom fonts (nieuwe feature)
  const loadCustomFont = useCallback(async (fontConfig) => {
    try {
      setFontStatus(prev => ({ ...prev, [fontConfig.name]: "loading" }));
      
      await Assets.load({
        alias: fontConfig.name,
        src: fontConfig.src,
        data: { fontFamily: fontConfig.name }
      });
      
      setFontStatus(prev => ({ ...prev, [fontConfig.name]: "loaded" }));
    } catch (error) {
      setFontStatus(prev => ({ ...prev, [fontConfig.name]: "error" }));
    }
  }, []);
  
  return {
    availableFonts: [...googleFonts, ...customFonts],
    fontStatus,
    loadGoogleFont,
    loadCustomFont
  };
}
```

### **PIXI.Assets Voordelen voor Toekomstige Features:**

1. **Premium Font Integration**
```javascript
// Voor premium font providers zoals Adobe Fonts
const premiumFonts = await Assets.loadBundle('premium-typography');
```

2. **Offline Font Support**
```javascript
// Fonts blijven beschikbaar offline
const cachedFonts = await Assets.load('offline-fonts.json');
```

3. **Performance Monitoring**
```javascript
// Built-in loading progress en performance metrics
Assets.onProgress.add((progress) => {
  console.log(`Font loading: ${progress * 100}%`);
});
```

### **Aanbeveling: Gefaseerde Implementatie**

**Fase 1** (Nu): Google Fonts via CSS (zoals je al doet)
**Fase 2** (Later): PIXI.Assets voor custom premium fonts
**Fase 3** (Toekomst): Hybrid systeem met beide methoden

---

## **Implementatie Roadmap**

### **Week 1: Core Functionality**
- [x] **Dag 1-2**: Fase 1 implementatie (15 min fix)
- [ ] **Dag 3-5**: Fase 2 implementatie (titel/auteur fonts)
- [ ] **Test**: Volledige font hierarchie werking

### **Week 2: UI Enhancement** 
- [ ] **Dag 1-3**: Font dialog component ontwikkeling
- [ ] **Dag 4-5**: UI integration en responsive design
- [ ] **Test**: Dialog functionaliteit en UX

### **Week 3: Performance & Polish**
- [ ] **Dag 1-2**: Quick wins implementatie
- [ ] **Dag 3-4**: Font loading optimization
- [ ] **Dag 5**: PIXI.Assets research en proof of concept

### **Week 4: Testing & Refinement**
- [ ] **Dag 1-2**: Comprehensive testing
- [ ] **Dag 3-4**: Bug fixes en performance tuning
- [ ] **Dag 5**: Documentation en code cleanup

### **Success Metrics:**
- ✅ Werkende font selectie op regel niveau
- ✅ Aparte font controls voor titel/auteur
- ✅ Professional font selector dialog
- ✅ Geen performance degradation
- ✅ Mobile responsive font controls
- ✅ Toegankelijke font loading states

### **Technical Debt Reduction:**
- Refactor font loading naar modern async/await patterns
- Consolidatie van font state management
- Verbetering van type safety (TypeScript types)
- Unit tests voor font loading logic

---

## **Conclusie**

Dit refactor plan voorziet in een complete, professionele font selection systeem dat:

1. **Direct werkt** - Fixes de immediate issues
2. **Schaalbaar is** - Ondersteunt toekomstige font features  
3. **Performant blijft** - Optimalisaties en best practices
4. **User-friendly is** - Intuïtieve UI en duidelijke feedback
5. **Maintainable is** - Clean architecture en documentatie

De focus op Canvas Text (`Text`) blijft correct voor jouw use case, met PIXI.Assets als future enhancement voor premium fonts. De font hierarchie matcht je bestaande kleur systeem en biedt dezelfde flexibiliteit en override mogelijkheden.

**Ready to implement? Start met Fase 1 voor de immediate fix!** 🚀