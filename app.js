const STORAGE_KEY = "habit-grid-data-v1";

const state = {
  habits: [],
  currentWeekStart: getMonday(new Date())
};

const defaultHabits = [
  { id: crypto.randomUUID(), name: "Study", completed: {} },
  { id: crypto.randomUUID(), name: "Workout", completed: {} },
  { id: crypto.randomUUID(), name: "Read", completed: {} },
  { id: crypto.randomUUID(), name: "Sleep on time", completed: {} }
];

/* =========================
   STORAGE
========================= */

function loadData() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved) {
      const data = JSON.parse(saved);

      if (Array.isArray(data.habits)) {
        state.habits = data.habits;

        state.habits.forEach(habit => {
          if (!habit.completed) {
            habit.completed = {};
          }
        });

        return;
      }
    }
  } catch (error) {
    console.error("Could not load saved data:", error);
  }

  state.habits = defaultHabits;
  saveData();
}

function saveData() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      habits: state.habits
    })
  );
}

/* =========================
   DATE HELPERS
========================= */

function dateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getMonday(date) {
  const d = new Date(date);

  d.setHours(0, 0, 0, 0);

  const day = d.getDay();
  const difference = day === 0 ? -6 : 1 - day;

  d.setDate(d.getDate() + difference);

  return d;
}

function addDays(date, amount) {
  const result = new Date(date);

  result.setDate(result.getDate() + amount);

  return result;
}

function formatDate(date) {
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric"
  });
}

/* =========================
   WEEK
========================= */

function renderWeek() {
  const headers = document.getElementById("dateHeaders");
  const weekLabel = document.getElementById("weekLabel");

  if (!headers || !weekLabel) return;

  headers.innerHTML = "";

  const dates = [];

  for (let i = 0; i < 7; i++) {
    dates.push(
      addDays(state.currentWeekStart, i)
    );
  }

  weekLabel.textContent =
    `${formatDate(dates[0])} – ${formatDate(dates[6])}`;

  dates.forEach(date => {
    const header = document.createElement("div");

    header.className = "date-header";

    if (dateKey(date) === dateKey(new Date())) {
      header.classList.add("today");
    }

    const day = document.createElement("span");

    day.className = "day";

    day.textContent =
      date.toLocaleDateString(undefined, {
        weekday: "short"
      }).slice(0, 2);

    const number = document.createElement("span");

    number.className = "number";

    number.textContent = date.getDate();

    header.appendChild(day);
    header.appendChild(number);

    headers.appendChild(header);
  });
}

/* =========================
   HABITS
========================= */

function renderHabits() {
  const container =
    document.getElementById("habitRows");

  if (!container) return;

  container.innerHTML = "";

  if (state.habits.length === 0) {
    const empty = document.createElement("div");

    empty.className = "empty-state";

    empty.textContent =
      "No habits yet. Add your first habit.";

    container.appendChild(empty);

    return;
  }

  state.habits.forEach(habit => {
    const row = document.createElement("div");

    row.className = "habit-row";

    const nameCell =
      document.createElement("div");

    nameCell.className = "habit-name";

    const name =
      document.createElement("span");

    name.className = "habit-name-text";

    name.textContent = habit.name;

    const deleteButton =
      document.createElement("button");

    deleteButton.className =
      "habit-delete";

    deleteButton.textContent = "×";

    deleteButton.title =
      "Delete habit";

    deleteButton.addEventListener(
      "click",
      () => deleteHabit(habit.id)
    );

    nameCell.appendChild(name);
    nameCell.appendChild(deleteButton);

    row.appendChild(nameCell);

    for (let i = 0; i < 7; i++) {
      const date =
        addDays(
          state.currentWeekStart,
          i
        );

      const key = dateKey(date);

      const cell =
        document.createElement("div");

      cell.className = "day-cell";

      const check =
        document.createElement("button");

      check.className = "check";

      if (habit.completed[key]) {
        check.classList.add("done");
      }

      check.setAttribute(
        "aria-label",
        `${habit.name} ${key}`
      );

      check.addEventListener(
        "click",
        () => {
          toggleHabit(
            habit.id,
            key
          );
        }
      );

      cell.appendChild(check);
      row.appendChild(cell);
    }

    container.appendChild(row);
  });
}

