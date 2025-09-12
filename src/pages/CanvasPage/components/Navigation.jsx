import styles from "./Navigation.module.css";
import MoveControls from "./MoveControls";
import FloatingShortcutPanel from "./FloatingShortcutPanel";

export default function Navigation({
                                       onSyncAllColorsToGlobal,
                                       onSyncAllFontsToGlobal,
                                       moveMode,
                                       setMoveMode,
                                       selectedLines,
                                       clearSelection,
                                       activeShortcut,
                                       xySlidersVisible,
                                   }) {
    // Determine sync section class based on XY sliders visibility
    const syncSectionClass = xySlidersVisible 
        ? `${styles.syncSection} ${styles.withXySlidersVisible}`
        : `${styles.syncSection} ${styles.withXySlidersHidden}`;

    return (
        <div className={styles.navContainer}>
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
            />
        </div>
    );
}
