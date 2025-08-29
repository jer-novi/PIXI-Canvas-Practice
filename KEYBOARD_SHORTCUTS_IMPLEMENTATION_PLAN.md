# Keyboard Shortcuts Implementation Plan

## Current Architecture Analysis

### ✅ Existing Multiselect Infrastructure
- **Selection Management**: `useSelection` hook manages `selectedLines` (Set), `lastSelectedLine`, and selection handlers
- **Selection Flow**: `useCanvasState` → `useCanvasHandlers` → `CanvasPage` → `CanvasContent` → `PoemLine` components
- **Current Features**: Single click, Ctrl/Cmd-click toggle, Shift-click range selection
- **Escape Key**: Already implemented in `useCanvasHandlers.js` (clears all selections)

### ✅ Routing & Test Data
- **Routing**: Uses React Router with URLSearchParams, defaults to `poemId=123`
- **Test Data**: Located in `src/data/testdata.js`, poem with id 123 has 4 lines
- **Routing Preservation**: Handled via `useEffect` in `CanvasContent.jsx` (lines 50-56)

## Implementation Strategy

### 1. Alt-A Multiselect All Functionality
**Target**: Select all poem lines simultaneously for bulk operations

**Changes Required**:
- **`useSelection.js`**: Add `selectAll(totalLines)` function
- **`useCanvasHandlers.js`**: Add Alt-A keyboard event handler
- **Integration**: Use existing selection architecture without breaking current functionality

### 2. Enhanced Escape Key Support
**Target**: Clear all selections and reset to default state

**Current Status**: ✅ Already implemented
- Escape key handler exists in `useCanvasHandlers.js`
- Calls existing `clearSelection()` function

### 3. Implementation Details

#### useSelection.js Changes
```javascript
// Add selectAll function
const selectAll = useCallback((totalLines) => {
  const allLines = new Set();
  for (let i = 0; i < totalLines; i++) {
    allLines.add(i);
  }
  setSelectedLines(allLines);
  setLastSelectedLine(totalLines - 1); // Set last selected to final line
}, []);

// Return selectAll in hook interface
return {
  selectedLines,
  handleSelect,
  clearSelection,
  selectAll, // NEW
  isSelected,
};
```

#### useCanvasHandlers.js Changes
```javascript
// Add Alt-A handler to existing keyboard event listener
const handleKeyDown = (event) => {
  // Existing Escape functionality
  if (event.key === "Escape") {
    clearSelection();
  }
  
  // NEW: Alt-A select all
  if (event.altKey && event.key === "a") {
    event.preventDefault(); // Prevent browser Alt-A behavior
    if (currentPoem?.lines) {
      selectAll(currentPoem.lines.length);
    }
  }
  
  // Existing Ctrl viewport functionality
  if (event.ctrlKey && !viewportDragEnabled) {
    setViewportDragEnabled(true);
  }
};
```

#### Integration Requirements
- Pass `selectAll` function from `useSelection` through state management chain
- Access current poem data in handlers to determine total line count
- Maintain existing event handling without conflicts

### 4. Testing Strategy
1. **Alt-A Functionality**: Verify all lines become selected simultaneously
2. **Bulk Operations**: Test color changes and letter spacing on all selected lines
3. **Escape Key**: Verify all selections clear properly
4. **Routing Preservation**: Ensure poemId=123 remains in URL throughout interaction
5. **Existing Features**: Verify single-click, Ctrl-click, Shift-click still work
6. **Browser Integration**: Test in localhost:5173/?poemId=123

### 5. Risk Mitigation
- **Event Conflicts**: Use `preventDefault()` for Alt-A to avoid browser shortcuts
- **State Consistency**: Leverage existing selection architecture to maintain consistency
- **Performance**: Selection uses Set data structure, already optimized for large selections
- **Accessibility**: Alt-A is a common "Select All" shortcut, maintaining UX expectations

## Implementation Order
1. ✅ Analyze existing codebase 
2. ✅ Plan integration architecture
3. **Next**: Implement `selectAll` function in `useSelection.js`
4. **Next**: Add Alt-A handler in `useCanvasHandlers.js`
5. **Next**: Test functionality with existing features
6. **Next**: Verify routing and poemId preservation

## Success Criteria
- [ ] Alt-A selects all poem lines simultaneously
- [ ] Selected lines can receive bulk style operations (color, spacing)
- [ ] Escape key clears all selections
- [ ] URL maintains `poemId=123` throughout interactions
- [ ] Existing multiselect features remain functional
- [ ] Test poem display remains stable during implementation