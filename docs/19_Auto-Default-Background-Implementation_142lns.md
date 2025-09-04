# 19. Auto Default Background Implementation

## Probleem
De applicatie startte met een zwart scherm in plaats van direct een achtergrond te tonen. Gebruikers moesten handmatig een achtergrond kiezen uit de Pexels collection. De gewenste functionaliteit was om automatisch foto 2 uit de Pexels collection als default achtergrond in te stellen bij app startup.

## Oplossing
Implementatie van een auto-loading systeem dat foto 2 uit de Pexels collection automatisch als achtergrond instelt zodra de collection is geladen, zonder gebruikersinteractie.

## Technische Implementatie

### 1. Callback Prop Toevoegen aan usePexels

**Bestand**: `src/pages/CanvasPage/hooks/usePexels.js`

```javascript
// Voor
export function usePexels() {

// Na  
export function usePexels(onDefaultBackground = null) {
```

De hook accepteert nu een callback functie die wordt aangeroepen wanneer een default achtergrond moet worden ingesteld.

### 2. Auto-Set Logica in Collection Loading

**Bestand**: `src/pages/CanvasPage/hooks/usePexels.js:62-66`

```javascript
// Auto-set foto 2 (index 1) als default achtergrond bij eerste collection load
if (!collectionLoadedRef.current && onDefaultBackground && photosData.length >= 2) {
    const defaultPhoto = photosData[1]; // Foto 2 (0-indexed)
    onDefaultBackground(defaultPhoto.src.large2x);
}
```

**Condities voor auto-set**:
- `!collectionLoadedRef.current`: Alleen bij eerste collection load, niet bij paginering
- `onDefaultBackground`: Callback functie is beschikbaar  
- `photosData.length >= 2`: Collectie heeft minimaal 2 foto's
- `photosData[1]`: Foto 2 wordt geselecteerd (0-indexed array)

### 3. Callback Verbinden met State Management

**Bestand**: `src/pages/CanvasPage/hooks/useCanvasState.js:39`

```javascript
// Voor
const pexels = usePexels(); 

// Na
const pexels = usePexels(setBackgroundImage); // Auto-set foto 2 als default achtergrond
```

**Belangrijk**: State declaratie volgorde gefixed:
```javascript
// State EERST declareren
const [backgroundImage, setBackgroundImage] = useState(null);

// Dan hooks die state gebruiken
const pexels = usePexels(setBackgroundImage);
```

## Functionaliteitsflow

### App Startup Sequence
```
1. useCanvasState start → backgroundImage: null (zwart scherm)
2. usePexels(setBackgroundImage) → Pexels collection API call  
3. Collection API response → 15 foto's geladen
4. Auto-trigger condities OK → onDefaultBackground(photos[1].src.large2x)
5. setBackgroundImage(foto2_url) → State update
6. BackgroundImage component re-render → Foto 2 zichtbaar
7. Font loading (parallel) → Tekst verschijnt over achtergrond
```

### Timing & Performance
- **Parallel Loading**: Achtergrond en fonts laden onafhankelijk
- **Non-blocking**: Font loading blokkeert achtergrond niet  
- **Instant Display**: Achtergrond verschijnt zodra API response binnen is
- **No User Action**: Volledig automatisch bij app startup

## Error Handling & Edge Cases

### Veiligheidscontroles
- **API Failures**: Alleen bij succesvolle collection response
- **Empty Collection**: Check `photosData.length >= 2`  
- **Missing Callback**: Check `onDefaultBackground` bestaat
- **Duplicate Calls**: `collectionLoadedRef` voorkomt herhaling

### Fallback Behavior  
- **< 2 foto's**: Geen auto-set, blijft zwart scherm
- **API error**: Geen auto-set, gebruiker kan handmatig kiezen
- **Missing foto 2**: Geen auto-set, veilige fallback

## Gebruikerservaring

### Voor Implementatie
```
App start → Zwart scherm → Gebruiker moet handmatig achtergrond kiezen
```

### Na Implementatie  
```
App start → Kort zwart scherm → Foto 2 verschijnt automatisch → Tekst laadt
```

### Voordelen
- ✅ **Directe visuele feedback**: Geen leeg scherm meer
- ✅ **Geen user action nodig**: Automatische setup
- ✅ **Consistente ervaring**: Altijd foto 2 als default  
- ✅ **Performance**: Parallel loading van assets
- ✅ **Graceful fallback**: Veilige error handling

## Code Locaties

### Gewijzigde Bestanden
1. **usePexels.js**: Callback prop + auto-set logica
2. **useCanvasState.js**: Callback verbinding + state ordering

### Gerelateerde Componenten  
- **BackgroundImage.jsx**: Renders de auto-set achtergrond
- **CanvasContent.jsx**: Ontvangt backgroundImage prop
- **CanvasPage.jsx**: Hoofdcomponent die alles verbindt

## Testing & Verificatie

### Test Scenario's
1. **Fresh App Load**: Foto 2 verschijnt automatisch
2. **Collection < 2 foto's**: Geen auto-set, veilige fallback
3. **API Failure**: Geen auto-set, handmatige selectie mogelijk
4. **Page Navigation**: Auto-set alleen bij eerste load

### Debug Verificatie
```javascript
// Test auto-set logica
const isFirstLoad = !collectionLoadedRef.current; // true
const hasCallback = !!onDefaultBackground; // true  
const hasEnoughPhotos = photosData.length >= 2; // true
// Result: ✅ onDefaultBackground(photos[1].src.large2x) called
```

## Toekomstige Uitbreidingen

### Configuratie Opties
- **Customizable Index**: Niet alleen foto 2, maar configureerbaar
- **User Preferences**: Onthouden van gekozen default
- **Collection Rotation**: Verschillende defaults per sessie

### Performance Optimalisaties  
- **Preloading**: Foto 2 vooraf laden
- **Caching**: Browser cache optimalisatie
- **Lazy Loading**: Andere foto's pas bij behoefte