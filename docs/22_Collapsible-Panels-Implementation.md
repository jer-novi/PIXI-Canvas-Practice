# Implementatie: Inklapbare Zijpanelen

Dit document beschrijft de architectuur en implementatie van de inklapbare zijpanelen, ontworpen voor een verbeterde gebruikerservaring op kleinere schermen.

## 1. Doel

Het doel was om de linker (`Controls`) en rechter (`Navigation`) panelen volledig inklapbaar te maken. De vorige implementatie met externe knoppen was visueel storend. De nieuwe aanpak moest elegant, intuïtief en visueel geïntegreerd zijn.

## 2. Architectuur

De nieuwe architectuur is gebaseerd op een duidelijk onderscheid tussen de "open" en "sluit" acties:

-   **"Sluit" Knoppen (`✕`):** Deze bevinden zich *binnen* elk paneel in een nieuwe, vaste header. Dit voelt als een natuurlijke actie voor de gebruiker.
-   **"Open" Knoppen (`☰`):** Deze verschijnen *op het canvas* (linksboven en rechtsboven) zodra een paneel is ingeklapt. Ze nemen geen extra ruimte in en zijn alleen zichtbaar wanneer nodig.

De state wordt centraal beheerd in de `useResponsiveCanvas` hook en via props doorgegeven aan de betreffende componenten.

## 3. Implementatiedetails

### `useResponsiveCanvas.js`

-   Geen wijzigingen nodig. De bestaande `controlsVisible`, `navVisible`, `toggleControls`, en `toggleNav` voldeden perfect.

### `ResponsiveLayout.jsx` (Grote wijziging)

-   **Props Doorgeven:** De `toggleControls` en `toggleNav` functies worden nu via `React.cloneElement` doorgegeven aan de `controls` en `navigation` child-componenten.
-   **"Open" Knoppen:** Binnen de `.canvasWrapper` worden nu twee nieuwe knoppen conditioneel gerenderd:
    -   Een knop linksboven die verschijnt als `!layout.controlsVisible`.
    -   Een knop rechtsboven die verschijnt als `!layout.navVisible`.
-   **CSS-klassen:** De `.collapsed` klasse wordt nog steeds toegepast op de panelen om de `transform` te activeren.

### `Controls.jsx` & `Navigation.jsx`

-   Beide componenten accepteren nu een `toggle` prop.
-   Er is een nieuwe `panelHeader` div toegevoegd aan de top van elk component.
-   Deze header bevat de titel en een "sluit" knop (`<button onClick={toggle}>✕</button>`).

### CSS Modules

-   **`ResponsiveLayout.module.css`:**
    -   Alle oude `.toggleButton` stijlen zijn verwijderd.
    -   Nieuwe stijlen voor `.openButton` zijn toegevoegd om de knoppen op het canvas te positioneren met een subtiele, semi-transparante achtergrond.
    -   De `transform` animatie op de panelen is verfijnd voor een soepeler effect.
-   **`CanvasPage.module.css`:**
    -   Nieuwe stijlen voor `.panelHeader` en `.closeButton` zijn toegevoegd om de headers en sluitknoppen binnen de panelen consistent te stijlen.

## 4. Resultaat

Het resultaat is een robuust en visueel aantrekkelijk systeem:

-   De panelen schuiven soepel in en uit beeld.
-   De UI is opgeruimd, zonder permanent zichtbare knoppen die de layout verstoren.
-   De interactie is intuïtief: sluiten doe je binnen het paneel, openen doe je vanaf het canvas.
-   De oplossing is volledig state-driven en herbruikt de bestaande logica, wat het onderhoudbaar maakt.
