# GEMINI.md

## Project Overview

This project is a web-based creative tool for generating and manipulating text-based graphics on an HTML5 canvas. It is built with React and uses the PixiJS library for high-performance 2D rendering. The application allows users to customize the appearance of text, including font size, color, letter spacing, and line height. It also features a system for searching and setting background images from the Pexels API.

The project is structured as a single-page application (SPA) with a main canvas area and a set of controls for adjusting various properties. The state is managed within React components using hooks, and the rendering is handled by PixiJS.

### Key Technologies

*   **Frontend:** React
*   **Rendering:** PixiJS
*   **Build Tool:** Vite
*   **Testing:** Playwright
*   **Styling:** CSS Modules, inline styles

## Building and Running

### Prerequisites

*   Node.js and pnpm

### Installation

1.  Clone the repository.
2.  Install dependencies:
    ```bash
    pnpm install
    ```

### Development

To run the application in development mode with hot-reloading:

```bash
pnpm dev
```

The application will be available at `http://localhost:5173`.

### Building for Production

To build the application for production:

```bash
pnpm build
```

The optimized and minified files will be generated in the `dist` directory.

### Testing

The project uses Playwright for end-to-end testing.

To run the tests:

```bash
pnpm test
```

To run the tests with a UI:

```bash
pnpm test:ui
```

To run the tests in headed mode:

```bash
pnpm test:headed
```

## Development Conventions

*   **Component-Based Architecture:** The application is built with React components, with a clear separation of concerns between UI, state management, and rendering logic.
*   **CSS Modules:** CSS modules are used for styling to avoid class name collisions and to keep styles scoped to individual components.
*   **Custom Hooks:** Custom hooks are used extensively to encapsulate and reuse stateful logic, such as managing the canvas state, handling user input, and fetching data from external APIs.
*   **State Management:** The application's state is managed primarily through React's `useState` and `useReducer` hooks. There is no external state management library like Redux or MobX.
*   **Linting:** The project uses ESLint to enforce code quality and consistency. The configuration is in the `eslint.config.js` file.
*   **Testing:** End-to-end tests are written with Playwright and are located in the `tests` directory.
