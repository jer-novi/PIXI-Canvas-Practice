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

      {/* --- NIEUW: Line Height Slider --- */}
      <div className={styles.controlRow}>
        <label htmlFor="lineHeight">Regelhoogte</label>
        <input
          type="range"
          id="lineHeight"
          min={fontSize * 1.2}
          max={fontSize * 2.5}
          value={lineHeight}
          onChange={(e) => onLineHeightChange(Number(e.target.value))}
        />
        <span>{lineHeight.toFixed(0)}px</span>
      </div>
    </div>
  );
}
