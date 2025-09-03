# Implementatie van Individuele Lijn Letterafstand Functionaliteit

## 🎯 Probleemstelling

De gebruiker wilde de mogelijkheid om voor individuele regels de letterafstand aan te kunnen passen, net zoals dat al mogelijk was voor kleuren. De bestaande implementatie had echter UI-problemen:
- De slider bewoog niet mee bij individuele lijn-selectie
- De pixel-waarde bleef hangen op de globale waarde
- Er was geen manier om globale aanpassingen toe te passen na individuele wijzigingen

## 🔍 Analyse van Bestaande Patronen

### Huidige Kleur Systeem
Het bestaande kleur-systeem volgde dit patroon:

1. **State Management**: `lineOverrides` object slaat per-lijn overrides op
2. **Handler Functie**: `handleLineColorChange` in `useCanvasHandlers.js`
3. **UI Component**: Adaptieve controls in `Controls.jsx` die gedrag aanpassen op lijn-selectie
4. **Rendering**: `useLineStyle` hook past overrides toe op basis van selectie

### Infrastructuur die Al Beschikbaar Was
- `lineOverrides` state structuur
- `useLineStyle` hook met `lineOverrides.letterSpacing` ondersteuning
- Basis `letterSpacing` state management
- UI componenten voor sliders en controls

## 📋 Implementatie Stappen

### Stap 1: Handler Functie Toevoegen

**Bestand**: `src/pages/CanvasPage/hooks/useCanvasHandlers.js`

```javascript
// Line letter spacing change for selected line
const handleLineLetterSpacingChange = useCallback((spacing) => {
  if (selectedLine !== null) {
    setLineOverrides(prev => ({
      ...prev,
      [selectedLine]: {
        ...prev[selectedLine],
        letterSpacing: spacing
      }
    }));
  }
}, [selectedLine, setLineOverrides]);
```

**Waarom deze aanpak?**
- Volgt exact hetzelfde patroon als `handleLineColorChange`
- Gebruikt dezelfde `lineOverrides` state structuur
- Callback optimalisatie met `useCallback` en dependencies

### Stap 2: Handler Exporteren

```javascript
return {
  // ... andere handlers
  handleLineLetterSpacingChange,
  // ... andere handlers
};
```

### Stap 3: UI Component Uitbreiden

**Bestand**: `src/pages/CanvasPage/Controls.jsx`

#### Props Uitbreiden
```javascript
export default function Controls({
  // ... bestaande props
  onLineLetterSpacingChange,    // NIEUW
  lineOverrides,               // NIEUW
  // ... andere props
}) {
```

#### Huidige Letterafstand Berekenen
```javascript
// Calculate current letter spacing value (global or line-specific)
const currentLetterSpacing = selectedLine !== null
  ? (lineOverrides?.[selectedLine]?.letterSpacing ?? letterSpacing)
  : letterSpacing;
```

**Waarom deze logica?**
- `??` operator zorgt voor fallback naar globale waarde als lijn geen override heeft
- Dynamische berekening zorgt voor correcte UI feedback

#### Adaptieve Slider Implementatie
```javascript
<div className={`${styles.controlRow} ${selectedLine !== null ? styles.controlColumn : ""}`}>
  <label htmlFor="letterSpacing">
    {selectedLine !== null
      ? `Lijn ${selectedLine + 1} Letterafstand`
      : "Letterafstand"}
  </label>
  <div className={styles.spacingControls}>
    <input
      type="range"
      id="letterSpacing"
      min="-5"
      max="15"
      value={`${currentLetterSpacing}`}  // Gebruikt berekende waarde
      onChange={(e) => {
        const newSpacing = Number(e.target.value);
        if (selectedLine !== null) {
          onLineLetterSpacingChange(newSpacing);
        } else {
          onLetterSpacingChange(newSpacing);
        }
      }}
    />
    <span>{currentLetterSpacing}px</span>
    {/* ... hint text en controls */}
  </div>
</div>
```

### Stap 4: "Apply Globally" Functionaliteit

#### Handler Toevoegen
```javascript
// Apply global letter spacing to all lines (reset all individual overrides)
const handleApplyGlobalLetterSpacing = useCallback(() => {
  setLineOverrides(prev => {
    const next = { ...prev };
    // Remove all letterSpacing overrides from all lines
    Object.keys(next).forEach(lineIndex => {
      if (next[lineIndex]?.letterSpacing !== undefined) {
        const { letterSpacing, ...rest } = next[lineIndex];
        if (Object.keys(rest).length === 0) {
          delete next[lineIndex];
        } else {
          next[lineIndex] = rest;
        }
      }
    });
    return next;
  });
}, [setLineOverrides]);
```

