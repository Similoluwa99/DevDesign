# NutriPulse — Pure Vanilla Calorie & Nutrition Tracker

A lightweight, responsive calorie and macronutrient tracker built with pure HTML, CSS, and JavaScript. Zero external frameworks, zero CSS variables, zero backend required—all data is persisted locally in your browser.

![NutriPulse](https://img.shields.io/badge/Language-HTML5%20%7C%20CSS3%20%7C%20JavaScript-emerald?style=flat-square)
![Persistence-LocalStorage](https://img.shields.io/badge/Storage-Browser%20LocalStorage-blue?style=flat-square)
![Status-Public](https://img.shields.io/badge/Status-Public-green?style=flat-square)

---

## ✨ Features

- **Daily Calorie Dashboard**:
  - Dynamic circular SVG progress gauge calculating real-time consumed vs. daily target calories.
  - Automatic status indicators (*On Track* vs. *Exceeded*) with precise calorie surplus/deficit calculations.
- **Macronutrient Tracking**:
  - Visual breakdown and progress bars for **Protein**, **Carbohydrates**, and **Fats** against daily gram targets.
- **Categorized Food Diary**:
  - Meals separated into **Breakfast**, **Lunch**, **Dinner**, and **Snacks**.
  - Subtotals of calories and macronutrients per meal category.
  - Inline controls to edit or delete any logged food entry.
- **Quick Food Logging & Presets**:
  - 1-click preset chips for common foods (Eggs, Oatmeal, Chicken Breast, Brown Rice, Greek Yogurt, Banana, Protein Shake, Almonds).
  - Custom food logging modal supporting portion sizes, calories, and optional macro grams.
- **Hydration Tracker**:
  - 8-glass interactive water intake counter (~250ml per glass) with daily persistence.
- **7-Day Trend Chart**:
  - Interactive history bar chart comparing daily intake against target goals.
  - Click any day's bar to jump directly into that date's diary.
- **Customizable Goals & TDEE Calculator**:
  - Configurable daily calorie, macro, and hydration targets.
  - Integrated **Mifflin-St Jeor BMR & TDEE Estimator** calculates suggested targets based on gender, age, weight, height, activity level, and fitness goals (weight loss, maintenance, or muscle gain).
- **Data Portability & Backup**:
  - **Export to JSON**: Download full backup of all logged days and target goals.
  - **Import from JSON**: Restore previous backups seamlessly.
  - Clear current day or factory reset options.

---

## 🚀 Getting Started

No build step or dependencies required!

1. Clone or download the repository:
   ```bash
   git clone https://github.com/<your-username>/<repo-name>.git
   cd <repo-name>
   ```
2. Open `index.html` in any modern web browser (Chrome, Edge, Firefox, Safari).

---

## 🛠️ Tech Stack & Constraints

- **HTML5**: Semantic markup, accessible modal dialogs, and SVG visualization.
- **CSS3**: Pure vanilla stylesheet—no preprocessors, no Tailwind, and **no CSS variables** (`--var`).
- **JavaScript (ES6+)**: Pure vanilla JS with no external libraries or CDNs.
- **Storage**: Browser `localStorage` for offline, client-side data persistence.

---

## 📄 License

MIT License. Free to use, modify, and distribute.
