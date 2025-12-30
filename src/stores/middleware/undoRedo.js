/**
 * Undo/Redo Middleware for Zustand
 *
 * This middleware tracks state changes and allows for undo/redo functionality.
 * It maintains a history of states with a configurable limit.
 */

const undoRedoMiddleware = (config) => (set, get, api) => {
  const { limit = 50, equality = (a, b) => a === b } = config || {};

  api.temporal = {
    past: [],
    future: [],
  };

  const setWithHistory = (partial, replace) => {
    const prevState = get();

    // Execute the actual state change
    set(partial, replace);

    const nextState = get();

    // Only record if state actually changed
    if (!equality(prevState, nextState)) {
      api.temporal.past.push(prevState);

      // Limit history size
      if (api.temporal.past.length > limit) {
        api.temporal.past.shift();
      }

      // Clear future when new action is performed
      api.temporal.future = [];
    }
  };

  return {
    ...config(setWithHistory, get, api),

    // Undo/Redo actions
    undo: () => {
      if (api.temporal.past.length === 0) return;

      const current = get();
      const previous = api.temporal.past.pop();

      api.temporal.future.push(current);

      set(previous, true); // Replace state completely
    },

    redo: () => {
      if (api.temporal.future.length === 0) return;

      const current = get();
      const next = api.temporal.future.pop();

      api.temporal.past.push(current);

      set(next, true); // Replace state completely
    },

    clearHistory: () => {
      api.temporal.past = [];
      api.temporal.future = [];
    },

    canUndo: () => api.temporal.past.length > 0,
    canRedo: () => api.temporal.future.length > 0,
  };
};

export default undoRedoMiddleware;
