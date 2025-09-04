// src/pages/CanvasPage/components/FloatingPhotoGrid.jsx

import React, {useState, useEffect} from "react";
import styles from "../CanvasPage.module.css";

export default function FloatingPhotoGrid({
                                              photos,
                                              isLoading,
                                              error,
                                              onSetBackground,
                                              onClose,
                                              onNextPage,
                                              onPrevPage,
                                              hasNextPage,
                                              hasPrevPage,
                                              searchContext
                                          }) {
    const [isVisible, setIsVisible] = useState(false);

    // Debug logging
    useEffect(() => {
        console.log('🔍 FloatingPhotoGrid props:', {
            photosLength: photos?.length || 'undefined',
            isLoading,
            error,
            searchContext,
            hasNextPage,
            hasPrevPage
        });
    }, [photos, isLoading, error, searchContext, hasNextPage, hasPrevPage]);

    // Generate title based on search context
    const getTitle = () => {
        if (!searchContext) return "Achtergronden";

        switch (searchContext.type) {
            case 'collection':
                return "Achtergronden";
            case 'pexels_search':
                return `Resultaten voor "${searchContext.query}"`;
            case 'flickr_city':
                return `Foto's uit ${searchContext.query}`;
            case 'pexels_fallback':
                return `Resultaten voor "${searchContext.query}"`;
            default:
                return searchContext.query ? `Resultaten voor "${searchContext.query}"` : "Achtergronden";
        }
    };

    // Animate in when component mounts
    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), 10);
        return () => clearTimeout(timer);
    }, []);

    const handleClose = () => {
        setIsVisible(false);
        // Wait for animation before actually closing
        setTimeout(onClose, 300);
    };

    const handleBackgroundClick = (e) => {
        // Close if clicking on backdrop (not the grid itself)
        if (e.target === e.currentTarget) {
            handleClose();
        }
    };

    return (
        <div
            className={`${styles.photoGridOverlay} ${isVisible ? styles.fadeIn : styles.fadeOut}`}
            onClick={handleBackgroundClick}
        >
            <div className={`${styles.floatingPhotoGrid} ${isVisible ? styles.slideIn : styles.slideOut}`}>
                {/* Header with close button */}
                <div className={styles.floatingGridHeader}>
                    <h3>
                        {getTitle()}
                    </h3>
                    {/* Loading state */}
                    {isLoading && (
                        <div className={styles.loadingMessage}>
                            Foto's laden...
                        </div>
                    )}
                    <button
                        className={styles.closeButton}
                        onClick={handleClose}
                        aria-label="Sluit foto grid"
                    >
                        ✕
                    </button>

                </div>

                {/* Enhanced Error message */}
                {error && (
                    <div className={styles.errorMessage}>
                        <h4>⚠️ Fout bij laden van foto's:</h4>
                        <p>{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className={styles.reloadButton}
                        >
                            🔄 Pagina herladen
                        </button>
                    </div>
                )}


                {/* Photo grid */}
                <div className={styles.floatingPhotoGridContent}>
                    {(photos || []).map((photo) => (
                        <div
                            key={photo.id}
                            className={styles.floatingPhotoThumbnail}
                            onClick={() => {
                                onSetBackground(photo.src.large2x);
                                handleClose(); // Close grid after selecting
                            }}
                            title={photo.alt || 'Klik om als achtergrond te gebruiken'}
                        >
                            <img src={photo.src.tiny} alt={photo.alt}/>
                        </div>
                    ))}
                </div>

                {/* Pagination controls */}
                {(photos && photos.length > 0) && (hasPrevPage || hasNextPage) && (
                    <div className={styles.floatingPaginationControls}>
                        <button
                            onClick={onPrevPage}
                            disabled={!hasPrevPage || isLoading}
                            className={styles.paginationButton}
                        >
                            ← Vorige
                        </button>
                        <button
                            onClick={onNextPage}
                            disabled={!hasNextPage || isLoading}
                            className={styles.paginationButton}
                        >
                            Volgende →
                        </button>
                    </div>
                )}

                {/* No results message */}
                {!isLoading && (!photos || photos.length === 0) && (
                    <div className={styles.noResultsMessage}>
                        Geen foto's gevonden. Probeer een andere zoekopdracht.
                    </div>
                )}
            </div>
        </div>
    );
}