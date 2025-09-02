// src/pages/CanvasPage/Controls.jsx

import React, { useState } from "react"; // <-- useState importeren
import styles from "./CanvasPage.module.css";
import { anwbCities, capitalCities } from "../../data/searchData"; // <-- Importeer steden

export default function Controls({
  fontSize,
  onFontSizeChange,
  fillColor,
  onFillColorChange,
  letterSpacing,
  onLetterSpacingChange,
  lineHeightMultiplier,
  onLineHeightMultiplierChange,
  onLineLetterSpacingChange, // <-- DEZE ONTBRAK!
  onLineFontSizeChange, // <-- NIEUW: Voor fontSize van geselecteerde regels
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

  fontFamily,
  onFontFamilyChange,
  availableFonts,

  // Pexels background props
  photos,
  isLoading,
  error,
  onSearch, // Dit wordt onze handleSearchBackground
  onSetBackground, // Dit wordt onze handleSetBackground
  onCitySearch, // Wordt handleCitySearch
  onNextPage, // wordt handleNextPage
  onPrevPage, // wordt handlePrevPage
  hasNextPage,
  hasPrevPage,
  onResetToCollection, // New prop for resetting to collection
  onOpenPhotoGrid, // New prop to open floating photo grid

  // We hebben deze ook nodig om de juiste 'value' te tonen
  selectedLines,
  lineOverrides,
}) {
  const [query, setQuery] = useState("");
  const [isFreeSearchVisible, setIsFreeSearchVisible] = useState(false);
  const [selectedAnwbCity, setSelectedAnwbCity] = useState("");
  const [selectedCapital, setSelectedCapital] = useState("");

  const selectionCount = selectedLines.size;
  const hasSelection = selectionCount > 0;
  const singleSelectedLineIndex =
    selectionCount === 1 ? Array.from(selectedLines)[0] : null;

  // Bepaal welke kleur getoond wordt
  const displayedColor =
    singleSelectedLineIndex !== null
      ? lineOverrides[String(singleSelectedLineIndex)]?.fillColor ?? fillColor
      : fillColor;

  // Bepaal welke letterafstand getoond wordt
  const displayedLetterSpacing =
    singleSelectedLineIndex !== null
      ? lineOverrides[String(singleSelectedLineIndex)]?.letterSpacing ?? letterSpacing
      : letterSpacing;

  // Bepaal welke lettergrootte getoond wordt voor geselecteerde regel
  const displayedFontSize =
    singleSelectedLineIndex !== null
      ? lineOverrides[String(singleSelectedLineIndex)]?.fontSize ?? fontSize
      : fontSize;

  // ✅ CORRECT: Bepaal hier welk lettertype getoond wordt
  const displayedFontFamily =
    singleSelectedLineIndex !== null
      ? lineOverrides[String(singleSelectedLineIndex)]?.fontFamily ?? fontFamily
      : fontFamily;

  // De handleColorInput functie wordt weer simpel
  const handleColorInput = (color) => {
    if (hasSelection) {
      onLineColorChange(color);
    } else {
      onFillColorChange(color);
    }
  };

  const handleSearchClick = () => {
    if (query.trim()) {
      onSearch(query.trim());
      onOpenPhotoGrid(); // AUTO-OPEN MODAL
    }
  };

  const handleDropdownSearch = (e, dropdownType) => {
    const city = e.target.value;
    if (city) {
      // Reset andere dropdown
      if (dropdownType === "anwb") {
        setSelectedCapital("");
        setSelectedAnwbCity(city);
      } else {
        setSelectedAnwbCity("");
        setSelectedCapital(city);
      }

      // Zoek EN open modal
      onCitySearch(city);
      onOpenPhotoGrid();
    }
  };

  return (
    <div className={styles.controlsWrapper}>
      <h2>Styling Controls</h2>

      {/* --- NIEUWE COMPACTE ACHTERGROND SECTIE --- */}
      <div className={styles.controlSection}>
        <h3>Achtergrond</h3>

        {/* Hoofdknop om foto grid te openen */}
        <button
          onClick={onOpenPhotoGrid}
          className={styles.chooseBackgroundButton}
        >
          🖼️ Kies achtergrond
        </button>

        {/* Dropdown selecties */}
        <div className={styles.controlRow}>
          <select
            value={selectedAnwbCity}
            onChange={(e) => handleDropdownSearch(e, "anwb")}
            className={styles.cityDropdown}
          >
            <option value="">ANWB steden...</option>
            {anwbCities.sort().map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.controlRow}>
          <select
            value={selectedCapital}
            onChange={(e) => handleDropdownSearch(e, "capital")}
            className={styles.cityDropdown}
          >
            <option value="">Hoofdsteden...</option>
            {capitalCities.sort().map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>

        {/* Button row: Vrij zoeken + Reset collectie */}
        <div className={styles.buttonRow}>
          <button
            onClick={() => {
              const willOpen = !isFreeSearchVisible;
              setIsFreeSearchVisible(willOpen);

              // Reset dropdowns wanneer vrij zoeken wordt geopend
              if (willOpen) {
                setSelectedAnwbCity("");
                setSelectedCapital("");
              }
            }}
          >
            {isFreeSearchVisible ? "← Terug" : "Vrij zoeken"}
          </button>
          <button
            onClick={() => {
              setSelectedAnwbCity(""); // Reset ANWB dropdown
              setSelectedCapital(""); // Reset hoofdsteden dropdown
              onResetToCollection();
              onOpenPhotoGrid();
            }}
          >
            Reset collectie
          </button>
        </div>

        {/* Vrij zoeken input (alleen als visible) */}
        {isFreeSearchVisible && (
          <div className={styles.freeSearchSection}>
            <div className={styles.controlRow}>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter" && query.trim()) {
                    onSearch(query);
                    onOpenPhotoGrid();
                  }
                }}
                placeholder="Zoek een achtergrond..."
                className={styles.searchInput}
              />
              <button
                onClick={() => handleSearchClick()}
                disabled={isLoading}
                className={styles.searchButton}
              >
                {isLoading ? "..." : "Zoek"}
              </button>
            </div>
          </div>
        )}

        {error && <p className={styles.errorMessage}>{error}</p>}
      </div>

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

      {/* NIEUW: Conditionale fontSize slider voor geselecteerde regels */}
      {hasSelection && (
        <div className={styles.controlRow}>
          <label htmlFor="lineFontSize">
            Lettergrootte ({selectionCount} {selectionCount === 1 ? "regel" : "regels"})
          </label>
          <input
            type="range"
            id="lineFontSize"
            min="12"
            max="72" 
            value={displayedFontSize}
            onChange={(e) => onLineFontSizeChange(Number(e.target.value))}
          />
          <span>{displayedFontSize}px</span>
        </div>
      )}

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
