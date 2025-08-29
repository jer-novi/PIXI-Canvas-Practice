// src/pages/CanvasPage/Controls.jsx

import React from "react";
import styles from "./CanvasPage.module.css";

export default function Controls({
  fontSize,
  onFontSizeChange,
  fillColor,
  onFillColorChange,
  letterSpacing,
  onLetterSpacingChange,
  lineHeight,
  onLineHeightChange,
  lineHeightMultiplier,
  onLineHeightMultiplierChange,
  onLineLetterSpacingChange, // <-- DEZE ONTBRAK!
  onResetLineHeight,
  textAlign,
  onTextAlignChange,
  selectedLines, // <-- Nieuw: Set object
  lineOverrides, // <-- Nieuw: voor het tonen van override-waardes
  onLineColorChange,
  handleResetSelectedLines, // <-- Hernoemde handler
  viewportDragEnabled,
  onViewportToggle,
  onColorPickerActiveChange,
  titleColor,
  onTitleColorChange,
  authorColor,
  onAuthorColorChange,
}) {
  // Afgeleide state voor de UI
  const selectionCount = selectedLines.size;
  const hasSelection = selectionCount > 0;
  const singleSelectedLineIndex =
    selectionCount === 1 ? selectedLines.values().next().value : null;

  // Bepaal welke kleur getoond wordt in de kleurkiezer
  const displayedColor =
    singleSelectedLineIndex !== null
      ? lineOverrides[singleSelectedLineIndex]?.fillColor ?? fillColor // Override of globale kleur
      : fillColor; // Globale kleur bij geen of meervoudige selectie

  const displayedLetterSpacing =
    singleSelectedLineIndex !== null
      ? lineOverrides[singleSelectedLineIndex]?.letterSpacing ?? letterSpacing
      : letterSpacing;

  // Handler voor de kleurkiezer
  const handleColorInput = (color) => {
    if (hasSelection) {
      onLineColorChange(color);
    } else {
      onFillColorChange(color);
    }
  };

  return (
    <div className={styles.controlsWrapper}>
      <h2>Styling Controls</h2>

      {/* ... (fontSize, letterSpacing, etc. blijven hetzelfde voor nu) ... */}
      <div className={styles.controlRow}>
        <label htmlFor="fontSize">Lettergrootte</label>
        <input
          type="range"
          id="fontSize"
          min="12"
          max="72"
          value={fontSize}
          onChange={(e) => onFontSizeChange(Number(e.target.value))}
        />
        <span>{fontSize}px</span>
      </div>

      {/* --- Color Picker met Multi-Select Support --- */}
      <div
        className={`${styles.controlRow} ${
          hasSelection ? styles.controlColumn : ""
        }`}
      >
        <label htmlFor="fillColor">
          {hasSelection
            ? `Kleur (${selectionCount} ${
                selectionCount === 1 ? "regel" : "regels"
              })`
            : "Globale Kleur"}
        </label>
        <div className={styles.colorControls}>
          <input
            type="color"
            id="fillColor"
            value={displayedColor}
            onChange={(e) => handleColorInput(e.target.value)}
            onFocus={() => onColorPickerActiveChange?.(true)}
            onBlur={() => onColorPickerActiveChange?.(false)}
          />
          {hasSelection && (
            <div className={styles.lineControls}>
              <span className={styles.hintText}>
                {selectionCount > 1
                  ? "Pas kleur toe op alle geselecteerde regels."
                  : "Kleur voor de geselecteerde regel."}
              </span>
              <button
                type="button"
                className={styles.resetButton}
                onClick={handleResetSelectedLines}
              >
                Reset stijl
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ... (andere controls zoals Title, Author, etc.) ... */}
      <div className={styles.controlRow}>
        <label htmlFor="titleColor">Titel Kleur</label>
        <input
          type="color"
          id="titleColor"
          value={titleColor}
          onChange={(e) => onTitleColorChange(e.target.value)}
        />
      </div>
      <div className={styles.controlRow}>
        <label htmlFor="authorColor">Auteur Kleur</label>
        <input
          type="color"
          id="authorColor"
          value={authorColor}
          onChange={(e) => onAuthorColorChange(e.target.value)}
        />
      </div>
      <div className={styles.controlRow}>
        <label htmlFor="letterSpacing">
          {hasSelection
            ? `Afstand (${selectionCount} ${
                selectionCount === 1 ? "regel" : "regels"
              })`
            : "Letterafstand"}
        </label>
        <input
          type="range"
          id="letterSpacing"
          min="-5"
          max="15"
          value={`${displayedLetterSpacing}`}
          onChange={(e) => {
            const newSpacing = Number(e.target.value);
            if (hasSelection) {
              onLineLetterSpacingChange(newSpacing);
            } else {
              onLetterSpacingChange(newSpacing);
            }
          }}
        />
        <span>{displayedLetterSpacing}px</span>
      </div>
      <div className={styles.controlGroup}>
        <label htmlFor="lineHeightMultiplier">Regelhoogte (verhouding)</label>
        <input
          className={styles.fullWidthRange}
          type="range"
          id="lineHeightMultiplier"
          min={1.0}
          max={2.5}
          step={0.01}
          value={lineHeightMultiplier}
          onChange={(e) =>
            onLineHeightMultiplierChange(parseFloat(e.target.value))
          }
        />
        <div className={styles.valueRow}>
          <span>{lineHeightMultiplier.toFixed(2)}×</span>
          <span>{Math.round(fontSize * lineHeightMultiplier)}px</span>
        </div>
        <div className={styles.controlRow}>
          <button
            type="button"
            className={styles.resetButton}
            onClick={onResetLineHeight}
          >
            Reset verhouding
          </button>
        </div>
      </div>
      <div className={styles.controlRow}>
        <label>Uitlijning</label>
        <div className={styles.buttonGroup}>
          <button
            className={textAlign === "left" ? styles.active : ""}
            onClick={() => onTextAlignChange("left")}
          >
            Links
          </button>
          <button
            className={textAlign === "center" ? styles.active : ""}
            onClick={() => onTextAlignChange("center")}
          >
            Midden
          </button>
          <button
            className={textAlign === "right" ? styles.active : ""}
            onClick={() => onTextAlignChange("right")}
          >
            Rechts
          </button>
        </div>
      </div>
      <div className={styles.controlRow}>
        <label>Camera Control</label>
        <div className={styles.buttonGroup}>
          <button
            className={viewportDragEnabled ? styles.active : ""}
            onClick={() => onViewportToggle(true)}
          >
            Enabled (Ctrl+Drag)
          </button>
          <button
            className={!viewportDragEnabled ? styles.active : ""}
            onClick={() => onViewportToggle(false)}
          >
            Disabled
          </button>
        </div>
      </div>
    </div>
  );
}
