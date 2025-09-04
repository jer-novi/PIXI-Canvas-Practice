// src/pages/CanvasPage/hooks/useCanvasState.js

import {useState, useEffect, useRef, useMemo} from "react";
import {useSelection} from "./useSelection"; // <-- STAP 2.1: Importeer de hook
import {useFontManager} from "./useFontManager"; // <-- STAP 2.1: Importeer de manager
import {usePexels} from "./usePexels"; // <-- Importeren
import {useFlickr} from "./useFlickr"; // <-- NIEUW

export function useCanvasState() {
    // Refs
    const viewportRef = useRef(null);
    const contentRef = useRef(null);

    // --- NIEUW: State voor Drag-and-Drop ---
    const [poemOffset, setPoemOffset] = useState({x: 170, y: 0});
    const [moveMode, setMoveMode] = useState("edit"); // 'edit', 'poem' or 'line' - default to edit
    // --- Einde nieuwe state ---

    // UI State

    const [viewportDragEnabled, setViewportDragEnabled] = useState(false);
    const [lineOverrides, setLineOverrides] = useState({});
    const [isColorPickerActive, setIsColorPickerActive] = useState(false);
    const [photoGridVisible, setPhotoGridVisible] = useState(false); // New state for floating photo grid

    // const [selectedLine, setSelectedLine] = useState(null); // <-- STAP 2.2: VERWIJDER DEZE
    const selection = useSelection(); // <-- STAP 2.3: Gebruik de nieuwe hook
    const {fontStatus, loadFont, availableFonts} = useFontManager();

    // Text Styling State
    const [currentFontFamily, setCurrentFontFamily] =
        useState("Cormorant Garamond");
    const [pendingFontFamily, setPendingFontFamily] = useState(null);

    // Nieuwe state voor de achtergrond
    const [backgroundImage, setBackgroundImage] = useState(null); // URL van de gekozen afbeelding

    // Initialize hooks that depend on state (AFTER state declaration)
    const pexels = usePexels(setBackgroundImage); // <-- Auto-set foto 2 als default achtergrond
    const flickr = useFlickr(); // <-- NIEUW: Voeg de Flickr hook toe

    // Search context state voor photo modal titel
    const [searchContext, setSearchContext] = useState({
        type: 'collection', // 'collection', 'pexels_search', 'flickr_city', 'pexels_fallback'
        query: '',
        source: 'pexels' // 'pexels' or 'flickr'
    });

    // Deze 'watcher' reageert als een font klaar is met laden
    useEffect(() => {
        // 1. Is er een font in de wachtrij ÉN is de status daarvan 'loaded'?
        if (pendingFontFamily && fontStatus[pendingFontFamily] === "loaded") {
            // 2. JA -> Update de zichtbare (huidige) font
            setCurrentFontFamily(pendingFontFamily);

            // 3. Maak de wachtrij leeg, zodat deze useEffect niet nog eens afgaat
            setPendingFontFamily(null);
        }
    }, [
        pendingFontFamily,
        fontStatus,
        setCurrentFontFamily,
        setPendingFontFamily,
    ]); // De dependency array

    // Text Styling State (Zet deze bovenaan de styling state)
    const [fontSize, setFontSize] = useState(26); //TODO fallback fontsizes in useFontManager aanpassen.
    const [fillColor, setFillColor] = useState("#000000");
    const [letterSpacing, setLetterSpacing] = useState(0);

    // Hierarchical color system: null means use global color, otherwise use override
    const [titleColorOverride, setTitleColorOverride] = useState(null);
    const [authorColorOverride, setAuthorColorOverride] = useState(null);

    // Deprecated: keeping for backward compatibility, will be removed
    const [titleColor, setTitleColor] = useState("#000000");
    const [authorColor, setAuthorColor] = useState("#000000");

    const [lineHeight, setLineHeight] = useState(24 * 1.4);
    const [lineHeightMultiplier, setLineHeightMultiplier] = useState(1.4);
    const [textAlign, setTextAlign] = useState("center");

    // Internal State
    const [userHasAdjusted, setUserHasAdjusted] = useState(false);

    // Reactive computed values using useMemo
    const effectiveTitleColor = useMemo(() => {
        return titleColorOverride || fillColor;
    }, [titleColorOverride, fillColor]);

    const effectiveAuthorColor = useMemo(() => {
        return authorColorOverride || fillColor;
    }, [authorColorOverride, fillColor]);

    const hasTitleColorOverride = useMemo(() => {
        return titleColorOverride !== null;
    }, [titleColorOverride]);

    const hasAuthorColorOverride = useMemo(() => {
        return authorColorOverride !== null;
    }, [authorColorOverride]);

    return {
        // Refs
        viewportRef,
        contentRef,

        // UI State
        ...selection, // <-- STAP 2.4: Voeg alle selection state & handlers toe
        clearSelection: selection.clearSelection, // <-- Explicit clearSelection access
        viewportDragEnabled,
        setViewportDragEnabled,
        lineOverrides,
        setLineOverrides,
        isColorPickerActive,
        setIsColorPickerActive,
        photoGridVisible,
        setPhotoGridVisible,

        // NIEUW: Font-gerelateerde state en functies
        currentFontFamily,
        setCurrentFontFamily,
        pendingFontFamily,
        setPendingFontFamily,
        fontStatus,
        loadFont,
        availableFonts,
        fontFamily: currentFontFamily,

        // Pexels-gerelateerde state en functies
        ...pexels, // photos, isLoading, error, searchPhotos

        // Flickr-gerelateerde state en functies
        ...flickr, // <-- NIEUW

        // Achtergrond state
        backgroundImage,
        setBackgroundImage,

        // Search context state
        searchContext,
        setSearchContext,

        // Text Styling State
        fontSize,
        setFontSize,
        fillColor,
        setFillColor,
        letterSpacing,
        setLetterSpacing,

        // Hierarchical color system
        titleColorOverride,
        setTitleColorOverride,
        authorColorOverride,
        setAuthorColorOverride,

        // Computed effective colors (now reactive)
        effectiveTitleColor,
        effectiveAuthorColor,
        hasTitleColorOverride,
        hasAuthorColorOverride,

        // Deprecated: keeping for backward compatibility
        titleColor,
        setTitleColor,
        authorColor,
        setAuthorColor,

        lineHeight,
        setLineHeight,
        lineHeightMultiplier,
        setLineHeightMultiplier,
        textAlign,
        setTextAlign,

        poemOffset,
        setPoemOffset,
        moveMode,
        setMoveMode,

        // Internal State
        userHasAdjusted,
        setUserHasAdjusted,
    };
}
