# CanvasPage Refactor Documentatie

## 📋 Overzicht

Deze documentatie beschrijft de refactor van `CanvasPage.jsx` van een monolithic bestand van 450+ regels naar een modulaire, onderhoudbare architectuur.

## 🎯 Doelstellingen

- **Separation of Concerns**: UI, State, en Business Logic scheiden
- **Reusability**: Hooks kunnen in andere componenten gebruikt worden
- **Maintainability**: Makkelijker om bugs te vinden en fixes toe te passen
- **Testability**: Individuele units kunnen apart getest worden

## 🏗️ Design Patterns Gebruikt

### 1. **Custom Hooks Pattern**
```javascript
// Voor state management
export function useCanvasState() {
  const [fontSize, setFontSize] = useState(36);
  // ... meer state
  return { fontSize, setFontSize, /* ... */ };
}

// Voor event handlers
export function useCanvasHandlers(canvasState) {
  const handleFontSizeChange = useCallback((newSize) => {
    // business logic
  }, [dependencies]);
  return { handleFontSizeChange, /* ... */ };
}
```
**Voordelen:**
- Reusable stateful logic
- Easy testing
- Clean component code
- Dependency management

### 2. **Container/Presentational Pattern**
```javascript
// Container Component (CanvasPage.jsx)
export default function CanvasPage() {
  const canvasState = useCanvasState();
  const handlers = useCanvasHandlers(canvasState);
  // Business logic hier

  return <CanvasContent {...props} />;
}

// Presentational Component (CanvasContent.jsx)
export function CanvasContent({ canvasWidth, fontSize, ... }) {
  // Alleen UI rendering
  return <pixiText text={currentPoem.title} style={titleStyle} />;
}
```
**Voordelen:**
- Clear separation of concerns
- Easier testing
- Better reusability

### 3. **Props Drilling vs Context Pattern**
```javascript
// Props drilling (huidige implementatie)
<CanvasContent
  titleColor={canvasState.titleColor}
  authorColor={canvasState.authorColor}
  // ... meer props
/>

// Alternatief: Context Pattern (voor toekomstige verbetering)
const CanvasContext = createContext();
```
**Huidige keuze:** Props drilling omdat:
- Explicit data flow
- Easy debugging
- Less abstraction overhead
- Clear component contracts

## 📁 Nieuwe Bestandsstructuur

```
src/pages/CanvasPage/
├── CanvasPage.jsx (114 regels - hoofdbestand)
├── components/
│   ├── CanvasContent.jsx (216 regels - rendering logica)
│   └── PoemLine.jsx (bestaande)
├── hooks/
│   ├── useCanvasState.js (55 regels - state management)
│   ├── useCanvasHandlers.js (110 regels - event handlers)
│   ├── useTextStyles.js (bijgewerkt - styling logica)
│   └── ... (andere bestaande hooks)
└── Controls.jsx (bijgewerkt - UI controls)
```

## 🔄 Data Flow

```
CanvasPage (Container)
├── useCanvasState (state management)
├── useCanvasHandlers (event handlers)
└── CanvasContent (Presentational)
    ├── useTextStyles (styling)
    ├── useResponsiveCanvas (layout)
    └── PIXI rendering
```

## 📊 Voor vs Na Vergelijking

| Aspect | Voor | Na |
|--------|------|----|
| **Bestandsgrootte** | 450+ regels in 1 bestand | 114 regels hoofdbestand |
| **Verantwoordelijkheden** | Gemengd | Gescheiden |
| **State Management** | Inline useState | Dedicated hook |
| **Event Handlers** | Inline useCallback | Dedicated hook |
| **Testbaarheid** | Moeilijk | Gemakkelijk |
| **Reusability** | Laag | Hoog |

## 🛠️ Implementatie Details

### State Management (useCanvasState.js)
```javascript
export function useCanvasState() {
  // UI State
  const [selectedLine, setSelectedLine] = useState(null);
  const [viewportDragEnabled, setViewportDragEnabled] = useState(false);

  // Text Styling State
  const [fontSize, setFontSize] = useState(36);
  const [fillColor, setFillColor] = useState("#ffffff");
  const [titleColor, setTitleColor] = useState("#ffffff");
  const [authorColor, setAuthorColor] = useState("#cccccc");

  // Refs
  const viewportRef = useRef(null);
  const contentRef = useRef(null);

  return {
    // Georganiseerde return object
    selectedLine, setSelectedLine,
    fontSize, setFontSize,
    viewportRef, contentRef,
    // ... alle state
  };
}
```

### Event Handlers (useCanvasHandlers.js)
```javascript
export function useCanvasHandlers(canvasState) {
  const { fontSize, setFontSize, selectedLine, setSelectedLine } = canvasState;

  const handleFontSizeChange = useCallback((newSize) => {
    handleFontSizeChangeUtil(newSize, {
      userHasAdjusted: canvasState.userHasAdjusted,
      lineHeightMultiplier: canvasState.lineHeightMultiplier,
      setFontSize,
      setLineHeight: canvasState.setLineHeight,
    });
  }, [canvasState.userHasAdjusted, canvasState.lineHeightMultiplier]);

  return {
    handleFontSizeChange,
    handleLineSelect,
    // ... alle handlers
  };
}
```

