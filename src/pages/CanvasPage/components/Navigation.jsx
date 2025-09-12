import styles from "./Navigation.module.css";
import MoveControls from "./MoveControls";
import FloatingShortcutPanel from "./FloatingShortcutPanel";

export default function Navigation({
                                       toggle,
                                       onSyncAllColorsToGlobal,
                                       onSyncAllFontsToGlobal,
                                       moveMode,
                                       setMoveMode,
                                       selectedLines,
                                       clearSelection,
                                       activeShortcut,
                                       xySlidersVisible,
                                       navWidth,
                                   }) {
    // The XY sliders are only truly visible when the mode is 'poem' or 'line' AND the visibility flag is set.
    // This ensures the navigation layout syncs perfectly with the actual visibility of the sliders.
    const areSlidersEffectivelyVisible = (moveMode === 'poem' || moveMode === 'line') && xySlidersVisible;

    // Determine sync section class based on the effective visibility of the XY sliders
    const syncSectionClass = areSlidersEffectivelyVisible
        ? `${styles.syncSection} ${styles.withXySlidersVisible}`
        : `${styles.syncSection} ${styles.withXySlidersHidden}`;

    return (
        <div className={styles.navContainer}>
            <div className={styles.panelHeader}>
                <h3>Navigation</h3>
                <button onClick={toggle} className={styles.closeButton} aria-label="Collapse Navigation">✕</button>
            </div>

            {/* Sync Actions - dynamically positioned based on XY sliders visibility */}
            <div className={syncSectionClass}>
                <div className={styles.syncLabel}>Sync</div>
                <button
                    type="button"
                    className={styles.syncButton}
                    onClick={onSyncAllColorsToGlobal}
                    title="Reset alle kleuren naar globaal"
                >
                    🎨
                </button>
                <button
                    type="button"
                    className={styles.syncButton}
                    onClick={onSyncAllFontsToGlobal}
                    title="Reset alle fonts naar globaal"
                >
                    🔤
                </button>
            </div>

            {/* Move Controls */}
            <MoveControls
                moveMode={moveMode}
                setMoveMode={setMoveMode}
                selectedLines={selectedLines}
                clearSelection={clearSelection}
                activeShortcut={activeShortcut}
            />

            {/* Floating Shortcut Panel */}
            <FloatingShortcutPanel
                moveMode={moveMode}
                selectedLines={selectedLines}
                activeShortcut={activeShortcut}
                xySlidersVisible={xySlidersVisible}
                navWidth={navWidth}
            />
        </div>
    );
}