# 💸 MoneyFlow

[![React 19](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4.3-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Zustand](https://img.shields.io/badge/State-Zustand-orange?style=for-the-badge)](https://github.com/pmndrs/zustand)
[![Supabase](https://img.shields.io/badge/Database-Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Progressive Web App](https://img.shields.io/badge/PWA-Ready-9B51E0?style=for-the-badge&logo=progressive-web-apps&logoColor=white)](https://vite-pwa-org.netlify.app/)
[![Vitest](https://img.shields.io/badge/Testing-Vitest-729B1B?style=for-the-badge&logo=vitest&logoColor=white)](https://vitest.dev/)

**MoneyFlow** is a modern, mobile-first, and highly-immersive personal finance application. Engineered to turn passive budgeting into an active, gamified habits-builder, it empowers you to aggressively track expenses, optimize daily spending limits, manage multiple purpose-driven wallets, and complete your savings goals with interactive progression.

Featuring a beautiful, premium user experience—complete with glassmorphism, rich gradients, micro-animations, and the unique, nostalgic **Frutiger Aero Theme**—MoneyFlow brings delight back to daily financial tracking.

---

## ✨ Unique Features & Highlights

### 🎮 Gamified Financial Habits
*   **XP & Leveling System:** Earn Experience Points (XP) dynamically as you log transactions and maintain healthy budgeting practices. Advance your status from *Beginner Saver* up to legendary financial ranks!
*   **Daily Streaks:** Stay motivated with active streaks that track how consistently you check and update your financial registers.

### 💼 Intelligent Multi-Wallet System
*   **Purpose-Driven Wallets:** Easily create and manage custom wallets categorized as **Daily Needs**, **Savings**, or **Tap Cards**.
*   **Dynamic Balance Transfers:** Swiftly transfer money between wallets with automatic system log auditing.
*   **Smart Budget Safeguarding:** Spending transactions performed on a *Savings* wallet are automatically converted to `System Logs`—protecting your daily spending limit from being skewed by major, one-off savings allocations.

### 🔮 Glassmorphic Glass & Frutiger Aero Theme
*   Choose between professional **Light Mode**, sleek **Dark Mode**, and the jaw-dropping **Aero Mode**.
*   **Aero Mode** brings back the beloved Windows Vista/7 *Frutiger Aero* aesthetic, complete with glassy layers (`backdrop-filter`), linear color gradients, bubble-shaped elements, and smooth reflective highlight overlays.

### 📅 Advanced Subscription & Auto-Bills Tracking
*   Set up monthly **Auto-Bills** that dynamically deduct on set days of the month.
*   Intelligent duplicate checks ensure bills are processed exactly once per month, even across restarts.

### 📊 Heavy-Duty Data Utilities & Reporting
*   **Analytics Dashboard:** Visual insights showing expense category splits using interactive pie charts powered by Recharts.
*   **Calendar Heatmap:** Spot high-intensity spending days instantly through an elegant color-coded monthly calendar interface.
*   **Multi-Format Exporting:** Seamlessly export all transaction records and wallet states to beautifully formatted **CSV**, structured Microsoft **Excel (.xlsx)** spreadsheets, or complete **PDF** tables.

---

## 🛠️ Technology Stack

MoneyFlow is built on a modern, robust, and highly responsive modern web stack:

| Technology | Purpose | Key Details |
| :--- | :--- | :--- |
| **React 19** | Core Frontend | Binds high-performance reactive components. |
| **Vite 8** | Build System & HMR | Lightning-fast developer environment and production optimization. |
| **Tailwind CSS v4** | UI Layout & Style | Utilizes the latest `@tailwindcss/vite` configuration with custom design tokens. |
| **Framer Motion 12** | Micro-Animations | Handles seamless page transitions, interactive modal overlays, and visual effects. |
| **Zustand 5** | State Management | Atomic, lightweight store featuring state synchronization and offline/cloud state hydration. |
| **Supabase Client** | Backend-as-a-Service | Secure authentication, user profile management, and database synchronization. |
| **Lucide React** | Premium Iconography | Consistent, modern vector icons. |
| **Recharts & date-fns**| Data Vis & Dates | Clean charting wrappers and high-performance date calculations. |
| **Vite PWA Plugin** | PWA Capabilities | Installs directly to home screens and enables offline-first capability using browser LocalStorage. |
| **Vitest** | Testing Suite | Extremely fast test suite runner verifying stores and UI elements. |

---

## 🚀 Getting Started

Follow these steps to configure your local environment and run MoneyFlow.

### Prerequisites
*   [Node.js](https://nodejs.org/) (v18.0.0 or higher recommended)
*   [npm](https://www.npmjs.com/) or [Yarn](https://yarnpkg.com/)

### Installation & Local Setup

1.  **Clone the Repository:**
    ```bash
    git clone https://github.com/umlittlethings/money-tracker-v2.git
    cd money-tracker-v2
    ```

2.  **Install Dependencies:**
    ```bash
    npm install
    ```

3.  **Configure Environment Variables:**
    Create a `.env` file in the root directory (you can copy `.env.example` as a baseline):
    ```bash
    cp .env.example .env
    ```
    Populate it with your own Supabase configuration:
    ```env
    VITE_SUPABASE_URL=https://your-project-id.supabase.co
    VITE_SUPABASE_ANON_KEY=your-anon-public-key
    ```

4.  **Launch the Development Server:**
    ```bash
    npm run dev
    ```
    By default, the server runs on `http://localhost:5173`. Open this URL in your web browser.

---

## 🧪 Running Tests

Ensure system consistency by running the automated unit test suite. MoneyFlow uses **Vitest** combined with `@testing-library/react` and `jsdom` to test its state transitions, wallets, and UI elements.

To run the tests once:
```bash
npm run test
```

To launch tests in interactive watch mode:
```bash
npx vitest
```

---

## 📲 Mobile PWA Installation

MoneyFlow operates as an installable **Progressive Web App (PWA)**, offering an offline-capable, app-like environment with a clean bottom navigation bar.

### Android (Google Chrome)
1. Open the application URL in Google Chrome.
2. Tap the three-dot menu icon in the top right.
3. Select **Add to Home screen** (or **Install App**).
4. Tap **Install** to add the MoneyFlow launcher icon directly to your apps.

### iOS (Apple Safari)
1. Open the application URL in Apple Safari.
2. Tap the **Share** button (box with an upward arrow) in the bottom navigation.
3. Scroll down and select **Add to Home Screen**.
4. Confirm by tapping **Add** in the top right.

---

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more information.
