# 21. XYMoveSliders Feature Implementation

## Probleem

Het navigeren en positioneren van canvas elementen was beperkt tot vaste controls. Er was behoefte aan een flexibele XY slider die gebruikers in staat stelt om direct de X- en
Y-positie van geselecteerde lijnen te wijzigen, met drag support en een toggle voor zichtbaarheid.

## Oplossing

Introductie van de XYMoveSliders component, een state-driven UI element waarmee gebruikers X- en Y-waarden kunnen aanpassen via sliders en direct kunnen slepen. De sliders zijn
zichtbaar in specifieke modes en kunnen via keyboard shortcuts worden gefocust.

## Technische Implementatie

### 1. XYMoveSliders Component

**Bestand**: `src/pages/CanvasPage/components/XYMoveSliders.jsx`

- Rendered conditioneel op basis van state (moveMode, xySlidersVisible)
- Drag support via mouse events
- Focus callback voor keyboard shortcut integratie

### 2. Styling en Positionering

**Bestand**: `src/pages/CanvasPage/components/XYMoveSliders.module.css`

- Flexibele layout voor sliders
- Responsive design voor verschillende schermgroottes

### 3. State Management

**Bestand**: `src/pages/CanvasPage/hooks/useCanvasState.js`

- `isDragging` state voor synchronisatie met CanvasContent
- `xySlidersVisible` toggle via UI en keyboard shortcut

### 4. Keyboard Shortcut Integratie

**Bestand**: `src/pages/CanvasPage/hooks/useKeyboardShortcuts.js`

- Alt+J shortcut om XYMoveSliders te focussen
- Callback naar component voor auto-focus

### 5. CanvasContent Integratie

**Bestand**: `src/pages/CanvasPage/components/CanvasContent.jsx`

- State updates bij drag events
- Gebruik van xOffset en yOffset voor compatibiliteit

### 6. CanvasPage Integratie

**Bestand**: `src/pages/CanvasPage/CanvasPage.jsx`

- XYMoveSliders component toegevoegd aan render flow
- Props voor state en event handlers

## Functionaliteitsflow

```
1. User activeert moveMode → xySlidersVisible wordt true
2. XYMoveSliders renderen in UI
3. User sleept sliders of gebruikt drag → x/y waarden worden aangepast
4. Keyboard shortcut (Alt+J) → XYMoveSliders krijgen focus
5. State updates synchroniseren met CanvasContent
```

## Error Handling & Edge Cases

- **Drag Events**: Mouse events correct afgevangen, geen state leakage
- **Visibility Toggle**: Alleen zichtbaar in relevante modes
- **Focus Handling**: Callback fallback bij ontbrekende ref
- **Responsive**: Layout past zich aan bij kleine schermen

## Gebruikerservaring

### Voor Implementatie

```
- Geen directe XY controls
- Positionering alleen via vaste knoppen
```

### Na Implementatie

```
- Directe XY sliders met drag support
- Keyboard shortcut voor snelle toegang
- Responsive en intuïtieve UI
```

## Code Locaties

1. **XYMoveSliders.jsx**: Hoofdcomponent
2. **XYMoveSliders.module.css**: Styling
3. **useCanvasState.js**: State management
4. **useKeyboardShortcuts.js**: Shortcut integratie
5. **CanvasContent.jsx**: State updates
6. **CanvasPage.jsx**: Component integratie

## Testing & Verificatie

- **Drag Test**: Sliders reageren op mouse events
- **Visibility Test**: Toggle werkt correct
- **Keyboard Shortcut Test**: Alt+J focust sliders
- **State Sync Test**: x/y waarden worden correct doorgegeven
- **Responsive Test**: Layout werkt op mobile/tablet

## Toekomstige Uitbreidingen

- **Customizable Sliders**: Range en step instelbaar
- **Touch Support**: Verbeterde mobile drag
- **Animation**: Smooth transitions bij waarde-aanpassing
- **Global State**: Context API voor bredere synchronisatie

