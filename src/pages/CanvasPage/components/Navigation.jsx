import styles from "./Navigation.module.css";
import MoveControls from "./MoveControls"; 
import XYMoveSliders from "./XYMoveSliders";

export default function Navigation({
  onSyncAllColorsToGlobal,
  onSyncAllFontsToGlobal,
  moveMode,
  setMoveMode,
  selectedLines,
  clearSelection,
  poemOffset,
  setPoemOffset,
  lineOverrides,
  setLineOverrides,
}) {
  return (
    <div className={styles.navContainer}>
      <div className={styles.navItem}>
        <span>📖</span>
      </div>
      <div className={styles.navItem}>
        <span>🎨</span>
      </div>
      <div className={styles.navItem}>
        <span>⚙️</span>
      </div>

      {/* Sync Actions */}
      <div className={styles.syncSection}>
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
      />

      {/* XY Move Sliders */}
      <XYMoveSliders
        moveMode={moveMode}
        selectedLines={selectedLines}
        poemOffset={poemOffset}
        setPoemOffset={setPoemOffset}
        lineOverrides={lineOverrides}
        setLineOverrides={setLineOverrides}
      />
    </div>
  );
}
