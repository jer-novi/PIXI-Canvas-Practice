// src/pages/CanvasPage/hooks/useCanvasHandlers.js

import {useCallback, useEffect} from "react";
import {useSearchParams} from "react-router-dom";
import {getPoemById} from "../../../data/testdata";
import {
    handleFontSizeChangeUtil,
    handleLineHeightChangeUtil,
    resetLineHeightUtil,
} from "../utils/lineHeightUtils";
import {getGeoDataByCity} from "../../../data/cityGeoData"; // <-- NIEUW


export function useCanvasHandlers(canvasState) {
    // Access current poem data for Alt-A functionality
    const [searchParams] = useSearchParams();
    const poemId = searchParams.get("poemId") ?? "123";
    const currentPoem = poemId ? getPoemById(poemId) : null;

    const {
        handleSelect, // <-- Nieuwe handler uit useSelection
        clearSelection, // <-- Nieuwe handler uit useSelection
        selectAll, // <-- NEW: Add selectAll function
        viewportDragEnabled,
        setViewportDragEnabled,
        fontSize,
        setFontSize,
        setLineHeight,
        lineHeightMultiplier,
        setLineHeightMultiplier,
        userHasAdjusted,
        setUserHasAdjusted,

        // Hierarchical color system
        titleColorOverride,
        setTitleColorOverride,
        authorColorOverride,
        setAuthorColorOverride,

        lineOverrides, // <-- DEZE TOEVOEGEN
        setPendingFontFamily, // <-- De nieuwe setter
        loadFont, // <-- Nieuw, van de font manager
        selectedLines, // <-- Belangrijk voor per-regel logica
        setLineOverrides,
        searchPhotos, // <-- Pexels voor vrije zoekopdrachten
        searchPhotosByGeo, // <-- NIEUW: Onze Flickr specialist
        getCollectionPhotos,
        setBackgroundImage, // <-- van useCanvasState
        goToNextPage, // <-- Nieuw van usePexels
        goToPrevPage, // <-- Nieuw van usePexels
        searchContext, // <-- Nieuwe search context state
        setSearchContext, // <-- Nieuwe search context setter
        goToNextFlickrPage, // <-- NIEUW
        flickrPhotos, // <-- NIEUW: om te checken welke bron actief is
        clearFlickrPhotos, // <-- NIEUW: om Flickr te resetten
        setPhotoGridVisible, // <-- van useCanvasState

    } = canvasState;

    // Line selection handler is nu een simpele doorgever
    const handleLineSelect = useCallback(
        (index, event) => {
            handleSelect(index, event);
        },
        [handleSelect]
    );

    // Past kleur toe op ALLE geselecteerde regels
    const handleLineColorChange = useCallback(
        (color) => {
            if (selectedLines.size > 0) {
                setLineOverrides((prev) => {
                    const newOverrides = {...prev};
                    selectedLines.forEach((index) => {
                        newOverrides[index] = {...newOverrides[index], fillColor: color};
                    });
                    return newOverrides;
                });
            }
        },
        [selectedLines, setLineOverrides]
    );

    // Reset de stijl voor ALLE geselecteerde regels
    const handleResetSelectedLines = useCallback(() => {
        if (selectedLines.size > 0) {
            setLineOverrides((prev) => {
                const newOverrides = {...prev};
                selectedLines.forEach((index) => {
                    // Verwijder de hele override voor de geselecteerde regel
                    // Simpeler dan individuele properties verwijderen
                    delete newOverrides[index];
                });
                return newOverrides;
            });
            clearSelection(); // Deselecteer na het resetten
        }
    }, [selectedLines, setLineOverrides, clearSelection]);

    // Viewport control
    const handleViewportToggle = useCallback(
        (enabled) => {
            setViewportDragEnabled(enabled);
        },
        [setViewportDragEnabled]
    );

    // Color picker active state
    const handleColorPickerActiveChange = useCallback(
        (isActive) => {
            canvasState.setIsColorPickerActive(isActive);
        },
        [canvasState]
    );

    // Font size, line height, etc. blijven hetzelfde...
    const handleFontSizeChange = useCallback(
        (newSize) =>
            handleFontSizeChangeUtil(newSize, {
                userHasAdjusted,
                lineHeightMultiplier,
                setFontSize,
                setLineHeight,
            }),
        [userHasAdjusted, lineHeightMultiplier, setFontSize, setLineHeight]
    );

    const handleLineHeightChange = useCallback(
        (newHeight) =>
            handleLineHeightChangeUtil(newHeight, {
                userHasAdjusted,
                setUserHasAdjusted,
                setLineHeight,
                fontSize,
                setLineHeightMultiplier,
            }),
        [
            userHasAdjusted,
            setUserHasAdjusted,
            setLineHeight,
            fontSize,
            setLineHeightMultiplier,
        ]
    );

    const handleResetLineHeight = useCallback(
        () =>
            resetLineHeightUtil({
                currentFontSize: fontSize,
                setLineHeight,
                setLineHeightMultiplier,
                setUserHasAdjusted,
            }),
        [fontSize, setLineHeight, setLineHeightMultiplier, setUserHasAdjusted]
    );

    const handleLineHeightMultiplierChange = useCallback(
        (newMultiplier) => {
            if (!userHasAdjusted) setUserHasAdjusted(true);
            setLineHeightMultiplier(newMultiplier);
            setLineHeight(fontSize * newMultiplier);
        },
        [
            userHasAdjusted,
            setUserHasAdjusted,
            setLineHeightMultiplier,
            setLineHeight,
            fontSize,
        ]
    );

    const handleLineLetterSpacingChange = useCallback(
        (spacing) => {
            if (selectedLines.size > 0) {
                setLineOverrides((prev) => {
                    const newOverrides = {...prev};
                    selectedLines.forEach((index) => {
                        newOverrides[String(index)] = {
                            ...newOverrides[String(index)],
                            letterSpacing: spacing,
                        };
                    });
                    return newOverrides;
                });
            }
        },
        [selectedLines, setLineOverrides]
    );

    // Font style handlers
    const handleFontWeightChange = useCallback(
        (weight) => {
            canvasState.setFontWeight(weight);
        },
        [canvasState]
    );

    const handleFontStyleChange = useCallback(
        (style) => {
            canvasState.setFontStyle(style);
        },
        [canvasState]
    );

    // Skew handlers
    const handleSkewXChange = useCallback(
        (skewX) => {
            canvasState.setSkewX(skewX);
        },
        [canvasState]
    );

    const handleSkewYChange = useCallback(
        (skewY) => {
            canvasState.setSkewY(skewY);
        },
        [canvasState]
    );

    const handleLineFontSizeChange = useCallback(
        (size) => {
            if (selectedLines.size > 0) {
                setLineOverrides((prev) => {
                    const newOverrides = {...prev};
                    selectedLines.forEach((index) => {
                        newOverrides[String(index)] = {
                            ...newOverrides[String(index)],
                            fontSize: size,
                        };
                    });
                    return newOverrides;
                });
            }
        },
        [selectedLines, setLineOverrides]
    );

    // Hierarchical color system handlers
    const handleTitleColorChange = useCallback(
        (color) => {
            console.log("🎯 handleTitleColorChange called with:", color);
            setTitleColorOverride(color);
            console.log("🎯 setTitleColorOverride called");
        },
        [setTitleColorOverride]
    );

    const handleAuthorColorChange = useCallback(
        (color) => {
            setAuthorColorOverride(color);
        },
        [setAuthorColorOverride]
    );

    const handleResetTitleColor = useCallback(() => {
        setTitleColorOverride(null);
    }, [setTitleColorOverride]);

    const handleResetAuthorColor = useCallback(() => {
        setAuthorColorOverride(null);
    }, [setAuthorColorOverride]);

    const handleSyncAllColorsToGlobal = useCallback(() => {
        // Count existing overrides for confirmation
        const titleOverride = titleColorOverride !== null;
        const authorOverride = authorColorOverride !== null;
        const lineColorOverrides = Object.values(lineOverrides).filter(
            (override) => override.fillColor
        ).length;

        const totalOverrides =
            (titleOverride ? 1 : 0) + (authorOverride ? 1 : 0) + lineColorOverrides;

        if (totalOverrides === 0) {
            alert("Er zijn geen kleur overrides om te resetten.");
            return;
        }

        // Simple confirmation dialog
        const confirmMessage =
            `Dit zal ${totalOverrides} kleur override${
                totalOverrides === 1 ? "" : "s"
            } verwijderen:\n\n` +
            (titleOverride ? "• Titel kleur override\n" : "") +
            (authorOverride ? "• Auteur kleur override\n" : "") +
            (lineColorOverrides > 0
                ? `• ${lineColorOverrides} gedichtregels kleur override${
                    lineColorOverrides === 1 ? "" : "s"
                }\n`
                : "") +
            "\nAlle kleuren zullen de globale kleur volgen. Doorgaan?";

        if (!confirm(confirmMessage)) {
            return;
        }

        // Reset title and author to global color
        setTitleColorOverride(null);
        setAuthorColorOverride(null);

        // Reset all line overrides to only keep non-color properties
        setLineOverrides((prev) => {
            const newOverrides = {...prev};
            Object.keys(newOverrides).forEach((index) => {
                const override = {...newOverrides[index]};
                delete override.fillColor; // Remove color override

                // If no other overrides remain, remove the entire entry
                if (Object.keys(override).length === 0) {
                    delete newOverrides[index];
                } else {
                    newOverrides[index] = override;
                }
            });
            return newOverrides;
        });
    }, [
        titleColorOverride,
        authorColorOverride,
        lineOverrides,
        setTitleColorOverride,
        setAuthorColorOverride,
        setLineOverrides,
    ]);

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
            const newOverrides = {...prev};
            Object.keys(newOverrides).forEach((index) => {
                const override = {...newOverrides[index]};
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

        // If all lines are reset, set global font to Cormorant Garamond
        if (allLinesReset) {
            loadFont("Cormorant Garamond");
            setPendingFontFamily("Cormorant Garamond");
        }
    }, [lineOverrides, setLineOverrides, loadFont, setPendingFontFamily]);

    const handleFontFamilyChange = useCallback(
        (newFontFamily) => {
            // Taak 1: Zorg dat het lettertype geladen wordt (dit gebeurt altijd)
            loadFont(newFontFamily);

            // 2. Leg de 'intentie' van de gebruiker vast
            if (selectedLines.size > 0) {
                // Pas de override toe op de geselecteerde regels
                setLineOverrides((prev) => {
                    const newOverrides = {...prev};
                    selectedLines.forEach((index) => {
                        newOverrides[index] = {
                            ...newOverrides[index],
                            fontFamily: newFontFamily,
                        };
                    });
                    return newOverrides;
                });
            } else {
                // Zet het lettertype in de wachtrij voor de globale stijl
                setPendingFontFamily(newFontFamily);
            }
        },
        [loadFont, setPendingFontFamily, selectedLines, setLineOverrides]
    );

    // NIEUWE HANDLERS
    const handleSearchBackground = useCallback(
        (query) => {
            searchPhotos(query);
            // Update search context voor Pexels vrij zoeken
            setSearchContext({
                type: 'pexels_search',
                query: query,
                source: 'pexels'
            });
        },
        [searchPhotos, setSearchContext]
    );

    const handleSetBackground = useCallback(
        (imageUrl) => {
            setBackgroundImage(imageUrl);
        },
        [setBackgroundImage]
    );


    const handleCitySearch = useCallback((city) => {
            const geoData = getGeoDataByCity(city);
            if (geoData) {
                // We geven nu een object mee, inclusief de stadsnaam voor de tags
                searchPhotosByGeo({...geoData, city, tags: "gevel,facade,architecture"}, true);
                // Update search context voor Flickr stad zoeken
                setSearchContext({
                    type: 'flickr_city',
                    query: city,
                    source: 'flickr'
                });
            } else {
                // Geen Pexels fallback meer - toon lege resultaten
                clearFlickrPhotos();
                // Update search context voor niet gevonden stad
                setSearchContext({
                    type: 'flickr_city',
                    query: city,
                    source: 'flickr'
                });
            }
        },
        [searchPhotosByGeo, clearFlickrPhotos, setSearchContext]
    );

    // --- NIEUWE HANDLERS VOOR PAGINERING ---
    const handleNextPage = useCallback(() => {
        // Als er flickr foto's zijn, gebruik de flickr paginering
        if (flickrPhotos && flickrPhotos.length > 0) {
            goToNextFlickrPage();
        } else {
            goToNextPage();
        }
    }, [flickrPhotos, goToNextFlickrPage, goToNextPage]);

    const handlePrevPage = useCallback(() => {
        // Voor nu focussen we op 'volgende pagina', omdat Flickr geen 'prev_page' URL geeft.
        // Dit houdt de logica simpel. Je kunt altijd een nieuwe zoekopdracht doen.
        if (flickrPhotos && flickrPhotos.length > 0) {
            // Vorige pagina voor Flickr is complexer, voor nu niet geïmplementeerd
        } else {
            goToPrevPage();
        }
    }, [flickrPhotos, goToPrevPage]);

    // NEW: Handler to reset to default collection
    const handleResetToCollection = useCallback(() => {
        // Eerst Flickr photos wissen
        clearFlickrPhotos();
        
        // Dan Pexels collection laden
        getCollectionPhotos();
        
        // Update search context naar collection
        setSearchContext({
            type: 'collection',
            query: '',
            source: 'pexels'
        });
    }, [clearFlickrPhotos, getCollectionPhotos, setSearchContext]);

    // NEW: Handler to open photo grid
    const handleOpenPhotoGrid = useCallback(() => {
        setPhotoGridVisible(true);
    }, [setPhotoGridVisible]);

    // Get moveMode from canvasState for CTRL+drag logic
    const {moveMode} = canvasState;

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                clearSelection(); // <-- Gebruik de nieuwe clearSelection functie
            }

            // NEW: Alt-A select all functionality
            if (event.altKey && event.key === "a") {
                event.preventDefault(); // Prevent browser Alt-A behavior
                if (currentPoem?.lines) {
                    selectAll(currentPoem.lines.length);
                }
            }

            // CTRL key in Edit mode enables viewport dragging
            if ((event.ctrlKey || event.metaKey) && moveMode === 'edit' && !viewportDragEnabled) {
                console.log('CTRL pressed in edit mode - enabling viewport drag');
                setViewportDragEnabled(true);
            }
        };

        const handleKeyUp = (event) => {
            // CTRL key release in Edit mode disables viewport dragging
            if (!(event.ctrlKey || event.metaKey) && moveMode === 'edit' && viewportDragEnabled) {
                console.log('CTRL released in edit mode - disabling viewport drag');
                setViewportDragEnabled(false);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keyup", handleKeyUp);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("keyup", handleKeyUp);
        };
    }, [
        viewportDragEnabled,
        clearSelection,
        selectAll,
        currentPoem,
        setViewportDragEnabled,
        moveMode, // Add moveMode as dependency
    ]);

    return {
        handleLineSelect,
        handleLineColorChange,
        handleLineLetterSpacingChange,
        handleLineFontSizeChange, // <-- NIEUW: fontSize handler
        handleResetSelectedLines, // <-- Hernoemd voor duidelijkheid
        handleViewportToggle,
        handleColorPickerActiveChange,
        handleFontSizeChange,
        handleLineHeightChange,
        handleResetLineHeight,
        handleLineHeightMultiplierChange,

        // Hierarchical color system handlers
        handleTitleColorChange,
        handleAuthorColorChange,
        handleResetTitleColor,
        handleResetAuthorColor,
        handleSyncAllColorsToGlobal,
        handleSyncAllFontsToGlobal,
        handleFontFamilyChange, // <-- Exporteer de nieuwe handlerv

        // Font style handlers
        handleFontWeightChange,
        handleFontStyleChange,

        // Skew handlers
        handleSkewXChange,
        handleSkewYChange,

        handleSearchBackground,
        handleSetBackground,
        handleNextPage, // <-- Exporteren
        handlePrevPage, // <-- Exporteren
        handleCitySearch, // <-- Exporteer de nieuwe handler
        handleResetToCollection, // <-- NEW: Export reset handler
        handleOpenPhotoGrid, // <-- NEW: Export open photo grid handler
    };
}
