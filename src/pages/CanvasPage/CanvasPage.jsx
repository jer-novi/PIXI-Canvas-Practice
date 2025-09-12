import {Application, extend} from "@pixi/react";
import {Text, Container, Graphics} from "pixi.js";
import {Viewport} from "pixi-viewport";
import {useEffect, useState, useCallback} from "react";
import {useSearchParams} from "react-router-dom";
import {getPoemById} from "../../data/testdata";

// CRITICAL: extend() MUST be called at module level, outside components
extend({Text, Container, Graphics, Viewport});

import Controls from "./Controls";
import {useResponsiveCanvas} from "./hooks/useResponsiveCanvas";
import {useCanvasState} from "./hooks/useCanvasState";
import {useCanvasHandlers} from "./hooks/useCanvasHandlers";
import {useKeyboardShortcuts} from "./hooks/useKeyboardShortcuts";
import {CanvasContent} from "./components/CanvasContent";
import ResponsiveLayout from "./components/ResponsiveLayout";
import Navigation from "./components/Navigation";
import FloatingPhotoGrid from "./components/FloatingPhotoGrid";
import XYMoveSliders from "./components/XYMoveSliders";
import ShortcutFeedback from "./components/ShortcutFeedback";
import styles from "./CanvasPage.module.css";

// Main component that manages state
export default function CanvasPage() {
    // Get current poem data for keyboard shortcuts
    const [searchParams] = useSearchParams();
    const poemId = searchParams.get("poemId") ?? "123";
    const currentPoem = poemId ? getPoemById(poemId) : null;

    // Use custom hooks for state and handlers
    const canvasState = useCanvasState();
    const handlers = useCanvasHandlers(canvasState);

    // Photo preview state management
    const [previewState, setPreviewState] = useState('normal'); // 'normal' | 'dimmed' | 'preview'
    const [previewImage, setPreviewImage] = useState(null);

    // NIEUW: State voor XY focus callback
    const [onXyFocusRequest, setOnXyFocusRequest] = useState(null);

    // NIEUW: Thumbnail hover freeze state voor 2 seconden na Alt+J
    const [hoverFreezeActive, setHoverFreezeActive] = useState(false);
    
    // NEW: Active shortcut visualization state
    const [activeShortcut, setActiveShortcut] = useState(null);

    // NIEUW: Timer voor hover freeze
    useEffect(() => {
        if (hoverFreezeActive) {
            console.log('🖱️ Alt+J: Thumbnail hover freeze activated for 2 seconds');
            const timer = setTimeout(() => {
                setHoverFreezeActive(false);
                console.log('🖱️ Alt+J: Thumbnail hover freeze deactivated');
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [hoverFreezeActive]);

    // Handle preview state changes from FloatingPhotoGrid
    const handlePreviewChange = useCallback(({previewMode, previewImage, hasHovered}) => {
        console.log('🖼️ CanvasPage preview change:', {previewMode, previewImage, hasHovered});

        // Determine the correct preview state based on hasHovered
        let finalPreviewState = previewMode;
        if (previewMode === 'dimmed' && hasHovered) {
            // If grid is open but user has hovered, show preview (not dimmed)
            finalPreviewState = 'preview';
        }

        setPreviewState(finalPreviewState);
        setPreviewImage(previewImage);
    }, []);

    // Use keyboard shortcuts hook for mode cycling and selection management
    const keyboardShortcuts = useKeyboardShortcuts({
        moveMode: canvasState.moveMode,
        setMoveMode: canvasState.setMoveMode,
        selectedLines: canvasState.selectedLines,
        clearSelection: canvasState.clearSelection,
        selectAll: canvasState.selectAll,
        currentPoem,
        xySlidersVisible: canvasState.xySlidersVisible,
        setXySlidersVisible: canvasState.setXySlidersVisible,
        setHoverFreezeActive, // NIEUW: Hover freeze callback
        setActiveShortcut, // NEW: Shortcut visualization callback
    });

    // Use responsive canvas hook
    const layout = useResponsiveCanvas();

    // --- NIEUWE LOGICA ---
    // Bepaal welke data we aan de fotogalerij moeten tonen.
    // We checken de search context om te bepalen welke bron actief is.
    const isFlickrActive = canvasState.searchContext?.source === 'flickr' &&
        (canvasState.isFlickrLoading || (canvasState.flickrPhotos && canvasState.flickrPhotos.length > 0));
    const photosToShow = isFlickrActive ? canvasState.flickrPhotos : canvasState.photos;
    const isLoading = canvasState.isFlickrLoading || canvasState.isLoading;
    const error = canvasState.flickrError || canvasState.error;
// --- NIEUW ---
    const hasNextPage = isFlickrActive ? canvasState.hasNextFlickrPage : canvasState.hasNextPage;
    const hasPrevPage = isFlickrActive ? canvasState.hasPrevFlickrPage : canvasState.hasPrevPage;

    // Debug logging for photo grid data
    console.log('🔍 CanvasPage photo grid data:', {
        searchContextSource: canvasState.searchContext?.source,
        searchContextType: canvasState.searchContext?.type,
        isFlickrActive,
        flickrPhotosLength: canvasState.flickrPhotos?.length || 0,
        pexelsPhotosLength: canvasState.photos?.length || 0,
        hasNextPage,
        hasPrevPage,
        pexelsHasNextPage: canvasState.hasNextPage,
        flickrHasNextPage: canvasState.hasNextFlickrPage
    });


    // Text positioning hook for debug info - commented out as not currently used
    // const textPosition = useResponsiveTextPosition(
    //   layout.canvasWidth,
    //   layout.canvasHeight,
    //   canvasState.fontSize,
    //   canvasState.lineHeight,
    //   [] // baseline; poem selection and exact lines are handled in CanvasContent
    // );

    // Handle selection restoration when switching modes
    useEffect(() => {
        // When switching to line mode from edit mode with no current selection,
        // restore the previous selection if it exists
        if (canvasState.moveMode === 'line' && canvasState.selectedLines.size === 0) {
            const previousSelection = keyboardShortcuts.restorePreviousSelection();
            if (previousSelection.size > 0) {
                canvasState.restoreSelection(previousSelection);
            }
        }
    }, [canvasState.moveMode, canvasState.selectedLines.size, keyboardShortcuts, canvasState]);

    return (
        <>
            <ResponsiveLayout
                layout={layout}
                previewState={previewState}
                controls={
                    <Controls
                        fontSize={canvasState.fontSize}
                        onFontSizeChange={handlers.handleFontSizeChange}
                        fillColor={canvasState.fillColor}
                        onFillColorChange={canvasState.setFillColor}
                        letterSpacing={canvasState.letterSpacing}
                        onLetterSpacingChange={canvasState.setLetterSpacing}
                        lineHeight={canvasState.lineHeight}
                        onLineHeightChange={handlers.handleLineHeightChange}
                        lineHeightMultiplier={canvasState.lineHeightMultiplier}
                        onLineHeightMultiplierChange={
                            handlers.handleLineHeightMultiplierChange
                        }
                        onResetLineHeight={handlers.handleResetLineHeight}
                        textAlign={canvasState.textAlign}
                        onTextAlignChange={canvasState.setTextAlign}
                        selectedLines={canvasState.selectedLines}
                        onLineColorChange={handlers.handleLineColorChange}
                        onLineLetterSpacingChange={handlers.handleLineLetterSpacingChange}
                        onLineFontSizeChange={handlers.handleLineFontSizeChange}
                        handleResetSelectedLines={handlers.handleResetSelectedLines}
                        onApplyGlobalLetterSpacing={handlers.handleApplyGlobalLetterSpacing}
                        lineOverrides={canvasState.lineOverrides}
                        viewportDragEnabled={canvasState.viewportDragEnabled}
                        onViewportToggle={handlers.handleViewportToggle}
                        onColorPickerActiveChange={handlers.handleColorPickerActiveChange}
                        // Hierarchical color system props
                        effectiveTitleColor={canvasState.effectiveTitleColor}
                        effectiveAuthorColor={canvasState.effectiveAuthorColor}
                        hasTitleColorOverride={canvasState.hasTitleColorOverride}
                        hasAuthorColorOverride={canvasState.hasAuthorColorOverride}
                        onTitleColorChange={handlers.handleTitleColorChange}
                        onAuthorColorChange={handlers.handleAuthorColorChange}
                        onResetTitleColor={handlers.handleResetTitleColor}
                        onResetAuthorColor={handlers.handleResetAuthorColor}
                        // Deprecated: keeping for backward compatibility
                        titleColor={canvasState.titleColor}
                        authorColor={canvasState.authorColor}
                        availableFonts={canvasState.availableFonts}
                        fontFamily={canvasState.fontFamily}
                        onFontFamilyChange={handlers.handleFontFamilyChange}

                        // Font style props
                        fontWeight={canvasState.fontWeight}
                        onFontWeightChange={handlers.handleFontWeightChange}
                        fontStyle={canvasState.fontStyle}
                        onFontStyleChange={handlers.handleFontStyleChange}

                        // Skew props
                        skewX={canvasState.skewX}
                        onSkewXChange={handlers.handleSkewXChange}
                        skewY={canvasState.skewY}
                        onSkewYChange={handlers.handleSkewYChange}

                        // Pexels background props
                        photos={canvasState.photos}
                        isLoading={canvasState.isLoading}
                        error={canvasState.error}
                        onSearch={handlers.handleSearchBackground} // De bestaande voor vrij zoeken
                        onCitySearch={handlers.handleCitySearch}
                        onSetBackground={handlers.handleSetBackground}
                        onNextPage={handlers.handleNextPage}
                        onPrevPage={handlers.handlePrevPage}
                        hasNextPage={canvasState.hasNextPage}
                        hasPrevPage={canvasState.hasPrevPage}
                        onResetToCollection={handlers.handleResetToCollection}
                        onOpenPhotoGrid={handlers.handleOpenPhotoGrid}
                        poemOffset={canvasState.poemOffset}
                        setPoemOffset={canvasState.setPoemOffset}
                        hoverFreezeActive={hoverFreezeActive}  // NEW: Pass hover freeze state for timer
                    />
                }
                canvas={
                    <Application
                        width={layout.canvasWidth}
                        height={layout.canvasHeight}
                        options={{
                            background: 0x1d2230,
                            resolution: window.devicePixelRatio || 1,
                            autoDensity: true,
                        }}
                    >
                        <CanvasContent
                            canvasWidth={layout.canvasWidth}
                            canvasHeight={layout.canvasHeight}
                            fontSize={canvasState.fontSize}
                            fillColor={canvasState.fillColor}
                            letterSpacing={canvasState.letterSpacing}
                            lineHeight={canvasState.lineHeight}
                            textAlign={canvasState.textAlign}
                            titleColor={canvasState.effectiveTitleColor}
                            authorColor={canvasState.effectiveAuthorColor}
                            viewportRef={canvasState.viewportRef}
                            contentRef={canvasState.contentRef}
                            fontFamily={canvasState.fontFamily}
                            fontStatus={canvasState.fontStatus}
                            fontWeight={canvasState.fontWeight}
                            fontStyle={canvasState.fontStyle}
                            skewX={canvasState.skewX}
                            skewY={canvasState.skewY}
                            onFontFamilyChange={handlers.handleFontFamilyChange}
                            selectedLines={canvasState.selectedLines} // Was er al
                            lineOverrides={canvasState.lineOverrides} // Was er al
                            setLineOverrides={canvasState.setLineOverrides} // Add setLineOverrides
                            onLineSelect={handlers.handleLineSelect}
                            viewportDragEnabled={canvasState.viewportDragEnabled}
                            isColorPickerActive={canvasState.isColorPickerActive}
                            backgroundImage={previewImage || canvasState.backgroundImage}
                            onNextPage={handlers.handleNextPage}
                            onPrevPage={handlers.handlePrevPage}
                            hasNextPage={canvasState.hasNextPage}
                            hasPrevPage={canvasState.hasPrevPage}
                            onSearch={handlers.handleSearchBackground} // De bestaande voor vrij zoeken
                            onCitySearch={handlers.handleCitySearch} // De nieuwe voor de dropdowns
                            poemOffset={canvasState.poemOffset}
                            setPoemOffset={canvasState.setPoemOffset}
                            moveMode={canvasState.moveMode}
                            isDragging={canvasState.isDragging}           // <-- NIEUW
                            setIsDragging={canvasState.setIsDragging}     // <-- NIEUW
                        />
                    </Application>
                }
                navigation={
                    <Navigation
                        onSyncAllColorsToGlobal={handlers.handleSyncAllColorsToGlobal}
                        onSyncAllFontsToGlobal={handlers.handleSyncAllFontsToGlobal}
                        moveMode={canvasState.moveMode}
                        setMoveMode={canvasState.setMoveMode}
                        selectedLines={canvasState.selectedLines}
                        clearSelection={canvasState.clearSelection}
                        xySlidersVisible={canvasState.xySlidersVisible}  // NEW: Pass XY sliders visibility
                    />
                }
            />

            {/* Canvas Shortcut Feedback */}
            <ShortcutFeedback activeShortcut={activeShortcut} />

            {/* Floating Photo Grid */}
            {canvasState.photoGridVisible && (
                <FloatingPhotoGrid
                    photos={photosToShow}      // <-- GEBRUIK DE NIEUWE VARIABELE
                    isLoading={isLoading}       // <-- GEBRUIK DE NIEUWE VARIABELE
                    error={error}               // <-- GEBRUIK DE NIEUWE VARIABELE
                    searchContext={canvasState.searchContext}
                    onSetBackground={handlers.handleSetBackground}
                    onClose={() => canvasState.setPhotoGridVisible(false)}
                    hasNextPage={hasNextPage}
                    hasPrevPage={hasPrevPage}
                    onNextPage={handlers.handleNextPage}
                    onPrevPage={handlers.handlePrevPage}
                    currentBackground={canvasState.backgroundImage}
                    onPreviewChange={handlePreviewChange}
                    hoverFreezeActive={hoverFreezeActive}  // NEW: Pass hover freeze state
                />
            )}

            {/* Floating XY Move Sliders - Only show in poem/line modes */}
            {(canvasState.moveMode === 'poem' || canvasState.moveMode === 'line') && canvasState.xySlidersVisible && (
                <XYMoveSliders
                    moveMode={canvasState.moveMode}
                    selectedLines={canvasState.selectedLines}
                    poemOffset={canvasState.poemOffset}
                    setPoemOffset={canvasState.setPoemOffset}
                    lineOverrides={canvasState.lineOverrides}
                    setLineOverrides={canvasState.setLineOverrides}
                    isDragging={canvasState.isDragging}
                    canvasWidth={layout.canvasWidth}
                    canvasHeight={layout.canvasHeight}
                    isVisible={canvasState.xySlidersVisible}
                    setIsVisible={canvasState.setXySlidersVisible}
                    onRequestFocus={onXyFocusRequest}
                />
            )}

            {/* NIEUW: Globale thumbnail hover freeze overlay */}
            {hoverFreezeActive && (
                <div
                    className={`${styles.thumbnailFreeze}`}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100vw',
                        height: '100vh',
                        zIndex: 1,
                        pointerEvents: 'none'
                    }}
                />
            )}

            {/* Development Mode Indicator (Clean, Non-Intrusive) */}
            {import.meta.env.DEV && (
                <div
                    style={{
                        position: "fixed",
                        bottom: "10px",
                        left: "10px",
                        background: "rgba(0,100,0,0.8)",
                        color: "white",
                        padding: "4px 8px",
                        borderRadius: "4px",
                        fontSize: "11px",
                        fontFamily: "monospace",
                        zIndex: 1000,
                    }}
                >
                    DEV MODE | Console: window.debugCanvas.toggle()
                </div>
            )}
        </>
    );
}
