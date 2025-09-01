// src/pages/CanvasPage/components/MoveControls.jsx
import React from "react";
import styles from "./MoveControls.module.css";

export default function MoveControls({ moveMode, setMoveMode, selectedLines }) {
  const selectionCount = selectedLines.size;

  // Dynamische tekst voor de status
  let statusText = "Hele gedicht";
  if (moveMode === "line") {
    if (selectionCount === 0) {
      statusText = "Selecteer een regel";
    } else if (selectionCount === 1) {
      statusText = "1 regel geselecteerd";
    } else {
      statusText = `${selectionCount} regels geselecteerd`;
    }
  }

  return (
    <div className={styles.moveControlsContainer}>
      <div className={styles.moveLabel}>Verplaatsen</div>
      <div className={styles.buttonGroup}>
        <button
          className={moveMode === "poem" ? styles.active : ""}
          onClick={() => setMoveMode("poem")}
          title="Verplaats het hele gedicht"
        >
          Gedicht
        </button>
        <button
          className={moveMode === "line" ? styles.active : ""}
          onClick={() => setMoveMode("line")}
          title="Verplaats geselecteerde regels"
        >
          Regels
        </button>
      </div>
      <div className={styles.status}>{statusText}</div>
    </div>
  );
}