#### Voorwaardelijke Button
```javascript
// Check if there are any letter spacing overrides
const hasLetterSpacingOverrides = lineOverrides &&
  Object.values(lineOverrides).some(override => override?.letterSpacing !== undefined);

// Button alleen tonen als er overrides zijn EN geen lijn geselecteerd
{selectedLine === null && hasLetterSpacingOverrides && (
  <div className={styles.lineControls}>
    <button
      type="button"
      className={styles.resetButton}
      onClick={onApplyGlobalLetterSpacing}
    >
      Pas globaal toe
    </button>
  </div>
)}
```

### Stap 5: Componenten Verbinden

**Bestand**: `src/pages/CanvasPage/CanvasPage.jsx`

```javascript
<Controls
  // ... bestaande props
  onLineLetterSpacingChange={handlers.handleLineLetterSpacingChange}
  onApplyGlobalLetterSpacing={handlers.handleApplyGlobalLetterSpacing}
  lineOverrides={canvasState.lineOverrides}
  // ... andere props
/>
```

## 🧪 Testing Aanpak

1. **Functionele Test**: Controleer of letters dichter/bij elkaar bewegen bij slider beweging
2. **UI Feedback Test**: Controleer of slider positie en pixel-waarde updaten bij lijn-selectie
3. **State Management Test**: Controleer of `lineOverrides` correct wordt bijgewerkt
4. **Apply Globally Test**: Controleer of alle overrides worden verwijderd en alle lijnen synchroon bewegen

## 🔑 Belangrijke Concepten

### 1. State Structuur
```javascript
lineOverrides = {
  0: { letterSpacing: 2, fillColor: "#ff0000" },  // Lijn 1
  2: { letterSpacing: -1 },                       // Lijn 3
  // ... andere lijnen zonder overrides volgen globale instellingen
}
```

### 2. Fallback Pattern
```javascript
const currentValue = selectedLine !== null
  ? (lineOverrides?.[selectedLine]?.property ?? globalValue)
  : globalValue;
```

### 3. Clean State Management
```javascript
// Alleen relevante overrides behouden
if (Object.keys(rest).length === 0) {
  delete next[lineIndex];  // Volledig verwijderen als leeg
} else {
  next[lineIndex] = rest;  // Alleen andere overrides behouden
}
```

### 4. UI State Afhankelijkheden
- Component styling: `selectedLine !== null ? styles.controlColumn : ""`
- Label tekst: Dynamisch gebaseerd op selectie
- Button zichtbaarheid: Gebaseerd op overrides aanwezigheid

## 🎯 Design Principles Toegepast

1. **DRY (Don't Repeat Yourself)**: Hergebruikte bestaande `lineOverrides` structuur
2. **Consistentie**: Exact hetzelfde patroon als kleur-systeem
3. **Separation of Concerns**: State, handlers, en UI gescheiden
4. **Progressive Enhancement**: Basis functionaliteit eerst, daarna extra features
5. **User Feedback**: Directe visuele feedback voor alle acties

## 🚀 Uitbreidingsmogelijkheden

Deze implementatie maakt het eenvoudig om vergelijkbare functionaliteit toe te voegen voor:
- Font size per lijn
- Font weight per lijn
- Andere tekst styling properties

Het patroon kan eenvoudig worden uitgebreid door:
1. Nieuwe handler functie toevoegen
2. Property toevoegen aan `lineOverrides`
3. UI component uitbreiden met nieuwe controls
4. `useLineStyle` hook uitbreiden met nieuwe property

## 📚 Leerpunten

1. **Patroon Herkenning**: Bestaande code analyseren om consistente patronen te identificeren
2. **State Design**: Hoe complexe state structuren te ontwerpen voor flexibiliteit
3. **UI State Sync**: Hoe UI componenten synchroon te houden met onderliggende state
4. **Callback Optimization**: Wanneer en hoe `useCallback` te gebruiken
5. **Conditional Rendering**: Complexe voorwaarden voor UI elementen

Deze implementatie toont hoe je met minimale boilerplate krachtige, herbruikbare functionaliteit kunt toevoegen door bestaande patronen te volgen en slim gebruik te maken van React hooks en state management.