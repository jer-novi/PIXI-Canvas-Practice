# Sync All Fonts Feature - Implementatie Documentatie

## Overzicht

Dit document beschrijft de implementatie van de "Sync All Fonts" functionaliteit, die gebruikers in staat stelt om alle per-regel lettertype overrides te resetten naar het globale lettertype, met een automatische fallback naar "Montserrat" wanneer alle overrides zijn weggenomen.

## Feature Requirements

- **Sync knop**: Net zoals de "Sync Alle Kleuren" knop, maar dan voor lettertypes
- **Reset logica**: Verwijdert alle `fontFamily` overrides van individuele regels
- **Montserrat fallback**: Als alle regels zijn gereset, wordt het globale lettertype automatisch ingesteld op "Montserrat"
- **Minimale code**: Hergebruik van bestaande patterns voor color sync functionaliteit

## Implementatie Details

### 1. Handler Functie (useCanvasHandlers.js)

**Locatie**: `src/pages/CanvasPage/hooks/useCanvasHandlers.js:267-321`

```javascript
const handleSyncAllFontsToGlobal = useCallback(() => {
  // Count existing font overrides for confirmation
  const lineFontOverrides = Object.values(lineOverrides).filter(
    (override) => override.fontFamily
  ).length;

  if (lineFontOverrides === 0) {
    alert("Er zijn geen lettertype overrides om te resetten.");
    return;
  }

  // Simple confirmation dialog
  const confirmMessage =
    `Dit zal ${lineFontOverrides} lettertype override${
      lineFontOverrides === 1 ? "" : "s"
    } verwijderen:\n\n` +
    `• ${lineFontOverrides} gedichtregels lettertype override${
      lineFontOverrides === 1 ? "" : "s"
    }\n\n` +
    "Alle regels zullen het globale lettertype volgen. Doorgaan?";

  if (!confirm(confirmMessage)) {
    return;
  }

  // Reset all line font overrides to only keep non-font properties
  let allLinesReset = true;
  setLineOverrides((prev) => {
    const newOverrides = { ...prev };
    Object.keys(newOverrides).forEach((index) => {
      const override = { ...newOverrides[index] };
      delete override.fontFamily; // Remove font override

      // If no other overrides remain, remove the entire entry
      if (Object.keys(override).length === 0) {
        delete newOverrides[index];
      } else {
        newOverrides[index] = override;
        allLinesReset = false; // Still has other overrides
      }
    });
    return newOverrides;
  });

  // If all lines are reset, set global font to Montserrat
  if (allLinesReset) {
    loadFont("Montserrat");
    setPendingFontFamily("Montserrat");
  }
}, [
  lineOverrides,
  setLineOverrides,
  loadFont,
  setPendingFontFamily,
]);
```

**Belangrijke aspecten**:
- Gebruikt hetzelfde pattern als `handleSyncAllColorsToGlobal`
- Controleert of er daadwerkelijk font overrides zijn
- Toont confirmation dialog met aantal overrides
- Behoudt andere properties (zoals `fillColor`, `letterSpacing`) in `lineOverrides`
- Automatisch "Montserrat" instellen als fallback wanneer alle regels gereset zijn

### 2. UI Controls (Controls.jsx)

**Locatie**: `src/pages/CanvasPage/Controls.jsx:159-182`

```javascript
{/* Global Sync Section */}
<div className={styles.controlSection}>
  <h3>Globale Synchronisatie</h3>
  <div className={styles.controlRow}>
    <button
      type="button"
      className={styles.syncButton}
      onClick={onSyncAllColorsToGlobal}
      title="Synchroniseer alle kleuren met globale kleur (resets alle overrides)"
    >
      🔄 Sync Alle Kleuren
    </button>
  </div>
  <div className={styles.controlRow}>
    <button
      type="button"
      className={styles.syncButton}
      onClick={onSyncAllFontsToGlobal}
      title="Synchroniseer alle lettertypes met globaal lettertype (resets alle overrides)"
    >
      🔄 Sync Alle Fonts
    </button>
  </div>
</div>
```

**Belangrijke aspecten**:
- Hergebruik van bestaande `styles.syncButton` class
- Geplaatst in dezelfde sectie als color sync voor consistentie
- Hernoemd sectie naar "Globale Synchronisatie" om beide knoppen te omvatten
- Duidelijke tooltip met uitleg van functionaliteit

### 3. Props Wiring (CanvasPage.jsx)

**Locatie**: `src/pages/CanvasPage/CanvasPage.jsx:74-75`

```javascript
onSyncAllColorsToGlobal={handlers.handleSyncAllColorsToGlobal}
onSyncAllFontsToGlobal={handlers.handleSyncAllFontsToGlobal}
```

**Props definitie in Controls.jsx:37**:
```javascript
onSyncAllFontsToGlobal,
```

## Gebruikersflow

1. **Gebruiker klikt "🔄 Sync Alle Fonts"**
2. **System controleert** of er font overrides zijn
3. **Als geen overrides**: Alert "Er zijn geen lettertype overrides om te resetten"
4. **Als wel overrides**: Confirmation dialog met aantal te verwijderen overrides
5. **Bij bevestiging**: 
   - Verwijder alle `fontFamily` properties uit `lineOverrides`
   - Behoud andere properties (kleur, letterafstand)
   - Verwijder lege override entries volledig
6. **Fallback logic**: Als alle `lineOverrides` nu leeg zijn, stel globale font in op "Montserrat"

## Technical Considerations

### Font Loading
- Gebruikt bestaande `loadFont()` functie uit `useFontManager`
- `setPendingFontFamily()` zorgt voor proper state synchronisatie
- Font loading gebeurt asynchroon, UI update volgt automatisch via `useEffect` in `useCanvasState`

### State Management
- Hergebruik van bestaande `lineOverrides` state pattern
- Immutable state updates met proper dependency tracking
- useCallback voor performance optimization

### Error Handling
- Confirmation dialogs voorkomen onbedoelde resets
- Graceful handling van edge cases (geen overrides, loading states)
- Proper cleanup van lege override objects

## Bestanden Gewijzigd

| Bestand | Wijzigingen | Regels |
|---------|-------------|--------|
| `useCanvasHandlers.js` | Nieuwe `handleSyncAllFontsToGlobal` functie + export | +56 |
| `Controls.jsx` | Props definitie + UI knop | +2, +10 |
| `CanvasPage.jsx` | Props wiring | +1 |
| **Totaal** | | **+69 regels** |

## Pattern Consistency

Deze implementatie volgt exact hetzelfde pattern als de bestaande color sync functionaliteit:

- **Confirmation dialogs** met count van overrides
- **Selective property removal** (behoud andere override properties)  
- **Automatic cleanup** van lege override entries
- **Error handling** voor edge cases
- **UI placement** in dezelfde control section
- **Code organization** met dedicated handler functions

Dit zorgt voor een consistente gebruikerservaring en onderhoudbaarheid.