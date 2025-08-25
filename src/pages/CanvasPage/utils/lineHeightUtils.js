// Utilities for managing line-height logic in relation to font size

/**
 * Compute initial line-height based on a base font size and multiplier.
 */
export function getInitialLineHeight(baseFontSize = 36, multiplier = 1.4) {
  return baseFontSize * multiplier;
}

/**
 * Compute line-height synced to a given font size with the current multiplier.
 */
export function syncLineHeightWithFontSize(fontSize, multiplier) {
  return fontSize * multiplier;
}

/**
 * Compute multiplier from a given line-height and font size.
 */
export function computeMultiplierFromLineHeight(lineHeight, fontSize) {
  return fontSize ? lineHeight / fontSize : 0;
}

/**
 * Handler util to process font size change.
 * Calls provided React state setters.
 */
export function handleFontSizeChangeUtil(newSize, {
  userHasAdjusted,
  lineHeightMultiplier,
  setFontSize,
  setLineHeight,
}) {
  setFontSize(newSize);
  if (!userHasAdjusted) {
    setLineHeight(syncLineHeightWithFontSize(newSize, lineHeightMultiplier));
  }
}

/**
 * Handler util to process line-height change.
 * Calls provided React state setters.
 */
export function handleLineHeightChangeUtil(newHeight, {
  userHasAdjusted,
  setUserHasAdjusted,
  setLineHeight,
  fontSize,
  setLineHeightMultiplier,
}) {
  if (!userHasAdjusted) {
    setUserHasAdjusted(true);
  }
  setLineHeight(newHeight);
  setLineHeightMultiplier(computeMultiplierFromLineHeight(newHeight, fontSize));
}

/**
 * Reset util to restore line-height system to default values.
 * Also resets the multiplier and clears the user-adjusted flag.
 */
export function resetLineHeightUtil({
  baseFontSize = 36,
  defaultMultiplier = 1.4,
  setLineHeight,
  setLineHeightMultiplier,
  setUserHasAdjusted,
}) {
  setLineHeight(getInitialLineHeight(baseFontSize, defaultMultiplier));
  setLineHeightMultiplier(defaultMultiplier);
  setUserHasAdjusted(false);
}
