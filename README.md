# Side FIRE Simulator (Client-side) / 人生見えるくん

人生の資金計画（ライフプラン）をシミュレーションし、将来の資産推移を「見える化」するReactアプリケーションです。
現在の収入、支出、資産状況を入力するだけで、数十年先の資産残高をリアルタイムに予測します。

## Features (主な機能)

- **リアルタイム・シミュレーション:** 入力値を変更すると即座にグラフが更新されます。全ての計算はブラウザ上で完結します。
- **詳細な設定項目:**
    - **インフレ率考慮:** 生活費や教育費の実質的な上昇を加味。
    - **昇給・退職金:** キャリアプランに合わせた収入推移を設定可能。
    - **住居プラン:** 賃貸、持ち家、ローンなど、期間ごとの住居費を設定可能。
    - **教育費:** 子供の誕生時期と進学コース（公立/私立）ごとの教育費を自動計算。
    - **ライフイベント:** 車の購入や旅行、相続など、一時的な収支イベントを追加可能。
- **視覚的な結果表示:**
    - 総資産の推移（名目・実質）をエリアチャートで表示。
    - 収入・支出の内訳を積み上げ棒グラフで詳細に分析。
    - 年次データを表形式で確認、CSVエクスポート可能。
- **プライバシー重視:** 入力データはブラウザ（ローカルストレージなど）にのみ保存され、外部サーバーには送信されません。

## Tech Stack (技術スタック)

- **Frontend:** React 19, TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS v4
- **Charts:** Recharts
- **Icons:** Lucide React
- **Testing:** Vitest

## Project Structure (ディレクトリ構成)

```
src/
├── assets/          # Static assets
├── components/      # React components
│   ├── sidebar/     # Sidebar sub-components (Input sections)
│   ├── Results.tsx  # Simulation results visualization
│   ├── Sidebar.tsx  # Main input sidebar
│   ├── Tooltip.tsx  # Custom tooltip component
│   └── WelcomeModal.tsx # First-visit welcome modal
├── logic/           # Core simulation logic (Pure functions)
│   ├── simulation.ts      # Main calculation logic
│   └── simulation.test.ts # Unit tests
├── App.tsx          # Main application layout
├── index.css        # Global styles & Tailwind theme configuration
└── main.tsx         # Entry point
```

## Setup & Development (開発ガイド)

### Prerequisites
- Node.js (v20 or later recommended)
- npm

### Installation

```bash
npm install
```

### Development Server

Start the development server with hot reload:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

### Build for Production

Build the application for production deployment:

```bash
npm run build
```

The output will be generated in the `dist` directory.

### Run Tests

Execute unit tests using Vitest:

```bash
npm test
```

## Architecture Notes

- **Separation of Concerns:** Simulation logic is strictly separated in `src/logic/simulation.ts` and contains no UI-related code. This ensures high testability.
- **Client-Side Only:** The application operates entirely on the client side without a backend API for simulation.
- **Theme:** Design tokens (colors, fonts) are defined in `src/index.css` using Tailwind CSS v4 variables (`--color-brand-*`).

## License

MIT
