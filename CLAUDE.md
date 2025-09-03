# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React 19 + Vite application focused on responsive PixiJS canvas rendering for text display and typography. The project serves as a practice/preparation project for the more complex canvas component of the NOVI final project "gedichtgevel.nl". The goal is to build a robust, interactive text editor on a PIXI.js canvas through step-by-step guided learning.

The project features a sophisticated responsive layout system with fixed-width control panels and dynamic canvas sizing, integrated with `pixi-viewport` for interactive camera controls.

### Current Implementation Status

**Completed Features:**
- **Responsive Layout**: Full-screen three-column layout with panels for controls, canvas, and navigation built with CSS Flexbox and custom `useResponsiveCanvas` hook
- **PIXI Canvas Foundation**: Working `@pixi/react` canvas that can render a mock poem (title, author, lines)
- **Custom Font Loading**: `useFontLoader` hook that loads WOFF2 fonts and manages loading state to prevent Flash of Unstyled Text
- **Interactive Styling Controls**: Controls component built using "Lifting State Up" pattern with working sliders and inputs for fontSize, fillColor, letterSpacing, and lineHeight, including smart logic that scales lineHeight with fontSize until manually adjusted
- **Camera System**: `pixi-viewport` integration for pan and zoom functionality with custom `useAutoRecenter` hook for smooth automatic re-centering when canvas or text changes size
- **Font Synchronization**: "Sync All Fonts" button that resets all line-level font overrides and applies Montserrat as fallback font
- **Pexels Background System**: Complete integration with Pexels API for searchable background images, including responsive thumbnail grid and real-time background application using modern PIXI v8+ Assets.load() pattern
- **Floating Photo Grid**: Modal-style photo selector with smooth animations, pagination controls, and overlay system for better UX
- **Advanced Selection System**: Multi-line selection with Ctrl/Cmd+click for non-adjacent lines, Shift+click for range selection, and Escape key for deselection
- **Drag-and-Drop System**: Modern PIXI v8+ drag-and-drop implementation with three interaction modes (Edit/Select, Line Move, Global Move) using proper event delegation and state synchronization

**Current Features:**
- **Three-Mode Interaction System**: 
  - Edit/Select Mode: Click to select individual lines or ranges
  - Line Move Mode: Drag selected lines independently with conditional slider controls
  - Global Move Mode: Move entire poem with unified controls
- **Advanced Event Handling**: Modern PIXI.js v8+ federated event system with proper conflict prevention between viewport camera and drag operations
- **State Management**: Sophisticated `lineOverrides` system for per-line customization (fonts, colors, positioning, etc.)
- **Performance Optimizations**: Direct PIXI updates during drag operations, memoized calculations, and efficient re-render patterns

**Planned Features:**
- **Text Styling Completion**: Text alignment (left, center, right), font style (bold, italic), and justified text
- **Display Strategies**: Logic for different display modes (FIT, SCROLL, PAGINATE) based on poem length

## Development Commands

- **Start development server**: `pnpm dev` (or `npm run dev`)
- **Build for production**: `pnpm build` (or `npm run build`)  
- **Lint code**: `pnpm lint` (or `npm run lint`)
- **Preview production build**: `pnpm preview` (or `npm run preview`)

## Core Architecture

### Main Application Structure
- `src/App.jsx`: Root component that extends PixiJS components and renders CanvasPage
- `src/pages/CanvasPage/CanvasPage.jsx`: Main application logic with responsive layout integration
- `src/main.jsx`: React 19 entry point with StrictMode

### PixiJS Integration Patterns
- **Component Extension**: All PixiJS components must be extended via `extend()` before use
- **Naming Convention**: PixiJS components use lowercase JSX naming (e.g., `pixiText`, `pixiContainer`, `viewport`)
- **Required Extensions**: Container, Graphics, Sprite, Text, Viewport from respective libraries
- **Application Wrapper**: Uses `@pixi/react` Application component with explicit width/height props

### Responsive Layout System

#### Core Hook: `useResponsiveCanvas`
Located in `src/pages/CanvasPage/hooks/useResponsiveCanvas.js`, this hook implements:
- Fixed-width controls panel (340px base, scales proportionally)
- Fixed-width navigation (120px base, scales proportionally) 
- Dynamic canvas that fills remaining viewport space
- Collapsible panel functionality with `toggleControls()` and `toggleNav()`
- Minimum canvas dimensions (300x200px) for usability

