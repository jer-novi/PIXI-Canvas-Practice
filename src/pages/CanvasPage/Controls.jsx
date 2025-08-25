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
}) {
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
      {/* --- NIEUW: Color Picker --- */}
      <div className={styles.controlRow}>
        <label htmlFor="fillColor">Kleur</label>
        <input
          type="color"
          id="fillColor"
          value={fillColor}
          onChange={(e) => onFillColorChange(e.target.value)}
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
          value={letterSpacing}
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
    </div>
  );
}
