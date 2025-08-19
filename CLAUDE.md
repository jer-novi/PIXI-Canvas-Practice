# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React + Vite application using PixiJS for 2D graphics rendering. The project uses `@pixi/react` to integrate PixiJS components with React's declarative approach.

## Development Commands

- **Start development server**: `pnpm dev` (or `npm run dev`)
- **Build for production**: `pnpm build` (or `npm run build`)  
- **Lint code**: `pnpm lint` (or `npm run lint`)
- **Preview production build**: `pnpm preview` (or `npm run preview`)

## Architecture Notes

### PixiJS Integration
- Uses `@pixi/react` for declarative PixiJS components in React
- Components must be extended using `extend()` from `@pixi/react` before use
- PixiJS components use lowercase naming (e.g., `pixiSprite`, `pixiContainer`)
- Asset loading is handled via `Assets.load()` from PixiJS

### File Structure
- `src/App.jsx`: Main application component containing the PixiJS Application wrapper
- `src/TextDemo.js`: Example PixiJS sprite component demonstrating interaction and asset loading
- `src/main.jsx`: Standard React entry point
- `public/`: Static assets served directly

### Key Patterns
- PixiJS components require explicit extension via `extend()` calls
- Asset loading uses async `Assets.load()` with React state management
- Interactive PixiJS elements use `eventMode="static"` for pointer events
- JSX files can have `.js` extension due to Vite configuration allowing JSX in `.js` files

### Development Notes
- ESLint configured with React hooks and refresh plugins
- Vite configured to treat `.js` files as JSX
- Uses React 19 with modern patterns (StrictMode, createRoot)