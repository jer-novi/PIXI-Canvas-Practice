// src/pages/CanvasPage/components/MoveControls.jsx
import React from "react";
import styles from "./MoveControls.module.css";

export default function MoveControls({ moveMode, setMoveMode, selectedLines, clearSelection }) {
  const selectionCount = selectedLines.size;

  // Handle mode change met escape actie
  const handleModeChange = (newMode) => {
    if (newMode === 'poem') {
      // ESCAPE ACTIE: Clear alle selecties bij poem mode
      clearSelection();
    }
    setMoveMode(newMode);
  };

  // Status logic per mode
  let statusText = "";
  if (moveMode === 'edit') {
    statusText = "Klik regels om te selecteren";
  } else if (moveMode === 'line') {
    if (selectionCount === 0) {
      statusText = "⚠️ Geen regels geselecteerd";
    } else {
      statusText = `✓ Sleep ${selectionCount} regel${selectionCount > 1 ? 's' : ''}`;
    }
  } else if (moveMode === 'poem') {
    statusText = "Sleep het hele gedicht";
  }

  return (
    <div className={styles.moveControlsContainer}>
      <div className={styles.moveLabel}>Modus</div>
      <div className={styles.buttonGroup}>
        {/* Edit mode button */}
        <button
          className={moveMode === "edit" ? styles.active : ""}
          onClick={() => handleModeChange("edit")}
          title="Bewerken en selecteren"
        >
          Bewerken
        </button>
        <button
          className={moveMode === "line" ? styles.active : ""}
          onClick={() => handleModeChange("line")}
          title="Verplaats geselecteerde regels"
          disabled={selectionCount === 0} // Disabled als geen selecties
        >
          Regels
        </button>
        <button
          className={moveMode === "poem" ? styles.active : ""}
          onClick={() => handleModeChange("poem")}
          title="Verplaats het hele gedicht"
        >
          Gedicht
        </button>
      </div>
      <div className={styles.status}>{statusText}</div>
    </div>
  );
}
