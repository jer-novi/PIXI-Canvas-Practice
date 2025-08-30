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
  onLineColorChange,
  handleResetSelectedLines, // <-- Hernoemde handler
  viewportDragEnabled,
  onViewportToggle,
  onColorPickerActiveChange,

  // Hierarchical color system properties
  effectiveTitleColor,
  effectiveAuthorColor,
  hasTitleColorOverride,
  hasAuthorColorOverride,
  onTitleColorChange,
  onAuthorColorChange,
  onResetTitleColor,
  onResetAuthorColor,

  // Deprecated: keeping for backward compatibility
  titleColor,
  authorColor,

  fontFamily,
  onFontFamilyChange,
  availableFonts,

  // We hebben deze ook nodig om de juiste 'value' te tonen
  selectedLines,
  lineOverrides,
}) {
  const selectionCount = selectedLines.size;
  const hasSelection = selectionCount > 0;
  const singleSelectedLineIndex =
    selectionCount === 1 ? selectedLines.values().next().value : null;

  // Bepaal welke kleur getoond wordt
  const displayedColor =
    singleSelectedLineIndex !== null
      ? lineOverrides[singleSelectedLineIndex]?.fillColor ?? fillColor
      : fillColor;

  // Bepaal welke letterafstand getoond wordt
  const displayedLetterSpacing =
    singleSelectedLineIndex !== null
      ? lineOverrides[singleSelectedLineIndex]?.letterSpacing ?? letterSpacing
      : letterSpacing;

  // ✅ CORRECT: Bepaal hier welk lettertype getoond wordt
  const displayedFontFamily =
    singleSelectedLineIndex !== null
      ? lineOverrides[singleSelectedLineIndex]?.fontFamily ?? fontFamily
      : fontFamily;

  // De handleColorInput functie wordt weer simpel
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

      {/* --- NIEUW: Font Family Dropdown --- */}
      <div className={styles.controlRow}>
        <label htmlFor="fontFamily">Lettertype</label>
        <select
          id="fontFamily"
          value={displayedFontFamily}
          onChange={(e) => onFontFamilyChange(e.target.value)}
          style={{ width: "100%", padding: "4px" }} // simpele styling
        >
          {availableFonts.map((font) => (
            <option key={font.name} value={font.value}>
              {font.name}
            </option>
          ))}
        </select>
      </div>

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
                Reset regelkleur en letterafstand
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Hierarchical Title Color Control */}
      <div className={styles.controlRow}>
        <label htmlFor="titleColor">
          <span className={styles.labelText}>Titel Kleur</span>
          <span className={styles.colorIndicator}>
            {hasTitleColorOverride ? (
              <span
                title="Specifieke titel kleur actief"
                className={styles.overrideActive}
              >
                ⚙️
              </span>
            ) : (
              <span title="Volgt globale kleur" className={styles.globalActive}>
                🔗
              </span>
            )}
          </span>
        </label>
        <div className={styles.colorControls}>
          <input
            type="color"
            id="titleColor"
            value={effectiveTitleColor}
            onChange={(e) => {
              console.log(
                "🔴 TITLE onChange triggered! Value:",
                e.target.value
              );
              onTitleColorChange(e.target.value);
            }}
            title={
              hasTitleColorOverride
                ? "Specifieke titel kleur"
                : "Klik om titel kleur aan te passen (overschrijft globaal)"
            }
          />
          {hasTitleColorOverride && (
            <button
              type="button"
              className={styles.resetColorButton}
              onClick={onResetTitleColor}
              title="Reset naar globale kleur"
            >
              ↺
            </button>
          )}
        </div>
      </div>

      {/* Hierarchical Author Color Control */}
      <div className={styles.controlRow}>
        <label htmlFor="authorColor">
          <span className={styles.labelText}>Auteur Kleur</span>
          <span className={styles.colorIndicator}>
            {hasAuthorColorOverride ? (
              <span
                title="Specifieke auteur kleur actief"
                className={styles.overrideActive}
              >
                ⚙️
              </span>
            ) : (
              <span title="Volgt globale kleur" className={styles.globalActive}>
                🔗
              </span>
            )}
          </span>
        </label>
        <div className={styles.colorControls}>
          <input
            type="color"
            id="authorColor"
            value={effectiveAuthorColor}
            onChange={(e) => onAuthorColorChange(e.target.value)}
            title={
              hasAuthorColorOverride
                ? "Specifieke auteur kleur"
                : "Klik om auteur kleur aan te passen (overschrijft globaal)"
            }
          />
          {hasAuthorColorOverride && (
            <button
              type="button"
              className={styles.resetColorButton}
              onClick={onResetAuthorColor}
              title="Reset naar globale kleur"
            >
              ↺
            </button>
          )}
        </div>
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
