import React, { useRef, useState } from "react";
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
  onResetLineHeight,
  textAlign,
  onTextAlignChange,
  selectedLine,
  onLineColorChange,
  onResetSelectedLine,
  viewportDragEnabled,
  onViewportToggle,
  onColorPickerActiveChange,
  titleColor,
  onTitleColorChange,
  authorColor,
  onAuthorColorChange,
}) {
  // RAF-throttled color updates to avoid overloading GPU while dragging the color picker
  const rafIdRef = useRef(null);
  const pendingColorRef = useRef(null);

  // Track color picker active state
  const [isColorPickerActive, setIsColorPickerActive] = useState(false);

  const scheduleColorUpdate = (color) => {
    pendingColorRef.current = color;
    if (rafIdRef.current) return;
    rafIdRef.current = requestAnimationFrame(() => {
      rafIdRef.current = null;
      const next = pendingColorRef.current;
      if (next == null) return;
      if (selectedLine !== null) {
        onLineColorChange(next);
      } else {
        onFillColorChange(next);
      }
    });
  };

  return (
    <div className={styles.controlsWrapper}>
      <h2>Styling Controls</h2>
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
      {/* --- Color Picker with Line Selection Support --- */}
      <div
        className={`${styles.controlRow} ${
          selectedLine !== null ? styles.controlColumn : ""
        }`}
      >
        <label htmlFor="fillColor">
          {selectedLine !== null
            ? `Lijn ${selectedLine + 1} Kleur`
            : "Globale Kleur"}
        </label>
        <div className={styles.colorControls}>
          <input
            type="color"
            id="fillColor"
            value={fillColor}
            onInput={(e) => scheduleColorUpdate(e.target.value)}
            onChange={(e) => scheduleColorUpdate(e.target.value)}
            onFocus={() => {
              setIsColorPickerActive(true);
              onColorPickerActiveChange?.(true);
            }}
            onBlur={() => {
              setIsColorPickerActive(false);
              onColorPickerActiveChange?.(false);
            }}
          />
          {selectedLine !== null && (
            <div className={styles.lineControls}>
              <span className={styles.hintText}>
                Selecteer geen lijn voor globale kleur
              </span>
              <button
                type="button"
                className={styles.resetButton}
                onClick={onResetSelectedLine}
              >
                Reset lijn-stijl
              </button>
            </div>
          )}
        </div>
      </div>

      {/* --- Title Color Picker --- */}
      <div className={styles.controlRow}>
        <label htmlFor="titleColor">Titel Kleur</label>
        <input
          type="color"
          id="titleColor"
          value={titleColor}
          onChange={(e) => onTitleColorChange(e.target.value)}
        />
      </div>

      {/* --- Author Color Picker --- */}
      <div className={styles.controlRow}>
        <label htmlFor="authorColor">Auteur Kleur</label>
        <input
          type="color"
          id="authorColor"
          value={authorColor}
          onChange={(e) => onAuthorColorChange(e.target.value)}
        />
      </div>

      {/* --- NIEUW: Letter Spacing Slider --- */}
      <div className={styles.controlRow}>
        <label htmlFor="letterSpacing">Letterafstand</label>
        <input
          type="range"
          id="letterSpacing"
          min="-5"
          max="15"
          value={`${letterSpacing}`} // Template literal converteert naar string
          onChange={(e) => onLetterSpacingChange(Number(e.target.value))}
        />
        <span>{letterSpacing}px</span>
      </div>

      {/* --- NIEUW: Line Height Multiplier Slider (vertical layout) --- */}
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
        {/* Reset knop voor regelhoogte */}
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

      {/* Viewport Control Toggle */}
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

      {/* Selection Info */}
      {selectedLine !== null && (
        <div className={styles.controlRow}>
          <span
            style={{ fontSize: "14px", color: "#ffff00", fontWeight: "bold" }}
          >
            Lijn {selectedLine + 1} geselecteerd - Druk Escape om te
            deselecteren
          </span>
        </div>
      )}
    </div>
  );
}