/* =========================
   HABIT ACTIONS
========================= */

function toggleHabit(habitId, key) {
  const habit =
    state.habits.find(
      item => item.id === habitId
    );

  if (!habit) return;

  habit.completed[key] =
    !habit.completed[key];

  saveData();

  renderAll();
}

function deleteHabit(habitId) {
  const habit =
    state.habits.find(
      item => item.id === habitId
    );

  if (!habit) return;

  const confirmed =
    confirm(
      `Delete "${habit.name}"?`
    );

  if (!confirmed) return;

  state.habits =
    state.habits.filter(
      item => item.id !== habitId
    );

  saveData();

  renderAll();
}

function addHabit() {
  const input =
    document.getElementById("habitName");

  if (!input) return;

  const name =
    input.value.trim();

  if (!name) {
    input.focus();
    return;
  }

  state.habits.push({
    id: crypto.randomUUID(),
    name,
    completed: {}
  });

  saveData();

  input.value = "";

  closeModal();

  renderAll();
}

/* =========================
   MODAL
========================= */

function openModal() {
  const modal =
    document.getElementById("habitModal");

  if (!modal) return;

  modal.classList.remove("hidden");

  setTimeout(() => {
    const input =
      document.getElementById("habitName");

    if (input) {
      input.focus();
    }
  }, 100);
}

function closeModal() {
  const modal =
    document.getElementById("habitModal");

  if (!modal) return;

  modal.classList.add("hidden");
}

/* =========================
   WEEK NAVIGATION
========================= */

function goToToday() {
  state.currentWeekStart =
    getMonday(new Date());

  renderAll();
}

function changeWeek(amount) {
  state.currentWeekStart =
    addDays(
      state.currentWeekStart,
      amount * 7
    );

  renderAll();
}

/* =========================
   STATISTICS CALCULATIONS
========================= */

function calculateTodayStats() {
  const today =
    dateKey(new Date());

  let completed = 0;

  state.habits.forEach(habit => {
    if (
      habit.completed &&
      habit.completed[today]
    ) {
      completed++;
    }
  });

  const total =
    state.habits.length;

  const percentage =
    total === 0
      ? 0
      : Math.round(
          (completed / total) * 100
        );

  return {
    completed,
    total,
    percentage
  };
}

function calculateTotalCompletions() {
  let total = 0;

  state.habits.forEach(habit => {
    if (!habit.completed) return;

    Object.values(
      habit.completed
    ).forEach(value => {
      if (value) total++;
    });
  });

  return total;
}

function getHabitDates(habit) {
  if (!habit.completed) return [];

  return Object.keys(habit.completed)
    .filter(key => habit.completed[key])
    .sort();
}

function calculateHabitBestStreak(habit) {
  const dates =
    getHabitDates(habit);

  if (dates.length === 0) {
    return 0;
  }

  let best = 1;
  let current = 1;

  for (let i = 1; i < dates.length; i++) {
    const previous =
      new Date(
        `${dates[i - 1]}T00:00:00`
      );

    const currentDate =
      new Date(
        `${dates[i]}T00:00:00`
      );

    const difference =
      Math.round(
        (currentDate - previous) /
        (1000 * 60 * 60 * 24)
      );

    if (difference === 1) {
      current++;
    } else {
      current = 1;
    }

    best =
      Math.max(best, current);
  }

  return best;
}

function calculateHabitCurrentStreak(habit) {
  const dates =
    getHabitDates(habit);

  if (dates.length === 0) {
    return 0;
  }

  const completedSet =
    new Set(dates);

  let streak = 0;

  let current =
    new Date();

  current.setHours(
    0,
    0,
    0,
    0
  );

  while (
    completedSet.has(
      dateKey(current)
    )
  ) {
    streak++;

    current =
      addDays(current, -1);
  }

  return streak;
}

