# Revisie en Analyse: Implementatie van Drag-and-Drop Functionaliteit

Dit document beschrijft de pogingen om een click-and-drag functionaliteit te implementeren, de problemen die daarbij zijn opgetreden, en een aanbevolen strategie voor een succesvolle implementatie.

## Deel 1: Overdracht voor een Volgende Agent

### Doelstelling

De primaire taak was het implementeren van een drag-and-drop systeem voor een Pixi.js-canvas binnen een React-applicatie. Dit omvatte:
1.  **Global Move**: Het hele gedicht verslepen als één geheel.
2.  **Line Move**: Geselecteerde regels als een groep verslepen.
3.  **Keyboard Shortcuts**: Modi wisselen met de spatiebalk.
4.  **Synchronisatie**: De drag-interactie moest worden gesynchroniseerd met de bestaande UI-sliders.

### Pogingen en Ondervonden Problemen

#### Poging 1: `usePixiDrag` Hook en State Management

De eerste strategie was gebaseerd op het creëren van een generieke `usePixiDrag` hook die de drag-logica zou isoleren.

**Aanpak:**
- Een `usePixiDrag` hook werd geïmplementeerd die luisterde naar `pointerdown`, `globalpointermove` en `pointerup` events.
- Deze hook werd toegepast op de `contentRef` (gedichtcontainer) in `poem` modus en op de `app.stage` in `line` modus.
- De berekende `delta` (verplaatsing) werd gebruikt om de state (`poemPositionDelta` en `linePositionDelta`) bij te werken, die op zijn beurt de positie van de PIXI-objecten en de sliders aanstuurde.

**Fouten en Problemen:**
1.  **`TypeError: Cannot read properties of null (reading 'on')`**: De meest hardnekkige fout. Deze trad op omdat de `usePixiDrag` hook werd uitgevoerd voordat de `app.stage` of de `target.parent` beschikbaar waren (ze waren `null` bij de eerste render). Hierdoor mislukte het toevoegen van de globale event listeners (`.on('pointermove', ...)`).
2.  **Parent Onbereikbaar**: De kern van het probleem is dat de `app.stage` geen `.parent` heeft. De logica die probeerde `target.parent` te gebruiken om globale listeners toe te voegen, faalde systematisch wanneer `app.stage` het doelwit was. De fallback `target.parent || target` was onvoldoende omdat de `stage` de events zelf moet uitzenden, maar de listeners werden op de verkeerde context of op een `null` object geplaatst.
3.  **Gebroken Selectie-logica**: Door de focus op de drag-implementatie en het aanpassen van de `eventMode` op de `stage` en containers, is de `pointerdown`-logica voor het selecteren van individuele regels in `PoemLine.jsx` verstoord geraakt. De events werden waarschijnlijk "opgeslokt" door een bovenliggende container voordat ze de `PoemLine` bereikten.

### Aanbevolen Strategie voor een Herimplementatie

Een nieuwe, meer robuuste strategie is nodig die het parent-probleem omzeilt en de interactielogica verduidelijkt.

1.  **Centraliseer de Drag-logica in `CanvasContent.jsx`**:
    - Stop met het proberen om de logica volledig te isoleren in een generieke hook. Verplaats de `pointerdown`, `pointermove` en `pointerup` event handlers direct naar een `useEffect` binnen `CanvasContent.jsx`.
    - Dit geeft directe en gegarandeerde toegang tot `app.stage`, `contentRef` en alle benodigde state setters, zonder de complexiteit van `Ref`-doorgifte en timingproblemen.

