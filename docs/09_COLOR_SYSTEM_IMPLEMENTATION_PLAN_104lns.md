# Color System Implementation Plan

## Current State Analysis
- **Global Color**: `fillColor` affects poem lines
- **Title Color**: `titleColor` affects poem title (independent)
- **Author Color**: `authorColor` affects poem author (independent)
- **Line Overrides**: Individual line colors via `lineOverrides`
- **State Management**: Colors stored in `useCanvasState` hook

## New Color Hierarchy & Priority System

### Priority Order (highest to lowest):
1. **Specific Overrides** (title/author specific colors when set)
2. **Global Color** (fallback for title/author when no specific color set)
3. **Default Colors** (system defaults)

### State Structure Changes:
```javascript
// New state additions
const [titleColorOverride, setTitleColorOverride] = useState(null); // null = use global
const [authorColorOverride, setAuthorColorOverride] = useState(null); // null = use global
const [colorSyncMode, setColorSyncMode] = useState(false); // sync global changes to all
```

### Computed Colors:
```javascript
const effectiveTitleColor = titleColorOverride || fillColor;
const effectiveAuthorColor = authorColorOverride || fillColor;
```

## Implementation Steps

### 1. State Management Updates
- [ ] Add `titleColorOverride` and `authorColorOverride` to `useCanvasState`
- [ ] Add `colorSyncMode` for global synchronization
- [ ] Create computed `effectiveTitleColor` and `effectiveAuthorColor`

### 2. Handler Updates
- [ ] Update `useCanvasHandlers` to handle title/author color changes
- [ ] Add reset handlers for title/author colors
- [ ] Add global color sync handler with conflict detection

### 3. UI Component Updates
- [ ] Update `Controls.jsx` with new color preview logic
- [ ] Add reset buttons for title/author colors
- [ ] Add visual indicators for color sources
- [ ] Add tooltips explaining color priority
- [ ] Add global sync button with confirmation dialog

### 4. Rendering Updates
- [ ] Update `CanvasContent.jsx` to use effective colors
- [ ] Update `useTextStyles` to handle new color logic
- [ ] Ensure proper color inheritance

### 5. CSS Updates
- [ ] Add styles for reset buttons
- [ ] Add styles for visual indicators
- [ ] Add styles for tooltips
- [ ] Add styles for confirmation dialog

## Color Preview Logic

### Title Color Selector:
```javascript
const titlePreviewColor = titleColorOverride || fillColor;
const showTitleReset = titleColorOverride !== null;
```

### Author Color Selector:
```javascript
const authorPreviewColor = authorColorOverride || fillColor;
const showAuthorReset = authorColorOverride !== null;
```

## Visual Indicators

### Color Source Indicators:
- **Global**: Subtle border around color picker
- **Specific**: Bold border + icon indicating override
- **Sync Mode**: Special indicator when sync is active

### Tooltips:
- "Using global color" - when no override
- "Custom color active" - when override exists
- "Click to reset to global" - on reset buttons

## Global Synchronization Feature

### Sync Behavior:
1. When global color changes AND sync mode is ON:
   - Check for existing title/author overrides
   - Show confirmation dialog if conflicts exist
   - Apply global color to all elements if confirmed

### Confirmation Dialog:
- Lists elements that will lose custom colors
- Option to proceed or cancel
- "Don't show again" checkbox

## Error Handling & Validation

### Edge Cases:
- [ ] Handle invalid color values
- [ ] Prevent infinite loops in color updates
- [ ] Handle missing color state gracefully
- [ ] Validate color format before applying

### User Feedback:
- [ ] Show success messages for color changes
- [ ] Show warnings for potential data loss
- [ ] Provide clear error messages for invalid operations

## Testing Scenarios

### Basic Functionality:
- [ ] Global color changes affect title/author when no overrides
- [ ] Title/author overrides work independently
- [ ] Reset buttons restore global color usage
- [ ] Visual indicators show correct color sources

### Advanced Scenarios:
- [ ] Global sync with existing overrides
- [ ] Color picker shows correct preview colors
- [ ] Tooltips provide helpful information
- [ ] Confirmation dialog appears at appropriate times

### Edge Cases:
- [ ] Multiple rapid color changes
- [ ] Switching between sync modes
- [ ] Handling invalid color inputs
- [ ] Browser compatibility for color inputs