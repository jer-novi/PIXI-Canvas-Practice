# Multiselect Functionaliteit Analyse & Implementatieplan

## 🎯 Probleemstelling

De gebruiker wil multiselect functionaliteit toevoegen met Shift+click om meerdere regels tegelijk te kunnen selecteren en uniform kleur en letterafstand aan te kunnen passen.

## 📊 Huidige Architectuur Analyse

### Current State Management
```javascript
// Huidig: Enkele selectie
const [selectedLine, setSelectedLine] = useState(null); // number | null

// Beschikbaar: Multiselect hook (niet gebruikt)
const [selectedElements, setSelectedElements] = useState(new Set());
```

### Current Flow
1. **Gebruiker klikt** → `PoemLine.onSelect()` → `handleLineSelect(index)`
2. **State update** → `setSelectedLine(index)`
3. **Re-render** → `isSelected={selectedLine === index}`
4. **Styling** → `useLineStyle()` past selectie styling toe

### Current Event Handling
```javascript
// PoemLine component
const handlePointerDown = (event) => {
  event.stopPropagation();
  if (onSelect) {
    onSelect(event); // Alleen index, geen event info
  }
};
```

## 🔄 Implementatie Opties

### Optie 1: Uitbreiden van Huidige Architectuur (Aanbevolen)
**Voordelen:**
- ✅ Minimale breaking changes
- ✅ Backward compatibility
- ✅ Gebruiksvriendelijk
- ✅ Stap-voor-stap implementeerbaar

**Implementatie:**
```javascript
// State uitbreiding
const [selectedLines, setSelectedLines] = useState([]); // number[]
const [lastSelectedIndex, setLastSelectedIndex] = useState(null);

// Event handling uitbreiding
const handleLineSelect = (index, event) => {
  if (event.shiftKey && lastSelectedIndex !== null) {
    // Range select
    const start = Math.min(lastSelectedIndex, index);
    const end = Math.max(lastSelectedIndex, index);
    const range = Array.from({length: end - start + 1}, (_, i) => start + i);
    setSelectedLines(range);
  } else {
    // Single select
    setSelectedLines([index]);
    setLastSelectedIndex(index);
  }
};
```

### Optie 2: Vervangen door Bestaande useSelection Hook
**Voordelen:**
- ✅ Robuuste, geteste multiselect logica
- ✅ Ondersteunt verschillende selectie modes

**Nadelen:**
- ❌ Breaking change voor alle componenten
- ❌ Grootschalige refactoring nodig
- ❌ Complexere migratie

### Optie 3: Hybride Aanpak
**State:**
```javascript
const [selectedLines, setSelectedLines] = useState([]);
const [selectionMode, setSelectionMode] = useState('single'); // 'single' | 'multiple'
```

## 📋 Gedetailleerd Implementatieplan

### Fase 1: Core State & Logic (2-3 uur)

#### 1.1 State Uitbreiding
**Bestand:** `src/pages/CanvasPage/hooks/useCanvasState.js`
```javascript
// Nieuwe state toevoegen
const [selectedLines, setSelectedLines] = useState([]);
const [lastSelectedIndex, setLastSelectedIndex] = useState(null);
const [selectionMode, setSelectionMode] = useState('single'); // Voor toekomstige uitbreiding
```

#### 1.2 Handler Uitbreiding
**Bestand:** `src/pages/CanvasPage/hooks/useCanvasHandlers.js`
```javascript
const handleLineSelect = useCallback((index, event) => {
  if (event?.shiftKey && lastSelectedIndex !== null && selectionMode === 'multiple') {
    // Range selection
    const start = Math.min(lastSelectedIndex, index);
    const end = Math.max(lastSelectedIndex, index);
    const range = Array.from({length: end - start + 1}, (_, i) => start + i);
    setSelectedLines(range);
  } else if (event?.ctrlKey || event?.metaKey) {
    // Toggle selection
    setSelectedLines(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index].sort((a, b) => a - b)
    );
    setLastSelectedIndex(index);
  } else {
    // Single selection
    setSelectedLines([index]);
    setLastSelectedIndex(index);
  }
}, [lastSelectedIndex, selectionMode, setSelectedLines, setLastSelectedIndex]);
```

#### 1.3 Event Handling Update
**Bestand:** `src/pages/CanvasPage/components/poemLine.jsx`
```javascript
const handlePointerDown = (event) => {
  event.stopPropagation();
  if (onSelect) {
    onSelect(index, event); // Index + event object doorgeven
  }
};
```

### Fase 2: Component Updates (1-2 uur)