function calculateBestStreak() {
  let best = 0;

  state.habits.forEach(habit => {
    best =
      Math.max(
        best,
        calculateHabitBestStreak(habit)
      );
  });

  return best;
}

function calculateCurrentStreak() {
  if (state.habits.length === 0) {
    return 0;
  }

  let best = 0;

  state.habits.forEach(habit => {
    best =
      Math.max(
        best,
        calculateHabitCurrentStreak(habit)
      );
  });

  return best;
}

/* =========================
   WEEKLY STATISTICS
========================= */

function calculateWeekDayStats() {
  const results = [];

  for (let i = 0; i < 7; i++) {
    const date =
      addDays(
        state.currentWeekStart,
        i
      );

    const key =
      dateKey(date);

    let completed = 0;

    state.habits.forEach(habit => {
      if (
        habit.completed &&
        habit.completed[key]
      ) {
        completed++;
      }
    });

    const total =
      state.habits.length;

    const percentage =
      total === 0
        ? 0
        : Math.round(
            (completed / total) * 100
          );

    results.push({
      date,
      completed,
      total,
      percentage
    });
  }

  return results;
}

function calculateWeeklyPercentage() {
  const days =
    calculateWeekDayStats();

  if (state.habits.length === 0) {
    return 0;
  }

  let completed = 0;
  let possible =
    state.habits.length * 7;

  days.forEach(day => {
    completed += day.completed;
  });

  return Math.round(
    (completed / possible) * 100
  );
}

/* =========================
   HABIT PERFORMANCE
========================= */

function calculateHabitPercentage(habit) {
  const dates =
    getHabitDates(habit);

  if (dates.length === 0) {
    return 0;
  }

  const today =
    new Date();

  today.setHours(
    0,
    0,
    0,
    0
  );

  const firstDate =
    new Date(
      `${dates[0]}T00:00:00`
    );

  const difference =
    Math.floor(
      (today - firstDate) /
      (1000 * 60 * 60 * 24)
    ) + 1;

  const possible =
    Math.max(
      difference,
      dates.length
    );

  return Math.min(
    100,
    Math.round(
      (dates.length / possible) * 100
    )
  );
}

/* =========================
   UPDATE HOME STATS
========================= */

function updateHomeStats() {
  const stats =
    calculateTodayStats();

  const totalHabits =
    document.getElementById(
      "totalHabits"
    );

  const completedToday =
    document.getElementById(
      "completedToday"
    );

  const totalCompletions =
    document.getElementById(
      "totalCompletions"
    );

  const bestStreak =
    document.getElementById(
      "bestStreak"
    );

  const dailyProgress =
    document.getElementById(
      "dailyProgress"
    );

  const dailyProgressText =
    document.getElementById(
      "dailyProgressText"
    );

  const todayDate =
    document.getElementById(
      "todayDate"
    );

  if (totalHabits) {
    totalHabits.textContent =
      stats.total;
  }

  if (completedToday) {
    completedToday.textContent =
      stats.completed;
  }

  if (totalCompletions) {
    totalCompletions.textContent =
      calculateTotalCompletions();
  }

  if (bestStreak) {
    bestStreak.textContent =
      calculateBestStreak();
  }

  if (dailyProgress) {
    dailyProgress.textContent =
      `${stats.percentage}%`;
  }

  if (dailyProgressText) {
    dailyProgressText.textContent =
      `${stats.percentage}% completed`;
  }

  if (todayDate) {
    todayDate.textContent =
      new Date().toLocaleDateString(
        undefined,
        {
          weekday: "long",
          month: "long",
          day: "numeric"
        }
      );
  }
}

/* =========================
   STATS DASHBOARD
========================= */

