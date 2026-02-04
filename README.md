# Side FIRE Simulator (Client-side) / 人生見えるくん

This is a React-based client-side Life Plan / Side FIRE Simulator.
人生の資金計画（ライフプラン）をシミュレーションするReactアプリケーションです。

## Features (主な機能)

- **Client-side Logic:** All calculations run in the browser using TypeScript. (すべての計算はブラウザ上で実行されます)
- **Detailed Input Settings:**
    - **Inflation Rate (想定インフレ率):** Applies to Living Cost and Education Cost. **Housing Cost is excluded** (fixed nominal contract assumption).
    - **Income Growth Rate (想定昇給率):** Applies to Main Job Monthly Income. **Bonuses are excluded** (fixed nominal assumption).
    - **Real Value Display (実質価値表示):** Results are displayed in Present Value (Real Terms), adjusting for inflation to show true purchasing power.
- **Dynamic Housing Plans:** Configure multiple future housing phases (e.g., Rent -> Mortgage -> Paid off).
- **Interactive Charts:** Visualize asset progression, income/expense breakdown.
- **Life Events:** Register one-time special income or expenses at specific ages.
- **Target Setting:** Freely set your target asset amount.

## Prerequisites

- Node.js (v18 or later recommended)
- npm

## Setup & Run

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

## Build

To build for production:

```bash
npm run build
```

The output will be in the `dist` directory.

## Tests

Run unit tests (Vitest):

```bash
npm test
```

## Architecture & Tech Stack

This project is a modern React application built with:

- **Framework:** React 19
- **Build Tool:** Vite
- **Styling:** Tailwind CSS v4 (configured via `src/index.css` with `@theme`)
- **Charts:** Recharts
- **Icons:** Lucide React
- **Testing:** Vitest

### Directory Structure

- `src/`
  - `components/` - React components
    - `sidebar/` - Sub-components for the input sidebar (refactored for modularity)
    - `Results.tsx` - Chart and table visualization
    - `WelcomeModal.tsx` - First-time user introduction
  - `logic/` - Core simulation logic (`simulation.ts`) and types
  - `App.tsx` - Main application entry point
  - `index.css` - Global styles and theme variables

## Deployment

The application is deployed to GitHub Pages via GitHub Actions.

- **Staging:** Pushes to `main` trigger a staging build deployed to the repository root (or `/LifePath/`).
- **Production:** Tags push (release) triggers a production build deployed to the `/lifeplan/` subdirectory of the `horoama.github.io` repository.
