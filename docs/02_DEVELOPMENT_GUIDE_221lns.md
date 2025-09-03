# 🚀 PIXI Canvas Development Guide

## Gecombineerde Debug Strategy: Custom Tools + PIXI DevTools

Dit document beschrijft de development workflow en debug strategieën voor het PIXI Canvas leerproject.

---

## 📋 Quick Start Debug Workflow

### 1. **Activeer Debug Mode**
```javascript
// In browser console:
window.debugCanvas.toggle()  // Enable/disable debug overlay
```

### 2. **Open PIXI DevTools**
- Install: PIXI DevTools browser extension (reeds geïnstalleerd)
- Open: F12 → PIXI tab
- Scene Graph: Zie component hierarchy (MainViewport, ContentContainer)

### 3. **Monitor Real-time**
- **Custom Overlay**: Positioning, bounds, formulas
- **PIXI DevTools**: Scene graph, properties, performance

---

## 🔧 Debug Commands Reference

### **Console Commands (Development Only)**
```javascript
// Toggle debug overlay
window.debugCanvas.toggle()

// Get current positioning state
window.debugCanvas.getState()

// Log detailed analysis to console
window.debugCanvas.logPositioning()

// Reset camera to calculated center
window.debugCanvas.resetViewport()

// Enable/disable individually
window.debugCanvas.enable()
window.debugCanvas.disable()
```

### **PIXI DevTools Integration**
- **Scene Graph**: Components named for easy identification
  - `MainViewport` - The pixi-viewport instance
  - `ContentContainer` - Main content container
- **Properties**: Real-time property inspection
- **Performance**: Frame rate and render stats

---

## 🎯 Testing Strategies by Learning Focus

### **Focus 1: X Positioning Mastery (Primary)**

**Goal**: Understand how text alignment affects positioning without causing drift

#### **Debug Setup**:
1. Enable debug overlay: `window.debugCanvas.enable()`
2. Watch: "Content Position X" (should remain stable)
3. Open PIXI DevTools → Select `ContentContainer`

#### **Test Protocol**:
```
1. Change alignment: Links → Midden → Rechts
2. Monitor debug overlay: Content Position X
3. EXPECTED: X value never changes (e.g., always 400px)
4. PIXI DevTools: Verify container.x stays constant
5. RESULT: ✅ No drift = concept mastered
```

#### **Learning Points**:
- Container position vs text anchor difference
- Why `content.x` is stable regardless of alignment
- How `getLocalBounds()` vs `getBounds()` affects calculations

---

### **Focus 2: Y Positioning Understanding (Simplified)**

**Goal**: Understand the simple 20%-from-top formula

#### **Debug Setup**:
1. Enable debug overlay
2. Watch: "Calculated Camera Y" and "Formula"
3. Test with different screen sizes

#### **Test Protocol**:
```
1. Move font size slider (12px → 72px)
2. Monitor: Content should stay at ~20% from viewport top
3. Debug shows: Formula calculation in real-time
4. EXPECTED: Visual position stable, formula values change
5. RESULT: ✅ Simple math works consistently
```

#### **Learning Points**:
- Viewport camera coordinates vs visual positioning
- Why `content.y + (screenHeight * 0.3)` = 20% from top
- Math behind viewport centering

---

### **Focus 3: Bounds Understanding (Advanced)**

**Goal**: Understand local vs world coordinate systems

#### **Debug Setup**:
1. Debug overlay enabled
2. PIXI DevTools open
3. Compare "Local vs World" bounds in overlay

#### **Test Protocol**:
```
1. Pan viewport manually (drag)
2. Compare Local vs World bounds in debug
3. PIXI DevTools: Inspect container bounds
4. EXPECTED: Local bounds stable, World bounds change with pan
5. RESULT: ✅ Coordinate system concept clear
```

---

## 🧪 Advanced Development Techniques

### **1. Custom Debug Data Logging**

```javascript
// Log positioning analysis
window.debugCanvas.logPositioning()

// Output includes:
// - Screen: aspect ratio, type, dimensions
// - Viewport: center, scale, size
// - Content: position, local/world bounds
// - Positioning: calculated centers, formulas
```

### **2. PIXI DevTools Scene Graph Navigation**

