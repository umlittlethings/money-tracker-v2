# MoneyFlow

**MoneyFlow** is a modern, mobile-first personal finance and budgeting web application. Designed with a sleek dark-mode UI, it helps users aggressively track expenses, manage daily budgets, and achieve savings goals through an engaging, gamified experience.

## 🌟 Key Features

*   **Smart Dashboard:** Get a real-time overview of your remaining monthly balance and strict daily spending limits.
*   **Payday Cycle System:** Automatically resets your budget every month based on your customizable payday (e.g., the 25th).
*   **Balance Adjustment:** Easily sync the app's remaining balance with your real-world wallet using the quick adjust tool.
*   **Calendar Heatmap:** Visually track your spending intensity across the month with a dynamic color-coded calendar.
*   **Savings Goals:** Track multiple savings goals (e.g., "Emergency Fund", "New PC") with visual progress bars.
*   **Analytics:** Understand your spending habits with categorized pie charts.
*   **Offline Support (PWA):** Install the app directly to your mobile home screen. It uses local storage to keep your data safe and fast.

## 🛠️ Technology Stack

*   **Frontend Framework:** React 18 with Vite
*   **Styling:** Tailwind CSS v4 (Custom dark mode, glassmorphism)
*   **State Management:** Zustand (with localStorage persistence)
*   **Icons:** Lucide React
*   **Charts:** Recharts
*   **Date Handling:** date-fns
*   **PWA:** vite-plugin-pwa

## 🚀 Getting Started

Follow these steps to run MoneyFlow on your local machine.

### Prerequisites

*   Node.js (v18 or newer recommended)
*   npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/umlittlethings/money-tracker-v2.git
   cd money-track
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:3000` (or the port specified in your terminal).

## 📱 Mobile Installation

MoneyFlow is built as a Progressive Web App (PWA). You can install it on your smartphone:
1. Open the app URL in Chrome (Android) or Safari (iOS).
2. Tap "Add to Home Screen" in the browser menu.
3. The app will behave like a native application with a bottom navigation bar.

## 📄 License

This project is licensed under the MIT License.
