// src/pages/CanvasPage/components/MoveControls.jsx
import React from "react";
import styles from "./MoveControls.module.css";

export default function MoveControls({ moveMode, setMoveMode, selectedLines, clearSelection, activeShortcut }) {
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
    statusText = "Click lines to select them";
  } else if (moveMode === 'line') {
    if (selectionCount === 0) {
      statusText = "⚠️ No lines selected";
    } else {
      statusText = `✓ Moving ${selectionCount} line${selectionCount > 1 ? 's' : ''}`;
    }
  } else if (moveMode === 'poem') {
    statusText = "Moving entire poem";
  }

  return (
    <div className={styles.moveControlsContainer}>
      <div className={styles.moveLabel}>Modus</div>
      <div className={styles.buttonGroup}>
        {/* Edit mode button */}
        <button
          className={moveMode === "edit" ? styles.active : ""}
          onClick={() => handleModeChange("edit")}
          title="Edit and select individual lines"
        >
          Edit/Select Mode
        </button>
        <button
          className={moveMode === "line" ? styles.active : ""}
          onClick={() => handleModeChange("line")}
          title="Move selected lines"
          disabled={selectionCount === 0} // Disabled when no selections
        >
          Line Move
        </button>
        <button
          className={moveMode === "poem" ? styles.active : ""}
          onClick={() => handleModeChange("poem")}
          title="Move entire poem"
        >
          Poem Move
        </button>
      </div>
      <div className={styles.status}>{statusText}</div>
    </div>
  );
}
