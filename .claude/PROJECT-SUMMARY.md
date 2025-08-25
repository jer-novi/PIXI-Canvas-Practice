Project Samenvatting voor Claude Code
Project: pixi-canvas-practice

Dit is een oefenproject dat dient ter voorbereiding op het complexere canvas-onderdeel van mijn NOVI-eindproject, gedichtgevel.nl. Het doel is om stap-voor-stap, via een begeleide leersessie, een robuuste, interactieve tekst-editor op een PIXI.js canvas te bouwen.

Technologie Stack:

Framework: React 19

Build Tool: Vite

Rendering: PixiJS 8 (pixi.js)

React-Integratie: @pixi/react 8

Camera/Viewport: pixi-viewport 6

Wat we tot nu toe hebben gebouwd:

Responsive Layout: Een schermvullende, drie-koloms layout met panelen voor controls, het canvas en navigatie, gebouwd met CSS Flexbox en een custom useResponsiveCanvas hook.

PIXI Canvas Foundation: Een werkend @pixi/react canvas dat een mock-gedicht (titel, auteur, regels) kan renderen.

Custom Font Loading: Een useFontLoader hook die een WOFF2-lettertype laadt en een laad-state beheert om een "Flash of Unstyled Text" te voorkomen.

Interactieve Styling Controls: Met behulp van het "Lifting State Up" patroon hebben we een Controls component gebouwd met werkende sliders en inputs voor fontSize, fillColor, letterSpacing en lineHeight. Inclusief "slimme" logica die de lineHeight meeschaalt met de fontSize totdat de gebruiker deze handmatig aanpast.

Camera Systeem: pixi-viewport is geïntegreerd voor pan- en zoom-functionaliteit. Een custom useAutoRecenter hook zorgt ervoor dat de camera soepel en automatisch her-centreert op het gedicht wanneer het canvas of de tekst van grootte verandert.

Wat we nog gaan doen:

Text Styling Afronden: Implementeren van tekstuitlijning (left, center, right), lettertype-stijl (bold, italic) en mogelijk "uitgevulde" tekst.

Selectie Systeem: Een mechanisme bouwen om individuele dichtregels of het gehele gedicht te kunnen selecteren.

Achtergrond Systeem: Een manier ontwikkelen om achtergrondafbeeldingen (gevels) op het canvas te laden en te beheren.

Display Strategieën: Logica implementeren voor verschillende weergavemodi (FIT, SCROLL, PAGINATE) afhankelijk van de lengte van het gedicht.