function updateStatsDashboard() {
  const todayStats =
    calculateTodayStats();

  const todayPercentage =
    document.getElementById(
      "statsTodayPercentage"
    );

  const todayText =
    document.getElementById(
      "statsTodayText"
    );

  const ringValue =
    document.getElementById(
      "statsRingValue"
    );

  const totalHabits =
    document.getElementById(
      "statsTotalHabits"
    );

  const completedToday =
    document.getElementById(
      "statsCompletedToday"
    );

  const currentStreak =
    document.getElementById(
      "statsCurrentStreak"
    );

  const bestStreak =
    document.getElementById(
      "statsBestStreak"
    );

  const totalCompletions =
    document.getElementById(
      "statsTotalCompletions"
    );

  const weeklyPercentage =
    document.getElementById(
      "statsWeeklyPercentage"
    );

  if (todayPercentage) {
    todayPercentage.textContent =
      `${todayStats.percentage}%`;
  }

  if (todayText) {
    todayText.textContent =
      `${todayStats.completed} of ${todayStats.total} habits completed`;
  }

  if (ringValue) {
    ringValue.textContent =
      `${todayStats.percentage}%`;
  }

  if (totalHabits) {
    totalHabits.textContent =
      state.habits.length;
  }

  if (completedToday) {
    completedToday.textContent =
      todayStats.completed;
  }

  if (currentStreak) {
    currentStreak.textContent =
      calculateCurrentStreak();
  }

  if (bestStreak) {
    bestStreak.textContent =
      calculateBestStreak();
  }

  if (totalCompletions) {
    totalCompletions.textContent =
      calculateTotalCompletions();
  }

  if (weeklyPercentage) {
    weeklyPercentage.textContent =
      `${calculateWeeklyPercentage()}%`;
  }

  renderWeeklyPerformance();
  renderHabitPerformance();
}

/* =========================
   WEEKLY PERFORMANCE UI
========================= */

function renderWeeklyPerformance() {
  const container =
    document.getElementById(
      "weeklyPerformance"
    );

  if (!container) return;

  container.innerHTML = "";

  const days =
    calculateWeekDayStats();

  if (state.habits.length === 0) {
    const empty =
      document.createElement("div");

    empty.className =
      "no-stats";

    empty.textContent =
      "Add habits to see your weekly performance.";

    container.appendChild(empty);

    return;
  }

  days.forEach(day => {
    const wrapper =
      document.createElement("div");

    wrapper.className =
      "week-day";

    const barContainer =
      document.createElement("div");

    barContainer.className =
      "week-bar-container";

    const bar =
      document.createElement("div");

    bar.className =
      "week-bar";

    bar.style.height =
      `${Math.max(
        day.percentage,
        3
      )}%`;

    barContainer.appendChild(bar);

    const dayName =
      document.createElement("span");

    dayName.className =
      "week-day-name";

    dayName.textContent =
      day.date
        .toLocaleDateString(
          undefined,
          {
            weekday: "short"
          }
        )
        .slice(0, 2);

    const value =
      document.createElement("span");

    value.className =
      "week-day-value";

    value.textContent =
      `${day.percentage}%`;

    wrapper.appendChild(
      barContainer
    );

    wrapper.appendChild(
      dayName
    );

    wrapper.appendChild(
      value
    );

    container.appendChild(
      wrapper
    );
  });
}

/* =========================
   HABIT PERFORMANCE UI
========================= */

function renderHabitPerformance() {
  const container =
    document.getElementById(
      "habitPerformance"
    );

  if (!container) return;

  container.innerHTML = "";

  if (state.habits.length === 0) {
    const empty =
      document.createElement("div");

    empty.className =
      "no-stats";

    empty.textContent =
      "Add your first habit to see performance.";

    container.appendChild(empty);

    return;
  }

  state.habits.forEach(habit => {
    const percentage =
      calculateHabitPercentage(
        habit
      );

    const row =
      document.createElement("div");

    row.className =
      "habit-performance-row";

    const name =
      document.createElement("div");

    name.className =
      "habit-performance-name";

    name.textContent =
      habit.name;

    const track =
      document.createElement("div");

    track.className =
      "habit-progress-track";

    const fill =
      document.createElement("div");

    fill.className =
      "habit-progress-fill";

    fill.style.width =
      `${percentage}%`;

    track.appendChild(fill);

    const percent =
      document.createElement("div");

    percent.className =
      "habit-performance-percent";

    percent.textContent =
      `${percentage}%`;

    row.appendChild(name);
    row.appendChild(track);
    row.appendChild(percent);

    container.appendChild(row);
  });
}