```
MainViewport (pixi-viewport)
├── ContentContainer (container at x: canvasWidth/2)
│   ├── Title Text (anchor: varies by alignment)
│   ├── Author Text (anchor: varies by alignment)  
│   └── Poem Lines (multiple Text objects)
```

### **3. Performance Monitoring**

**PIXI DevTools Performance Tab**:
- Frame rate monitoring
- Render call analysis  
- Memory usage tracking

**Custom Performance Hooks** (Future Enhancement):
```javascript
// Add to debug manager for performance insights
window.debugCanvas.getPerformanceStats()
```

---

## 🎨 Visual Debug Strategies

### **1. Color-Coded Debugging**

```javascript
// Future enhancement: Visual debug overlays
// - Red: Container boundaries
// - Green: Text anchor points  
// - Blue: Viewport center
// - Yellow: Calculated positions
```

### **2. Grid Overlay System**

```javascript
// Future enhancement: Grid overlay for positioning
window.debugCanvas.showGrid()    // 20% markings
window.debugCanvas.showRulers()  // Pixel measurements
```

---

## 📊 Common Debug Scenarios

### **Scenario 1: "Text is drifting when I change alignment"**

**Debug Steps**:
1. Enable debug overlay
2. Change alignment while watching "Content Position X"
3. If X changes → Bug in container positioning
4. If X stable → Check anchor calculations

**Expected**: X should NEVER change (e.g., always 400px)

### **Scenario 2: "Content moves down when I change font size"**

**Debug Steps**:
1. Monitor "Calculated Camera Y" 
2. Check "Formula" shows correct calculation
3. Verify content.y (from useResponsiveTextPosition)

**Expected**: Formula should maintain 20% from top positioning

### **Scenario 3: "Performance issues during interaction"**

**Debug Steps**:
1. PIXI DevTools → Performance tab
2. Monitor frame rate during viewport interactions
3. Check render call frequency
4. Use `window.debugCanvas.logPositioning()` to check update frequency

---

## 🚧 Future Development Enhancements

### **Phase 1: Enhanced Visual Debug**
- Container boundary visualization
- Anchor point indicators
- Grid overlay system
- Viewport center crosshair

### **Phase 2: Interactive Debug Tools**  
- Click-to-inspect elements
- Drag-to-position controls
- Real-time formula editor
- Performance bottleneck highlighter

### **Phase 3: Export Debug Data**
- Save positioning analysis to file
- Export PIXI DevTools data
- Create debug reports for optimization
- A/B test different positioning strategies

---

## 📚 Learning Progression Recommendations

### **Beginner → Intermediate**
1. **Master X positioning** using debug overlay + alignment tests
2. **Understand Y formula** using screen size changes + debug info
3. **Learn bounds concepts** using PIXI DevTools scene graph

### **Intermediate → Advanced**
1. **Custom viewport controls** using debug reset functionality
2. **Performance optimization** using PIXI DevTools insights
3. **Complex positioning scenarios** using combined debug strategies

### **Advanced → Expert**
1. **Contribute to debug tools** by extending DebugManager
2. **Create teaching materials** using debug data exports
3. **Optimize for production** by analyzing debug performance data

---

## ⚙️ Debug Tool Configuration

### **Development Mode Only**
- Debug tools automatically disabled in production builds
- Console commands only available when `import.meta.env.DEV === true`
- Performance impact minimal in development mode

### **PIXI DevTools Integration**
- Automatic component naming for easy identification
- Enhanced property inspection
- Scene graph navigation optimization

### **Custom Debug Manager**
- Singleton pattern prevents multiple instances
- RAF-based monitoring for smooth performance
- Automatic cleanup on disable

---

## 🎯 Success Metrics

### **X Positioning Mastery**
- ✅ Can change text alignment without position drift  
- ✅ Understands container vs anchor concepts
- ✅ Can debug positioning issues independently

### **Y Positioning Understanding**
- ✅ Can predict visual position from formula
- ✅ Understands viewport camera coordinate system
- ✅ Can adjust positioning for different screen sizes

### **Tool Proficiency**
- ✅ Uses debug overlay effectively for troubleshooting
- ✅ Navigates PIXI DevTools scene graph confidently
- ✅ Combines multiple debug sources for problem solving

---

**This guide evolves with your learning journey. Update it as you discover new techniques and debugging strategies!**