2.  **Gebruik de Globale Event Manager**:
    - In plaats van listeners te koppelen aan `target.parent`, koppel de `pointermove` and `pointerup` listeners *altijd* aan `app.renderer.events.root`. Dit is de top-level event dispatcher en vangt gegarandeerd alle events op het canvas.
    - **Workflow**:
        - `onPointerDown` (op `contentRef` of een specifieke `PoemLine`): Zet een `isDragging` flag, sla de startpositie op en voeg de `onPointerMove` en `onPointerUp` listeners toe aan `app.renderer.events.root`.
        - `onPointerMove` (op `root`): Als `isDragging` waar is, bereken de delta en update de state.
        - `onPointerUp` (op `root`): Reset de `isDragging` flag en **verwijder** de `move` en `up` listeners van de `root` om onnodige eventverwerking te voorkomen.

3.  **Wrapper Component voor Dragging (Optioneel maar Aangeraden)**:
    - Overweeg het creëren van een React-component (bv. `<DraggableContainer>`) die een PIXI-container rendert en de drag-event-logica intern beheert. Dit is een meer geavanceerde `@pixi/react` benadering.
    - Dit component zou de `useApplication()` hook kunnen gebruiken om toegang te krijgen tot de `app` en de listeners correct te beheren.

4.  **Herstel van Selectie-logica**:
    - Zorg ervoor dat `PoemLine` in 'edit' modus `eventMode: 'static'` en `interactive: true` heeft.
    - De `pixiContainer` in `CanvasContent.jsx` moet `interactiveChildren: true` hebben wanneer `moveMode === 'edit'`. In andere modi moet dit `false` zijn om te voorkomen dat individuele regels events kapen.

---

## Deel 2: Persoonlijke Instructies voor Eigen Implementatie

Hoi! Als je zelf aan de slag gaat, hier zijn de belangrijkste aandachtspunten gebaseerd op de uitdagingen die we zijn tegengekomen:

1.  **De `app.stage` heeft geen `.parent`**: Dit was de bron van veel fouten. Je kunt niet vertrouwen op `.parent` om listeners voor globale muisbewegingen toe te voegen.
    - **Oplossing**: Gebruik altijd `app.renderer.events.root` om je `pointermove` en `pointerup` listeners aan te hangen *nadat* een 'drag' is gestart. Dit is de meest betrouwbare manier om events over het hele canvas te vangen. Vergeet niet om deze listeners weer te verwijderen bij `pointerup`!

2.  **State voor Dragging**: Het is cruciaal om een simpele `isDragging` boolean state (bv. via `useRef`) te gebruiken.
    - De `pointerdown` event handler zet deze op `true`.
    - De `pointermove` handler doet alleen iets als deze `true` is.
    - De `pointerup` handler zet deze weer op `false`.

3.  **Delta vs. Absolute Positie**: Zorg voor een duidelijk onderscheid.
    - Je hebt de *basispositie* van je gedicht (die wordt bepaald door de responsive logica `useResponsiveTextPosition`).
    - Daarnaast heb je de *delta* (verschuiving) die door de gebruiker wordt veroorzaakt via slepen of de sliders.
    - De uiteindelijke positie op het scherm is altijd `basispositie + delta`. De sliders en de drag-logica moeten **alleen de delta aanpassen**.

4.  **Events en `@pixi/react`**:
    - Onthoud dat je PIXI-eigenschappen zoals `eventMode`, `cursor`, `interactive`, etc., direct als props op de `@pixi/react` componenten (`<pixiContainer>`, `<pixiSprite>`) kunt zetten.
    - Voor het toevoegen van event listeners (`.on()`), heb je een `ref` naar het PIXI-object nodig. Doe dit binnen een `useEffect` om zeker te zijn dat het object bestaat.

5.  **Herstel van de Selectie-modus**:
    - Controleer de `eventMode` en `interactiveChildren` props op de hiërarchie. In 'edit' modus moeten events de `PoemLine`-componenten kunnen bereiken. Zorg dat de `pixiContainer` in `CanvasContent.jsx` `interactiveChildren={moveMode === 'edit'}` heeft. Dit zorgt ervoor dat de kinderen alleen klikbaar zijn in de juiste modus.

Succes met de implementatie! De sleutel ligt in het correct beheren van de event listeners op de globale `root` en het helder scheiden van de basispositie en de gebruikers-delta.