#### Layout Component Pattern
`ResponsiveLayout.jsx` uses flexbox with three distinct areas:
- **Controls**: Fixed width, flex-shrink: 0, vertical overflow allowed
- **Canvas**: flex: 1, takes remaining space, overflow hidden
- **Navigation**: Fixed width, flex-shrink: 0, no overflow

### Typography and Text Rendering

#### Font Management
- **Font Loader**: `useFontLoader.js` handles web font loading with `document.fonts.load()`
- **Primary Font**: "Cormorant Garamond" with web font files in `public/fonts/`
- **Font Loading Pattern**: Components wait for font loading before rendering

#### Text Positioning System
- **Responsive Positioning**: `useResponsiveTextPosition.js` calculates dynamic text positioning
- **Auto-centering**: Text centered horizontally within canvas, positioned in upper portion
- **Scale Factor**: Applied on smaller screens (below 400px canvas width)
- **Line Height Management**: Sophisticated system with multiplier-based calculations

### Interactive Features

#### Camera Control Integration
- **Viewport**: Uses `pixi-viewport` for pan, zoom, and pinch interactions
- **Auto-recentering**: `useAutoRecenter.js` hook automatically centers content on layout changes
- **Ticker Integration**: Proper integration with PIXI Application ticker and event systems

#### Control Panel System
- **Typography Controls**: Font size, line height, letter spacing, text alignment
- **Color Controls**: Text color picker with hex color state management
- **Reset Functionality**: Smart reset for line height based on font size multipliers

### Custom Hooks Architecture

#### Core Responsive Hooks
- `useResponsiveCanvas()`: Main layout calculations and panel visibility
- `useResponsiveTextPosition()`: Dynamic text positioning based on canvas size
- `useWindowSize()`: Window dimension tracking with resize listeners

#### PixiJS-specific Hooks  
- `usePixiAutoRender()`: Auto-rendering system for layout changes (work in progress)
- `useAutoRecenter()`: Viewport centering logic with dependency tracking
- `useFontLoader()`: Web font loading state management

#### Utility Hooks
- `useTextStyles()`: Text style state management
- `useSelection()`: Text selection functionality
- `usePexels()`: Pexels API integration with search, loading states, and error handling
- `useDirectDrag()`: Modern PIXI v8+ drag-and-drop implementation with proper event handling

### State Management Patterns

#### Local State Strategy
- Component-level state for UI controls (font size, colors, spacing)
- URL search params for poem selection (`?poemId=123`)
- Responsive layout state managed in dedicated hook
- No global state management library used

#### State Synchronization
- Layout changes trigger canvas resize via useEffect
- Text position recalculated on canvas dimension changes
- Auto-render system ensures visual updates on state changes

### File Organization Patterns

#### Hook Organization
- Global hooks in `src/hooks/` (useFontLoader, useWindowSize)
- Page-specific hooks in `src/pages/CanvasPage/hooks/`
- Feature-specific hook grouping

#### Component Structure
- Page components in `src/pages/[PageName]/`
- Reusable components in `src/pages/[PageName]/components/`
- Utility functions in `src/pages/[PageName]/utils/`

#### Asset Management
- Fonts in `public/fonts/` with WOFF2 format
- Static assets in `public/` directory
- PIXI assets loaded via `Assets.load()` pattern

### Key Technical Decisions

#### JSX in .js Files
- Vite configured to allow JSX syntax in .js files
- ESBuild loader configuration enables this pattern
- Maintains consistency with existing codebase conventions

#### CSS Modules
- Component-specific styling with `.module.css` files
- Scoped class names prevent style conflicts
- Flexbox-first approach for layouts

#### React 19 Patterns
- Modern hook patterns with useMemo for expensive calculations
- useLayoutEffect for DOM measurement operations
- Concurrent features ready architecture

### Development Considerations

#### Performance Patterns
- Memoized expensive calculations (responsive positioning, layout)
- RequestAnimationFrame for render optimizations
- Dependency arrays carefully managed to prevent unnecessary re-renders