/* =========================
   NAVIGATION
========================= */

function showHabits() {
  const habitsSection =
    document.getElementById(
      "habitsSection"
    );

  const statsSection =
    document.getElementById(
      "statsSection"
    );

  if (habitsSection) {
    habitsSection.classList.remove(
      "hidden"
    );
  }

  if (statsSection) {
    statsSection.classList.add(
      "hidden"
    );
  }

  setActiveNav("habitsNav");
}

function showStats() {
  const habitsSection =
    document.getElementById(
      "habitsSection"
    );

  const statsSection =
    document.getElementById(
      "statsSection"
    );

  if (habitsSection) {
    habitsSection.classList.add(
      "hidden"
    );
  }

  if (statsSection) {
    statsSection.classList.remove(
      "hidden"
    );
  }

  updateStatsDashboard();

  setActiveNav("statsNav");

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

function setActiveNav(id) {
  document
    .querySelectorAll(".nav-item")
    .forEach(item => {
      item.classList.remove(
        "active"
      );
    });

  const active =
    document.getElementById(id);

  if (active) {
    active.classList.add(
      "active"
    );
  }
}

/* =========================
   RENDER ALL
========================= */

function renderAll() {
  renderWeek();
  renderHabits();
  updateHomeStats();

  if (
    !document
      .getElementById("statsSection")
      ?.classList.contains("hidden")
  ) {
    updateStatsDashboard();
  }
}

/* =========================
   APP START
========================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    loadData();

    /* Add top button */

    const addHabitBtn =
      document.getElementById(
        "addHabitBtn"
      );

    if (addHabitBtn) {
      addHabitBtn.addEventListener(
        "click",
        openModal
      );
    }

    /* Habits navigation */

    const habitsNav =
      document.getElementById(
        "habitsNav"
      );

    if (habitsNav) {
      habitsNav.addEventListener(
        "click",
        showHabits
      );
    }

    /* Stats navigation */

    const statsNav =
      document.getElementById(
        "statsNav"
      );

    if (statsNav) {
      statsNav.addEventListener(
        "click",
        showStats
      );
    }

    /* Add navigation */

    const addNav =
      document.getElementById(
        "addNav"
      );

    if (addNav) {
      addNav.addEventListener(
        "click",
        openModal
      );
    }

    /* Close modal */

    const closeModalButton =
      document.getElementById(
        "closeModal"
      );

    if (closeModalButton) {
      closeModalButton.addEventListener(
        "click",
        closeModal
      );
    }

    /* Modal backdrop */

    const modalBackdrop =
      document.getElementById(
        "modalBackdrop"
      );

    if (modalBackdrop) {
      modalBackdrop.addEventListener(
        "click",
        closeModal
      );
    }

    /* Save habit */

    const saveHabit =
      document.getElementById(
        "saveHabit"
      );

    if (saveHabit) {
      saveHabit.addEventListener(
        "click",
        addHabit
      );
    }

    /* Enter to add */

    const habitName =
      document.getElementById(
        "habitName"
      );

    if (habitName) {
      habitName.addEventListener(
        "keydown",
        event => {
          if (
            event.key === "Enter"
          ) {
            addHabit();
          }
        }
      );
    }

    /* Previous week */

    const prevWeek =
      document.getElementById(
        "prevWeek"
      );

    if (prevWeek) {
      prevWeek.addEventListener(
        "click",
        () => {
          changeWeek(-1);
        }
      );
    }

    /* Next week */

    const nextWeek =
      document.getElementById(
        "nextWeek"
      );

    if (nextWeek) {
      nextWeek.addEventListener(
        "click",
        () => {
          changeWeek(1);
        }
      );
    }

    /* Today */

    const todayBtn =
      document.getElementById(
        "todayBtn"
      );

    if (todayBtn) {
      todayBtn.addEventListener(
        "click",
        goToToday
      );
    }

    /* Start */

    showHabits();

    renderAll();
  }
);