#### 2.1 CanvasContent.jsx
```javascript
// Props aanpassen
selectedLines,        // Array in plaats van selectedLine
onLineSelect,         // Event object verwacht

// Rendering aanpassen
{currentPoem.lines.map((line, index) => (
  <PoemLine
    key={index}
    // ... andere props
    isSelected={selectedLines.includes(index)}  // Array check
    onSelect={(event) => onLineSelect(index, event)}  // Event doorgeven
  />
))}
```

#### 2.2 CanvasPage.jsx
```javascript
// State doorgeven
selectedLines={canvasState.selectedLines}
onLineSelect={handlers.handleLineSelect}
```

### Fase 3: UI Controls Update (1 uur)

#### 3.1 Controls.jsx
```javascript
// Props aanpassen
selectedLines,  // Array in plaats van selectedLine

// Dynamic label
{selectedLines.length > 1
  ? `${selectedLines.length} regels geselecteerd`
  : selectedLines.length === 1
  ? `Lijn ${selectedLines[0] + 1} ...`
  : "Globale ..."
}

// Handlers aanpassen voor arrays
const handleLineColorChange = (color) => {
  selectedLines.forEach(lineIndex => {
    // Apply to each selected line
  });
};
```

### Fase 4: Styling & Visualisatie (30 min)

#### 4.1 useLineStyle Hook
```javascript
// Ondersteuning voor array isSelected
const isSelected = Array.isArray(isSelected)
  ? isSelected.includes(lineIndex)
  : isSelected === lineIndex;
```

#### 4.2 Visual Feedback
- Meerdere regels tegelijk highlighten
- Selection counter tonen
- Range indicator (bijv. "Regels 3-7 geselecteerd")

## 🎛️ Geavanceerde Features

### Range Selection UI
```javascript
// Selection info in Controls
{selectedLines.length > 1 && (
  <div className={styles.selectionInfo}>
    <span>{selectedLines.length} regels geselecteerd</span>
    <span>({Math.min(...selectedLines) + 1}-{Math.max(...selectedLines) + 1})</span>
    <button onClick={() => setSelectedLines([])}>Alles deselecteren</button>
  </div>
)}
```

### Keyboard Shortcuts
```javascript
useEffect(() => {
  const handleKeyDown = (event) => {
    if (event.key === 'Escape') {
      setSelectedLines([]);
    }
    if (event.key === 'a' && event.ctrlKey) {
      // Select all
      setSelectedLines(Array.from({length: poem.lines.length}, (_, i) => i));
    }
  };
}, []);
```

## ⚡ Complexiteit Assessment

### 🍏 Lage Complexiteit (Aanbevolen Aanpak)
- **Tijd:** 4-6 uur
- **Risico:** Laag (geen breaking changes)
- **Voordelen:** Incrementaal, backwards compatible
- **Aandachtspunten:** State management consistent houden

### 🍊 Middelmatige Complexiteit (useSelection Hook)
- **Tijd:** 8-12 uur
- **Risico:** Middelmatig (breaking changes)
- **Voordelen:** Robuust, toekomstbestendig
- **Aandachtspunten:** Alle componenten updaten

### 🔴 Hoge Complexiteit (Volledig Nieuwe Architectuur)
- **Tijd:** 16+ uur
- **Risico:** Hoog
- **Voordelen:** Perfect ontwerp
- **Aandachtspunten:** Alles moet tegelijk werken

## 🚀 Uitbreidingsmogelijkheden

### Batch Operations
```javascript
// Apply to all selected lines
const applyToSelectedLines = (property, value) => {
  const updates = {};
  selectedLines.forEach(index => {
    updates[index] = { ...lineOverrides[index], [property]: value };
  });
  setLineOverrides(prev => ({ ...prev, ...updates }));
};
```

### Selection Presets
```javascript
const selectionPresets = {
  evenLines: lines.filter((_, i) => i % 2 === 0),
  oddLines: lines.filter((_, i) => i % 2 === 1),
  firstHalf: lines.slice(0, Math.floor(lines.length / 2)),
  secondHalf: lines.slice(Math.floor(lines.length / 2))
};
```

## 📈 Implementatie Aanbeveling

**Start met Optie 1** (lage complexiteit) omdat:

1. **Snelle Winst:** Basis multiselect werkt binnen uren
2. **Gebruiker Feedback:** Directe validatie van concept
3. **Iteratieve Verbetering:** Kan later uitbreiden naar complexere features
4. **Risico Minimalisatie:** Geen grote refactoring nodig

**Stappenplan:**
1. ✅ Core multiselect logica implementeren
2. ✅ UI controls aanpassen
3. ✅ Testing en refinements
4. 🔄 Optioneel: Geavanceerde features toevoegen

Deze aanpak geeft je werkende multiselect functionaliteit met minimale complexiteit en maximale flexibiliteit voor toekomstige uitbreidingen.