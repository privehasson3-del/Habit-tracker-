const STORAGE_KEY = "habit-grid-data-v1";

const state = {
  habits: [],
  currentWeekStart: getMonday(new Date())
};

const defaultHabits = [
  {
    id: crypto.randomUUID(),
    name: "Study",
    completed: {}
  },
  {
    id: crypto.randomUUID(),
    name: "Workout",
    completed: {}
  },
  {
    id: crypto.randomUUID(),
    name: "Read",
    completed: {}
  },
  {
    id: crypto.randomUUID(),
    name: "Sleep on time",
    completed: {}
  }
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

  dates.forEach((date) => {
    const header = document.createElement("div");

    header.className = "date-header";

    if (
      dateKey(date) ===
      dateKey(new Date())
    ) {
      header.classList.add("today");
    }

    const day = document.createElement("span");

    day.className = "day";

    day.textContent =
      date
        .toLocaleDateString(undefined, {
          weekday: "short"
        })
        .slice(0, 2);

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

  state.habits.forEach((habit) => {
    const row = document.createElement("div");

    row.className = "habit-row";

    /* Habit name */

    const nameCell =
      document.createElement("div");

    nameCell.className = "habit-name";

    const name =
      document.createElement("span");

    name.className = "habit-name-text";

    name.textContent = habit.name;

    /* Delete */

    const deleteButton =
      document.createElement("button");

    deleteButton.className =
      "habit-delete";

    deleteButton.textContent = "×";

    deleteButton.title =
      "Delete habit";

    deleteButton.addEventListener(
      "click",
      () => {
        deleteHabit(habit.id);
      }
    );

    nameCell.appendChild(name);
    nameCell.appendChild(deleteButton);

    row.appendChild(nameCell);

    /* Seven days */

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
   TOGGLE HABIT
========================= */

function toggleHabit(
  habitId,
  key
) {
  const habit =
    state.habits.find(
      (item) =>
        item.id === habitId
    );

  if (!habit) return;

  habit.completed[key] =
    !habit.completed[key];

  saveData();

  renderAll();
}

/* =========================
   DELETE HABIT
========================= */

function deleteHabit(habitId) {
  const habit =
    state.habits.find(
      (item) =>
        item.id === habitId
    );

  if (!habit) return;

  const confirmed =
    confirm(
      `Delete "${habit.name}"?`
    );

  if (!confirmed) return;

  state.habits =
    state.habits.filter(
      (item) =>
        item.id !== habitId
    );

  saveData();

  renderAll();
}

/* =========================
   ADD HABIT
========================= */

function addHabit() {
  const input =
    document.getElementById(
      "habitName"
    );

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
    document.getElementById(
      "habitModal"
    );

  if (!modal) return;

  modal.classList.remove(
    "hidden"
  );

  setTimeout(() => {
    const input =
      document.getElementById(
        "habitName"
      );

    if (input) {
      input.focus();
    }
  }, 100);
}

function closeModal() {
  const modal =
    document.getElementById(
      "habitModal"
    );

  if (!modal) return;

  modal.classList.add(
    "hidden"
  );
}

/* =========================
   NAVIGATION
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
   STATISTICS
========================= */

function calculateTodayStats() {
  const today =
    dateKey(new Date());

  let completed = 0;

  state.habits.forEach(
    (habit) => {
      if (
        habit.completed &&
        habit.completed[today]
      ) {
        completed++;
      }
    }
  );

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

  state.habits.forEach(
    (habit) => {
      if (!habit.completed) return;

      Object.values(
        habit.completed
      ).forEach((value) => {
        if (value) {
          total++;
        }
      });
    }
  );

  return total;
}

function calculateBestStreak() {
  let best = 0;

  state.habits.forEach(
    (habit) => {
      if (!habit.completed) return;

      const dates =
        Object.keys(
          habit.completed
        )
          .filter(
            (key) =>
              habit.completed[key]
          )
          .sort();

      let streak = 0;
      let previous = null;

      dates.forEach((key) => {
        const current =
          new Date(
            `${key}T00:00:00`
          );

        if (previous) {
          const difference =
            (current - previous) /
            (1000 * 60 * 60 * 24);

          if (difference === 1) {
            streak++;
          } else {
            streak = 1;
          }
        } else {
          streak = 1;
        }

        best =
          Math.max(
            best,
            streak
          );

        previous = current;
      });
    }
  );

  return best;
}

function updateStats() {
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
   RENDER EVERYTHING
========================= */

function renderAll() {
  renderWeek();
  renderHabits();
  updateStats();
}

/* =========================
   STATS NAVIGATION
========================= */

function openStats() {
  const statsSection =
    document.querySelector(
      ".stats-grid"
    );

  if (!statsSection) {
    console.warn(
      "Stats section not found."
    );

    return;
  }

  statsSection.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}

/* =========================
   APP START
========================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {
    loadData();

    /* Add button */

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

    /* Bottom Add */

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

    /* Stats */

    const statsNav =
      document.getElementById(
        "statsNav"
      );

    if (statsNav) {
      statsNav.addEventListener(
        "click",
        openStats
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

    /* Enter to save */

    const habitName =
      document.getElementById(
        "habitName"
      );

    if (habitName) {
      habitName.addEventListener(
        "keydown",
        (event) => {
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

    /* Initial render */

    renderAll();
  }
);
