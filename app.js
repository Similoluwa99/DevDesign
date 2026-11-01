/**
 * NutriPulse - Pure Vanilla JavaScript Calorie & Nutrition Tracker
 * Constraints: Vanilla JS only, localStorage browser persistence, no external libraries.
 */

(function () {
  'use strict';

  // =========================================================================
  // Storage Keys & Default Configuration
  // =========================================================================
  const STORAGE_KEYS = {
    GOALS: 'nutripulse_goals_v1',
    LOGS: 'nutripulse_logs_v1'
  };

  const DEFAULT_GOALS = {
    calories: 2000,
    protein: 140,
    carbs: 220,
    fat: 65,
    water: 8
  };

  // =========================================================================
  // State
  // =========================================================================
  let state = {
    selectedDate: getTodayDateString(),
    goals: loadGoals(),
    logs: loadLogs()
  };

  // Seed sample demo data on first visit so the UI is immediately engaging
  if (!localStorage.getItem(STORAGE_KEYS.LOGS)) {
    seedInitialData();
  }

  // =========================================================================
  // DOM Elements
  // =========================================================================
  const elements = {
    // Date navigation
    prevDayBtn: document.getElementById('prev-day-btn'),
    nextDayBtn: document.getElementById('next-day-btn'),
    todayQuickBtn: document.getElementById('today-quick-btn'),
    dateDisplayBtn: document.getElementById('date-display-btn'),
    datePickerInput: document.getElementById('date-picker-input'),
    currentDateLabel: document.getElementById('current-date-label'),
    diaryDateSubtext: document.getElementById('diary-date-subtext'),

    // Dashboard - Calories
    heroCaloriesVal: document.getElementById('hero-calories-val'),
    heroCaloriesPercent: document.getElementById('hero-calories-percent'),
    calorieProgressCircle: document.getElementById('calorie-progress-circle'),
    calorieStatusPill: document.getElementById('calorie-status-pill'),
    statConsumedKcal: document.getElementById('stat-consumed-kcal'),
    statTargetKcal: document.getElementById('stat-target-kcal'),
    statRemainingKcal: document.getElementById('stat-remaining-kcal'),
    statRemainingLabel: document.getElementById('stat-remaining-label'),

    // Dashboard - Macros
    proteinConsumed: document.getElementById('protein-consumed'),
    proteinTarget: document.getElementById('protein-target'),
    proteinPercent: document.getElementById('protein-percent'),
    proteinBarFill: document.getElementById('protein-bar-fill'),

    carbsConsumed: document.getElementById('carbs-consumed'),
    carbsTarget: document.getElementById('carbs-target'),
    carbsPercent: document.getElementById('carbs-percent'),
    carbsBarFill: document.getElementById('carbs-bar-fill'),

    fatConsumed: document.getElementById('fat-consumed'),
    fatTarget: document.getElementById('fat-target'),
    fatPercent: document.getElementById('fat-percent'),
    fatBarFill: document.getElementById('fat-bar-fill'),

    // Hydration
    waterCount: document.getElementById('water-count'),
    waterGoalTarget: document.getElementById('water-goal-target'),
    waterGlassesContainer: document.getElementById('water-glasses-container'),

    // Weekly Chart
    weeklyBarsContainer: document.getElementById('weekly-bars-container'),

    // Diary Summary
    totalItemsBadge: document.getElementById('total-items-badge'),
    quickAddFoodBtn: document.getElementById('quick-add-food-btn'),

    // Meal Sections
    mealLists: {
      breakfast: document.getElementById('breakfast-items-list'),
      lunch: document.getElementById('lunch-items-list'),
      dinner: document.getElementById('dinner-items-list'),
      snacks: document.getElementById('snacks-items-list')
    },
    mealKcalBadges: {
      breakfast: document.getElementById('breakfast-total-kcal'),
      lunch: document.getElementById('lunch-total-kcal'),
      dinner: document.getElementById('dinner-total-kcal'),
      snacks: document.getElementById('snacks-total-kcal')
    },
    mealMacroSummaries: {
      breakfast: document.getElementById('breakfast-macros-summary'),
      lunch: document.getElementById('lunch-macros-summary'),
      dinner: document.getElementById('dinner-macros-summary'),
      snacks: document.getElementById('snacks-macros-summary')
    },

    // Modals
    foodModal: document.getElementById('food-modal'),
    foodForm: document.getElementById('food-form'),
    foodModalTitle: document.getElementById('food-modal-title'),
    closeFoodModalBtn: document.getElementById('close-food-modal'),
    cancelFoodBtn: document.getElementById('cancel-food-btn'),

    // Food form inputs
    foodItemId: document.getElementById('food-item-id'),
    foodNameInput: document.getElementById('food-name-input'),
    foodMealSelect: document.getElementById('food-meal-select'),
    foodServingInput: document.getElementById('food-serving-input'),
    foodCaloriesInput: document.getElementById('food-calories-input'),
    foodProteinInput: document.getElementById('food-protein-input'),
    foodCarbsInput: document.getElementById('food-carbs-input'),
    foodFatInput: document.getElementById('food-fat-input'),

    // Goals Modal
    goalsModal: document.getElementById('goals-modal'),
    goalsForm: document.getElementById('goals-form'),
    openGoalsBtn: document.getElementById('open-goals-btn'),
    closeGoalsModalBtn: document.getElementById('close-goals-modal'),
    goalCaloriesInput: document.getElementById('goal-calories-input'),
    goalProteinInput: document.getElementById('goal-protein-input'),
    goalCarbsInput: document.getElementById('goal-carbs-input'),
    goalFatInput: document.getElementById('goal-fat-input'),
    goalWaterInput: document.getElementById('goal-water-input'),
    resetDefaultGoalsBtn: document.getElementById('reset-default-goals-btn'),

    // TDEE Calculator inside Goals
    calcGender: document.getElementById('calc-gender'),
    calcAge: document.getElementById('calc-age'),
    calcWeight: document.getElementById('calc-weight'),
    calcHeight: document.getElementById('calc-height'),
    calcActivity: document.getElementById('calc-activity'),
    calcGoalIntent: document.getElementById('calc-goal-intent'),
    applyCalcBtn: document.getElementById('apply-calc-btn'),

    // Backup & Data Modal
    backupModal: document.getElementById('backup-modal'),
    openBackupBtn: document.getElementById('open-backup-btn'),
    closeBackupModalBtn: document.getElementById('close-backup-modal'),
    exportJsonBtn: document.getElementById('export-json-btn'),
    importFileInput: document.getElementById('import-file-input'),
    clearDayBtn: document.getElementById('clear-day-btn'),
    resetAllDataBtn: document.getElementById('reset-all-data-btn'),

    // Toast
    toast: document.getElementById('toast'),
    toastMessage: document.getElementById('toast-message')
  };

  // Toast timeout reference
  let toastTimer = null;

  // =========================================================================
  // Initialization
  // =========================================================================
  function init() {
    setupEventListeners();
    updateDatePickerValue();
    renderAll();
  }

  // =========================================================================
  // Data Persistence Helpers
  // =========================================================================
  function loadGoals() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.GOALS);
      if (raw) {
        return Object.assign({}, DEFAULT_GOALS, JSON.parse(raw));
      }
    } catch (e) {
      console.error('Failed to parse goals from localStorage:', e);
    }
    return Object.assign({}, DEFAULT_GOALS);
  }

  function saveGoals(goals) {
    state.goals = goals;
    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
  }

  function loadLogs() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.LOGS);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch (e) {
      console.error('Failed to parse logs from localStorage:', e);
    }
    return {};
  }

  function saveLogs() {
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(state.logs));
  }

  function getDayData(dateStr) {
    if (!state.logs[dateStr]) {
      state.logs[dateStr] = {
        water: 0,
        items: []
      };
    }
    return state.logs[dateStr];
  }

  function seedInitialData() {
    const today = getTodayDateString();
    state.logs[today] = {
      water: 4,
      items: [
        {
          id: 'item_' + (Date.now() - 10000),
          name: 'Oatmeal with Blueberries & Honey',
          meal: 'breakfast',
          portion: '1 medium bowl (250g)',
          calories: 310,
          protein: 10,
          carbs: 54,
          fat: 5,
          timestamp: Date.now() - 10000
        },
        {
          id: 'item_' + (Date.now() - 8000),
          name: 'Greek Yogurt (0% fat)',
          meal: 'breakfast',
          portion: '1 cup (170g)',
          calories: 130,
          protein: 18,
          carbs: 6,
          fat: 0.5,
          timestamp: Date.now() - 8000
        },
        {
          id: 'item_' + (Date.now() - 5000),
          name: 'Grilled Chicken Quinoa Bowl',
          meal: 'lunch',
          portion: '1 bowl',
          calories: 480,
          protein: 42,
          carbs: 46,
          fat: 12,
          timestamp: Date.now() - 5000
        },
        {
          id: 'item_' + (Date.now() - 2000),
          name: 'Apple & Raw Almonds',
          meal: 'snacks',
          portion: '1 apple + 15 almonds',
          calories: 185,
          protein: 4,
          carbs: 26,
          fat: 8,
          timestamp: Date.now() - 2000
        }
      ]
    };
    saveLogs();
  }

  // =========================================================================
  // Date Helpers
  // =========================================================================
  function getTodayDateString() {
    const now = new Date();
    return formatLocalDate(now);
  }

  function formatLocalDate(dateObj) {
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    return year + '-' + month + '-' + day;
  }

  function parseLocalDate(dateStr) {
    const parts = dateStr.split('-');
    return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
  }

  function formatDisplayDate(dateStr) {
    const today = getTodayDateString();
    const dateObj = parseLocalDate(dateStr);

    // Calculate difference in days
    const todayObj = parseLocalDate(today);
    const diffTime = dateObj.getTime() - todayObj.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    const options = { month: 'short', day: 'numeric' };
    const dateFormatted = dateObj.toLocaleDateString(undefined, options);

    if (diffDays === 0) {
      return 'Today, ' + dateFormatted;
    } else if (diffDays === -1) {
      return 'Yesterday, ' + dateFormatted;
    } else if (diffDays === 1) {
      return 'Tomorrow, ' + dateFormatted;
    } else {
      const weekdayOptions = { weekday: 'short', month: 'short', day: 'numeric' };
      return dateObj.toLocaleDateString(undefined, weekdayOptions);
    }
  }

  function shiftSelectedDate(deltaDays) {
    const current = parseLocalDate(state.selectedDate);
    current.setDate(current.getDate() + deltaDays);
    state.selectedDate = formatLocalDate(current);
    updateDatePickerValue();
    renderAll();
  }

  function updateDatePickerValue() {
    elements.datePickerInput.value = state.selectedDate;
  }

  // =========================================================================
  // Rendering
  // =========================================================================
  function renderAll() {
    renderDateHeader();
    renderDashboard();
    renderMeals();
    renderWeeklyTrend();
  }

  function renderDateHeader() {
    const displayLabel = formatDisplayDate(state.selectedDate);
    elements.currentDateLabel.textContent = displayLabel;
    elements.diaryDateSubtext.textContent = displayLabel;
  }

  function renderDashboard() {
    const dayData = getDayData(state.selectedDate);
    const items = dayData.items || [];

    // Sum daily totals
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;

    items.forEach(function (item) {
      totalCalories += Number(item.calories) || 0;
      totalProtein += Number(item.protein) || 0;
      totalCarbs += Number(item.carbs) || 0;
      totalFat += Number(item.fat) || 0;
    });

    const goalKcal = state.goals.calories;
    const remainingKcal = goalKcal - totalCalories;
    const percentKcal = goalKcal > 0 ? Math.round((totalCalories / goalKcal) * 100) : 0;

    // 1. Calorie Hero Gauge
    elements.heroCaloriesVal.textContent = Math.round(totalCalories).toLocaleString();
    elements.heroCaloriesPercent.textContent = percentKcal + '% of goal';

    // SVG Circle Stroke calculation:
    // Radius = 78, Perimeter = 2 * PI * 78 ≈ 490.088
    const perimeter = 490;
    const clampedPercent = Math.min(Math.max(totalCalories / goalKcal, 0), 1);
    const strokeOffset = perimeter - (clampedPercent * perimeter);
    elements.calorieProgressCircle.style.strokeDashoffset = strokeOffset;

    // Status pill & circle color if over goal
    if (totalCalories > goalKcal) {
      elements.calorieProgressCircle.classList.add('over-budget');
      elements.calorieStatusPill.className = 'status-pill pill-over';
      elements.calorieStatusPill.textContent = 'Exceeded (+' + Math.round(totalCalories - goalKcal).toLocaleString() + ')';
      elements.statRemainingLabel.textContent = 'Over Goal';
      elements.statRemainingKcal.textContent = '+' + Math.round(totalCalories - goalKcal).toLocaleString() + ' kcal';
      elements.statRemainingKcal.style.color = '#f87171';
    } else {
      elements.calorieProgressCircle.classList.remove('over-budget');
      elements.calorieStatusPill.className = 'status-pill pill-on-track';
      elements.calorieStatusPill.textContent = 'On Track';
      elements.statRemainingLabel.textContent = 'Remaining';
      elements.statRemainingKcal.textContent = Math.round(remainingKcal).toLocaleString() + ' kcal';
      elements.statRemainingKcal.style.color = '#ffffff';
    }

    elements.statConsumedKcal.textContent = Math.round(totalCalories).toLocaleString() + ' kcal';
    elements.statTargetKcal.textContent = Math.round(goalKcal).toLocaleString() + ' kcal';

    // 2. Macronutrients
    renderMacroProgress('protein', totalProtein, state.goals.protein, elements.proteinConsumed, elements.proteinTarget, elements.proteinPercent, elements.proteinBarFill);
    renderMacroProgress('carbs', totalCarbs, state.goals.carbs, elements.carbsConsumed, elements.carbsTarget, elements.carbsPercent, elements.carbsBarFill);
    renderMacroProgress('fat', totalFat, state.goals.fat, elements.fatConsumed, elements.fatTarget, elements.fatPercent, elements.fatBarFill);

    // 3. Hydration Glasses
    renderHydration(dayData.water || 0);

    // 4. Items Badge
    elements.totalItemsBadge.textContent = items.length === 1 ? '1 item logged' : items.length + ' items logged';
  }

  function renderMacroProgress(name, consumed, target, consumedEl, targetEl, pctEl, barEl) {
    const roundedConsumed = Math.round(consumed * 10) / 10;
    const pct = target > 0 ? Math.round((consumed / target) * 100) : 0;
    const barWidth = Math.min(pct, 100);

    consumedEl.textContent = roundedConsumed + 'g';
    targetEl.textContent = target + 'g';
    pctEl.textContent = '(' + pct + '%)';
    barEl.style.width = barWidth + '%';
  }

  function renderHydration(activeGlasses) {
    const goalGlasses = state.goals.water || 8;
    elements.waterCount.textContent = activeGlasses;
    elements.waterGoalTarget.textContent = goalGlasses;

    // Render glass icons
    elements.waterGlassesContainer.innerHTML = '';
    for (let i = 0; i < goalGlasses; i++) {
      const glassBtn = document.createElement('button');
      glassBtn.type = 'button';
      glassBtn.className = 'water-glass-btn' + (i < activeGlasses ? ' active' : '');
      glassBtn.title = 'Glass ' + (i + 1) + ' of ' + goalGlasses;
      glassBtn.setAttribute('aria-label', 'Glass ' + (i + 1));
      glassBtn.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M5 3h14l-1.5 16.5a2 2 0 0 1-2 1.5H8.5a2 2 0 0 1-2-1.5L5 3zm2.2 2l1.1 12.5a.5.5 0 0 0 .5.5h6.4a.5.5 0 0 0 .5-.5L16.8 5H7.2z"/></svg>';

      glassBtn.addEventListener('click', (function (glassIndex) {
        return function () {
          toggleWaterGlass(glassIndex + 1);
        };
      })(i));

      elements.waterGlassesContainer.appendChild(glassBtn);
    }
  }

  function toggleWaterGlass(targetCount) {
    const dayData = getDayData(state.selectedDate);
    const current = dayData.water || 0;

    // If user clicked the already filled last glass, subtract 1
    if (current === targetCount) {
      dayData.water = targetCount - 1;
    } else {
      dayData.water = targetCount;
    }

    saveLogs();
    renderDashboard();
    showToast('Hydration updated: ' + dayData.water + ' glasses');
  }

  function renderMeals() {
    const dayData = getDayData(state.selectedDate);
    const items = dayData.items || [];

    const mealTypes = ['breakfast', 'lunch', 'dinner', 'snacks'];

    mealTypes.forEach(function (mealType) {
      const mealItems = items.filter(function (it) {
        return it.meal === mealType;
      });

      const listContainer = elements.mealLists[mealType];
      const badgeEl = elements.mealKcalBadges[mealType];
      const macroSummaryEl = elements.mealMacroSummaries[mealType];

      listContainer.innerHTML = '';

      let mealKcal = 0;
      let mealP = 0;
      let mealC = 0;
      let mealF = 0;

      if (mealItems.length === 0) {
        const placeholder = document.createElement('div');
        placeholder.className = 'empty-meal-placeholder';
        placeholder.textContent = 'No ' + mealType + ' logged yet. Click + to add!';
        listContainer.appendChild(placeholder);
      } else {
        mealItems.forEach(function (item) {
          mealKcal += Number(item.calories) || 0;
          mealP += Number(item.protein) || 0;
          mealC += Number(item.carbs) || 0;
          mealF += Number(item.fat) || 0;

          const row = createFoodItemRow(item);
          listContainer.appendChild(row);
        });
      }

      badgeEl.textContent = Math.round(mealKcal) + ' kcal';
      macroSummaryEl.textContent = 'P: ' + Math.round(mealP) + 'g • C: ' + Math.round(mealC) + 'g • F: ' + Math.round(mealF) + 'g';
    });
  }

  function createFoodItemRow(item) {
    const row = document.createElement('div');
    row.className = 'food-row-item';

    const p = Number(item.protein) || 0;
    const c = Number(item.carbs) || 0;
    const f = Number(item.fat) || 0;

    const details = document.createElement('div');
    details.className = 'food-details';

    const titleRow = document.createElement('div');
    titleRow.className = 'food-title-row';

    const nameSpan = document.createElement('span');
    nameSpan.className = 'food-name';
    nameSpan.textContent = item.name;
    titleRow.appendChild(nameSpan);

    if (item.portion) {
      const servingSpan = document.createElement('span');
      servingSpan.className = 'food-serving';
      servingSpan.textContent = '(' + item.portion + ')';
      titleRow.appendChild(servingSpan);
    }
    details.appendChild(titleRow);

    const macroPills = document.createElement('div');
    macroPills.className = 'food-macro-pills';
    macroPills.innerHTML =
      '<span class="pill-p">P: ' + p + 'g</span> • ' +
      '<span class="pill-c">C: ' + c + 'g</span> • ' +
      '<span class="pill-f">F: ' + f + 'g</span>';
    details.appendChild(macroPills);

    row.appendChild(details);

    const actionsRight = document.createElement('div');
    actionsRight.className = 'food-actions-right';

    const kcalSpan = document.createElement('span');
    kcalSpan.className = 'food-kcal';
    kcalSpan.textContent = Math.round(item.calories) + ' kcal';
    actionsRight.appendChild(kcalSpan);

    // Edit button
    const editBtn = document.createElement('button');
    editBtn.className = 'action-icon-btn';
    editBtn.title = 'Edit item';
    editBtn.setAttribute('aria-label', 'Edit ' + item.name);
    editBtn.innerHTML = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>';
    editBtn.addEventListener('click', function () {
      openEditFoodModal(item);
    });
    actionsRight.appendChild(editBtn);

    // Delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'action-icon-btn delete-btn';
    deleteBtn.title = 'Delete item';
    deleteBtn.setAttribute('aria-label', 'Delete ' + item.name);
    deleteBtn.innerHTML = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>';
    deleteBtn.addEventListener('click', function () {
      deleteFoodItem(item.id, item.name);
    });
    actionsRight.appendChild(deleteBtn);

    row.appendChild(actionsRight);
    return row;
  }

  function renderWeeklyTrend() {
    elements.weeklyBarsContainer.innerHTML = '';
    const currentBase = parseLocalDate(state.selectedDate);
    const dayCols = [];

    // Build array of past 7 days ending at currentBase
    for (let i = 6; i >= 0; i--) {
      const d = new Date(currentBase);
      d.setDate(d.getDate() - i);
      dayCols.push(formatLocalDate(d));
    }

    // Determine max scale
    let maxKcalFound = state.goals.calories;
    dayCols.forEach(function (dStr) {
      const dData = state.logs[dStr];
      if (dData && dData.items) {
        let sum = 0;
        dData.items.forEach(function (it) { sum += Number(it.calories) || 0; });
        if (sum > maxKcalFound) maxKcalFound = sum;
      }
    });

    const ceiling = Math.max(maxKcalFound * 1.1, 1000);

    dayCols.forEach(function (dStr) {
      const dData = state.logs[dStr];
      let dayKcal = 0;
      if (dData && dData.items) {
        dData.items.forEach(function (it) { dayKcal += Number(it.calories) || 0; });
      }

      const isSelected = dStr === state.selectedDate;
      const dObj = parseLocalDate(dStr);
      const dayName = dObj.toLocaleDateString(undefined, { weekday: 'short' });

      const col = document.createElement('div');
      col.className = 'trend-col' + (isSelected ? ' is-selected' : '');
      col.title = dStr + ': ' + Math.round(dayKcal) + ' kcal';

      const barHeightPct = Math.min(Math.round((dayKcal / ceiling) * 100), 100);

      const track = document.createElement('div');
      track.className = 'trend-bar-track';

      const fill = document.createElement('div');
      fill.className = 'trend-bar-fill' + (dayKcal > state.goals.calories ? ' over-target' : '');
      fill.style.height = barHeightPct + '%';
      track.appendChild(fill);
      col.appendChild(track);

      const dayLabel = document.createElement('span');
      dayLabel.className = 'trend-day-label';
      dayLabel.textContent = dayName;
      col.appendChild(dayLabel);

      const valLabel = document.createElement('span');
      valLabel.className = 'trend-kcal-val';
      valLabel.textContent = dayKcal > 0 ? Math.round(dayKcal) : '-';
      col.appendChild(valLabel);

      col.addEventListener('click', function () {
        state.selectedDate = dStr;
        updateDatePickerValue();
        renderAll();
      });

      elements.weeklyBarsContainer.appendChild(col);
    });
  }

  // =========================================================================
  // Food Items Operations
  // =========================================================================
  function openAddFoodModal(presetMeal) {
    elements.foodForm.reset();
    elements.foodItemId.value = '';
    elements.foodModalTitle.textContent = 'Log Food Entry';

    if (presetMeal) {
      elements.foodMealSelect.value = presetMeal;
    }

    elements.foodModal.classList.remove('hidden');
    elements.foodNameInput.focus();
  }

  function openEditFoodModal(item) {
    elements.foodItemId.value = item.id;
    elements.foodModalTitle.textContent = 'Edit Food Entry';
    elements.foodNameInput.value = item.name || '';
    elements.foodMealSelect.value = item.meal || 'breakfast';
    elements.foodServingInput.value = item.portion || '';
    elements.foodCaloriesInput.value = item.calories || '';
    elements.foodProteinInput.value = item.protein !== undefined ? item.protein : '';
    elements.foodCarbsInput.value = item.carbs !== undefined ? item.carbs : '';
    elements.foodFatInput.value = item.fat !== undefined ? item.fat : '';

    elements.foodModal.classList.remove('hidden');
    elements.foodCaloriesInput.focus();
  }

  function closeFoodModal() {
    elements.foodModal.classList.add('hidden');
  }

  function handleFoodFormSubmit(e) {
    e.preventDefault();

    const name = elements.foodNameInput.value.trim();
    const meal = elements.foodMealSelect.value;
    const portion = elements.foodServingInput.value.trim();
    const calories = parseFloat(elements.foodCaloriesInput.value);
    const protein = parseFloat(elements.foodProteinInput.value) || 0;
    const carbs = parseFloat(elements.foodCarbsInput.value) || 0;
    const fat = parseFloat(elements.foodFatInput.value) || 0;

    if (!name || isNaN(calories) || calories < 0) {
      showToast('Please enter a valid food name and calories.');
      return;
    }

    const dayData = getDayData(state.selectedDate);
    const editingId = elements.foodItemId.value;

    if (editingId) {
      // Edit existing
      const existingItem = dayData.items.find(function (it) { return it.id === editingId; });
      if (existingItem) {
        existingItem.name = name;
        existingItem.meal = meal;
        existingItem.portion = portion;
        existingItem.calories = calories;
        existingItem.protein = protein;
        existingItem.carbs = carbs;
        existingItem.fat = fat;
      }
      showToast('Updated ' + name);
    } else {
      // Add new
      const newItem = {
        id: 'food_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
        name: name,
        meal: meal,
        portion: portion,
        calories: calories,
        protein: protein,
        carbs: carbs,
        fat: fat,
        timestamp: Date.now()
      };
      dayData.items.push(newItem);
      showToast('Logged ' + name + ' (' + calories + ' kcal)');
    }

    saveLogs();
    closeFoodModal();
    renderAll();
  }

  function deleteFoodItem(itemId, itemName) {
    const dayData = getDayData(state.selectedDate);
    dayData.items = dayData.items.filter(function (it) {
      return it.id !== itemId;
    });

    saveLogs();
    renderAll();
    showToast('Deleted ' + itemName);
  }

  // =========================================================================
  // Goals & TDEE Operations
  // =========================================================================
  function openGoalsModal() {
    elements.goalCaloriesInput.value = state.goals.calories;
    elements.goalProteinInput.value = state.goals.protein;
    elements.goalCarbsInput.value = state.goals.carbs;
    elements.goalFatInput.value = state.goals.fat;
    elements.goalWaterInput.value = state.goals.water;

    elements.goalsModal.classList.remove('hidden');
  }

  function closeGoalsModal() {
    elements.goalsModal.classList.add('hidden');
  }

  function handleGoalsFormSubmit(e) {
    e.preventDefault();

    const cal = parseInt(elements.goalCaloriesInput.value, 10);
    const pro = parseInt(elements.goalProteinInput.value, 10);
    const crb = parseInt(elements.goalCarbsInput.value, 10);
    const ft = parseInt(elements.goalFatInput.value, 10);
    const wtr = parseInt(elements.goalWaterInput.value, 10);

    if (isNaN(cal) || cal <= 0) {
      showToast('Please enter a valid calorie target.');
      return;
    }

    const newGoals = {
      calories: cal,
      protein: pro || 140,
      carbs: crb || 220,
      fat: ft || 65,
      water: wtr || 8
    };

    saveGoals(newGoals);
    closeGoalsModal();
    renderAll();
    showToast('Daily goals updated!');
  }

  function handleTDEECalculate() {
    const gender = elements.calcGender.value;
    const age = parseInt(elements.calcAge.value, 10) || 28;
    const weight = parseFloat(elements.calcWeight.value) || 70;
    const height = parseFloat(elements.calcHeight.value) || 175;
    const activity = parseFloat(elements.calcActivity.value) || 1.375;
    const goalIntent = parseInt(elements.calcGoalIntent.value, 10) || 0;

    // Mifflin-St Jeor Formula
    let bmr = (10 * weight) + (6.25 * height) - (5 * age);
    if (gender === 'male') {
      bmr += 5;
    } else {
      bmr -= 161;
    }

    const tdee = Math.round((bmr * activity) + goalIntent);
    const finalCalories = Math.max(tdee, 1200);

    // Standard macronutrient distribution:
    // Protein: 2.0g per kg of bodyweight (4 kcal/g)
    const proteinGrams = Math.round(weight * 2.0);
    // Fat: 25% of calories / 9 kcal/g
    const fatGrams = Math.round((finalCalories * 0.25) / 9);
    // Remaining calories to carbs / 4 kcal/g
    const carbCalories = Math.max(finalCalories - (proteinGrams * 4) - (fatGrams * 9), 400);
    const carbGrams = Math.round(carbCalories / 4);

    elements.goalCaloriesInput.value = finalCalories;
    elements.goalProteinInput.value = proteinGrams;
    elements.goalCarbsInput.value = carbGrams;
    elements.goalFatInput.value = fatGrams;

    showToast('Calculated target: ' + finalCalories + ' kcal');
  }

  // =========================================================================
  // Data Backup / Restore / Reset
  // =========================================================================
  function openBackupModal() {
    elements.backupModal.classList.remove('hidden');
  }

  function closeBackupModal() {
    elements.backupModal.classList.add('hidden');
  }

  function exportBackupJSON() {
    const exportData = {
      version: 1,
      exportedAt: new Date().toISOString(),
      goals: state.goals,
      logs: state.logs
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', 'nutripulse_backup_' + state.selectedDate + '.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    showToast('Backup JSON downloaded successfully');
  }

  function handleImportJSON(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (event) {
      try {
        const parsed = JSON.parse(event.target.result);
        if (parsed.goals && parsed.logs) {
          state.goals = parsed.goals;
          state.logs = parsed.logs;
          saveGoals(state.goals);
          saveLogs();
          closeBackupModal();
          renderAll();
          showToast('Data imported successfully!');
        } else {
          showToast('Invalid backup file format.');
        }
      } catch (err) {
        showToast('Error parsing JSON backup file.');
      }
    };
    reader.readAsText(file);
    // Reset file input value so re-importing the same file triggers change
    e.target.value = '';
  }

  function clearSelectedDay() {
    if (confirm('Are you sure you want to clear all logged food items for ' + state.selectedDate + '?')) {
      state.logs[state.selectedDate] = {
        water: 0,
        items: []
      };
      saveLogs();
      closeBackupModal();
      renderAll();
      showToast('Cleared log for ' + state.selectedDate);
    }
  }

  function resetAllData() {
    if (confirm('DANGER: This will delete ALL logged history, dates, and custom targets from your browser. Are you completely sure?')) {
      localStorage.removeItem(STORAGE_KEYS.GOALS);
      localStorage.removeItem(STORAGE_KEYS.LOGS);
      state.goals = Object.assign({}, DEFAULT_GOALS);
      state.logs = {};
      seedInitialData();
      closeBackupModal();
      renderAll();
      showToast('All data has been reset to defaults.');
    }
  }

  // =========================================================================
  // Toast Notifications
  // =========================================================================
  function showToast(message) {
    if (toastTimer) {
      clearTimeout(toastTimer);
    }
    elements.toastMessage.textContent = message;
    elements.toast.classList.remove('hidden');

    toastTimer = setTimeout(function () {
      elements.toast.classList.add('hidden');
    }, 2800);
  }

  // =========================================================================
  // Event Listeners Setup
  // =========================================================================
  function setupEventListeners() {
    // Date navigation
    elements.prevDayBtn.addEventListener('click', function () { shiftSelectedDate(-1); });
    elements.nextDayBtn.addEventListener('click', function () { shiftSelectedDate(1); });
    elements.todayQuickBtn.addEventListener('click', function () {
      state.selectedDate = getTodayDateString();
      updateDatePickerValue();
      renderAll();
    });

    elements.dateDisplayBtn.addEventListener('click', function () {
      elements.datePickerInput.showPicker ? elements.datePickerInput.showPicker() : elements.datePickerInput.focus();
    });

    elements.datePickerInput.addEventListener('change', function (e) {
      if (e.target.value) {
        state.selectedDate = e.target.value;
        renderAll();
      }
    });

    // Food Modal controls
    elements.quickAddFoodBtn.addEventListener('click', function () {
      openAddFoodModal('breakfast');
    });

    // Add buttons inside individual meal cards
    const mealAddBtns = document.querySelectorAll('.add-meal-item-btn');
    mealAddBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        const mealType = btn.getAttribute('data-meal-type') || 'breakfast';
        openAddFoodModal(mealType);
      });
    });

    elements.closeFoodModalBtn.addEventListener('click', closeFoodModal);
    elements.cancelFoodBtn.addEventListener('click', closeFoodModal);
    elements.foodForm.addEventListener('submit', handleFoodFormSubmit);

    // Preset chips autofill
    const presetChips = document.querySelectorAll('.preset-chip');
    presetChips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        elements.foodNameInput.value = chip.getAttribute('data-name');
        elements.foodCaloriesInput.value = chip.getAttribute('data-kcal');
        elements.foodProteinInput.value = chip.getAttribute('data-p');
        elements.foodCarbsInput.value = chip.getAttribute('data-c');
        elements.foodFatInput.value = chip.getAttribute('data-f');
        elements.foodServingInput.value = chip.getAttribute('data-serving');
      });
    });

    // Goals Modal controls
    elements.openGoalsBtn.addEventListener('click', openGoalsModal);
    elements.closeGoalsModalBtn.addEventListener('click', closeGoalsModal);
    elements.goalsForm.addEventListener('submit', handleGoalsFormSubmit);
    elements.applyCalcBtn.addEventListener('click', handleTDEECalculate);
    elements.resetDefaultGoalsBtn.addEventListener('click', function () {
      elements.goalCaloriesInput.value = DEFAULT_GOALS.calories;
      elements.goalProteinInput.value = DEFAULT_GOALS.protein;
      elements.goalCarbsInput.value = DEFAULT_GOALS.carbs;
      elements.goalFatInput.value = DEFAULT_GOALS.fat;
      elements.goalWaterInput.value = DEFAULT_GOALS.water;
    });

    // Backup & Data Modal controls
    elements.openBackupBtn.addEventListener('click', openBackupModal);
    elements.closeBackupModalBtn.addEventListener('click', closeBackupModal);
    elements.exportJsonBtn.addEventListener('click', exportBackupJSON);
    elements.importFileInput.addEventListener('change', handleImportJSON);
    elements.clearDayBtn.addEventListener('click', clearSelectedDay);
    elements.resetAllDataBtn.addEventListener('click', resetAllData);

    // Modal background click to close
    [elements.foodModal, elements.goalsModal, elements.backupModal].forEach(function (modal) {
      modal.addEventListener('click', function (e) {
        if (e.target === modal) {
          modal.classList.add('hidden');
        }
      });
    });

    // Global keyboard shortcuts (Escape to close any modal)
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        closeFoodModal();
        closeGoalsModal();
        closeBackupModal();
      }
    });
  }

  // Bootstrap
  document.addEventListener('DOMContentLoaded', init);
})();