### Component Composition
```javascript
// CanvasPage.jsx - Container
export default function CanvasPage() {
  const canvasState = useCanvasState();
  const handlers = useCanvasHandlers(canvasState);
  const layout = useResponsiveCanvas();

  return (
    <ResponsiveLayout
      controls={<Controls {...canvasState} {...handlers} />}
      canvas={<CanvasContent {...canvasState} {...handlers} />}
    />
  );
}
```

## 🐛 Debugging & Error Handling

### Veelvoorkomende Issues

1. **ReferenceError: baseTitleColor is not defined**
   - **Oorzaak:** Variabele in dependency array maar niet in scope
   - **Oplossing:** Gebruik alleen `globalStyles` in dependency array

2. **Props niet doorgegeven**
   - **Oorzaak:** Nieuwe props niet toegevoegd aan component interfaces
   - **Oplossing:** Controleer alle component signatures

3. **State niet gesynchroniseerd**
   - **Oorzaak:** useEffect dependencies missen
   - **Oplossing:** Voeg alle relevante dependencies toe

### Best Practices

- **Dependency Arrays:** Wees expliciet over dependencies
- **Prop Types:** Gebruik TypeScript of PropTypes voor type safety
- **Error Boundaries:** Wrap components voor graceful error handling
- **Memoization:** Gebruik React.memo voor performance

## 🧪 Testing Strategy

### Unit Tests
```javascript
// useCanvasState.test.js
describe('useCanvasState', () => {
  it('should initialize with default values', () => {
    const { result } = renderHook(() => useCanvasState());
    expect(result.current.fontSize).toBe(36);
    expect(result.current.fillColor).toBe("#ffffff");
  });
});

// useCanvasHandlers.test.js
describe('useCanvasHandlers', () => {
  it('should handle font size change', () => {
    const mockState = { fontSize: 36, setFontSize: jest.fn() };
    const { result } = renderHook(() => useCanvasHandlers(mockState));

    act(() => {
      result.current.handleFontSizeChange(48);
    });

    expect(mockState.setFontSize).toHaveBeenCalledWith(48);
  });
});
```

### Integration Tests (Playwright)
```javascript
// canvas-interactions.spec.js
test('should change poem title color', async ({ page }) => {
  await page.goto('/canvas');

  // Click title color picker
  await page.locator('[data-testid="title-color-picker"]').click();

  // Select red color
  await page.locator('[data-testid="color-red"]').click();

  // Verify title color changed
  await expect(page.locator('.poem-title')).toHaveCSS('color', 'rgb(255, 0, 0)');
});
```

## 🚀 Performance Optimalisaties

### Memoization
```javascript
// useTextStyles.js
return useMemo(() => {
  // Expensive style calculations
  return { titleStyle, authorStyle, lineStyle };
}, [fontLoaded, fontFamily, globalStyles]);
```

### Component Memoization
```javascript
// CanvasContent.jsx
export const CanvasContent = React.memo(function CanvasContent(props) {
  // Component logic
});
```

### State Updates
- Gebruik functionele updates voor state gebaseerd op vorige state
- Batch gerelateerde state updates
- Gebruik useCallback voor event handlers

## 🔮 Toekomstige Verbeteringen

### Mogelijke Refactors
1. **Context Pattern:** Voor diepere component trees
2. **State Machines:** XState voor complexe state flows
3. **Recoil/Zustand:** Voor global state management
4. **React Query:** Voor server state

### Feature Additions
1. **Undo/Redo:** Voor styling changes
2. **Presets:** Voor styling templates
3. **Export/Import:** Voor styling configurations
4. **Real-time Collaboration:** Voor multi-user editing

## 📚 Leerpunten

### React Best Practices
- **Single Responsibility Principle:** Elk component/hook heeft één verantwoordelijkheid
- **DRY (Don't Repeat Yourself):** Hergebruikbare logica in custom hooks
- **Explicit Dependencies:** Wees duidelijk over useEffect/useMemo dependencies
- **Performance First:** Memoize dure berekeningen

### Code Organization
- **Logical Grouping:** Gerelateerde functionaliteit bij elkaar
- **Clear Naming:** Beschrijvende namen voor hooks en componenten
- **Documentation:** Commentaren voor complexe logica
- **Consistent Patterns:** Gebruik dezelfde patterns door de codebase

### Testing Philosophy
- **Test Behavior, Not Implementation:** Test wat de gebruiker ziet
- **Integration Tests:** Test component interacties
- **Mock External Dependencies:** PIXI, canvas APIs
- **Continuous Integration:** Automatische tests bij elke commit

---

*Deze refactor toont hoe een monolithic component opgesplitst kan worden in onderhoudbare, testable, en herbruikbare units met behoud van alle functionaliteit.*