#### Error Boundaries
- Font loading fallbacks with loading states
- Canvas dimension validation (minimum sizes enforced)
- Graceful degradation for missing assets

#### Browser Compatibility
- Modern browser features (ResizeObserver, CSS Grid as fallback)
- Web font loading API usage
- PIXI.js hardware acceleration support

## Advanced Features Implementation

### Font Management System
- **Global Font Synchronization**: `handleSyncAllFontsToGlobal` function in `useCanvasHandlers.js:267-321` provides one-click reset of all line-level font overrides with automatic Montserrat fallback
- **Per-Line Font Overrides**: Individual lines can have custom fonts via the `lineOverrides` system while maintaining global font inheritance
- **Font Loading Integration**: Proper integration with existing `useFontManager` and `useFontLoader` systems for seamless font switching

### Background Image System
- **Pexels API Integration**: Full-featured search system using `VITE_PEXELS_API_KEY` environment variable
- **Modern Asset Loading**: Uses PIXI v8+ `Assets.load()` instead of deprecated `Texture.fromURL()` 
- **Background Rendering**: `BackgroundImage.jsx` component implements cover-style scaling with proper aspect ratio preservation
- **Error Handling**: Comprehensive error states for API failures, network issues, and texture loading problems

### Selection and Interaction System
- **Multi-Selection Patterns**: 
  - **Single Selection**: Standard click behavior
  - **Range Selection**: Shift+click for selecting consecutive lines
  - **Toggle Selection**: Ctrl/Cmd+click for non-adjacent multi-line selection
  - **Keyboard Shortcuts**: Escape key for clearing all selections
- **Visual Feedback**: Selected lines receive visual highlighting and cursor changes based on interaction mode
- **State Persistence**: Selection state maintained across mode switches and UI interactions

### Drag-and-Drop Architecture
- **Three-Mode System**: 
  - `edit`: Selection-only mode with no dragging, sliders inactive
  - `line`: Selected lines dragging with line-specific X/Y sliders
  - `poem`: Global poem movement with unified positioning controls
- **Event Delegation**: Viewport-level event handling prevents conflicts with camera controls
- **Modern PIXI Patterns**: Uses `eventMode: 'dynamic'` and proper event propagation with `event.stopPropagation()`
- **Performance Optimization**: Direct PIXI position updates during drag operations to maintain 60fps

### UI/UX Enhancements
- **Floating Photo Grid**: Modal overlay system with smooth CSS animations (fade in/out, slide transforms)
- **Conditional UI Elements**: Dynamic slider behavior based on current mode and selection state
- **Responsive Grid Layout**: Thumbnail grid with `repeat(auto-fill, minmax(80px, 1fr))` pattern
- **Loading States**: Comprehensive loading indicators for API requests and image loading operations

### Technical Patterns and Solutions

#### PIXI.js v8+ Compatibility
- **Asset Loading**: Modern `Assets.load(imageUrl)` pattern replacing deprecated texture methods
- **Event System**: New federated event system with proper `eventMode` settings
- **Conflict Prevention**: Ctrl/Cmd modifier keys prioritize viewport camera controls over drag operations

#### State Management Architecture
- **lineOverrides System**: Centralized per-line customization supporting fonts, colors, positioning offsets
- **Conditional Rendering**: Mode-based UI component visibility and functionality
- **Bidirectional Synchronization**: Drag operations sync with UI sliders in real-time

#### Performance Considerations
- **Memory Management**: Proper texture cleanup and component unmounting
- **Re-render Prevention**: Strategic use of `useCallback`, `useMemo`, and dependency arrays
- **Event Optimization**: Throttled pointer move events and efficient bounds checking

## Error Handling and Debugging

### Common Issues and Solutions
- **Circular Dependency Prevention**: Use refs for frequently changing values in event handlers
- **Texture Loading Failures**: Graceful fallbacks to `Texture.EMPTY` with error logging
- **Event Conflicts**: Proper event propagation management between viewport and drag systems
- **API Limitations**: User-friendly error messages for Pexels API rate limits and network issues

### Development Tools Integration
- **React DevTools**: Component state inspection and performance profiling
- **Browser Performance Tools**: Frame rate monitoring during drag operations
- **Console Debugging**: Structured logging for event flow and state changes