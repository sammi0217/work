import { create } from 'zustand';

/**
 * Card status constants
 */
export const CARD_STATUS = {
  NORMAL: 'normal',
  NOT_ACTIVATED: 'not_activated',
  LOST: 'lost',
  SUSPENDED: 'suspended',
};

/**
 * Authentication Store
 *
 * Manages user login state and library card information.
 */
export const useAuthStore = create((set) => ({
  // Login state
  isLoggedIn: false,
  user: null,

  // Library card info
  cardStatus: null,
  cardBarcode: null,

  /**
   * Login with credentials
   * Simulates API call to authenticate user
   */
  login: async (username, password) => {
    set({ isLoggingIn: true, loginError: null });

    try {
      // Simulate API authentication
      await new Promise((resolve) => setTimeout(resolve, 800));

      if (!username || !password) {
        set({ isLoggingIn: false, loginError: '請輸入帳號和密碼' });
        return false;
      }

      // Simulated user data from backend
      const userData = {
        id: 'U' + Date.now(),
        username,
        name: username === 'demo' ? '王小明' : username,
        email: `${username}@library.example.com`,
      };

      // Simulated card status (demo accounts for testing different flows)
      let cardStatus = CARD_STATUS.NORMAL;
      let cardBarcode = 'LIB' + String(Math.floor(Math.random() * 900000000) + 100000000);

      if (username === 'inactive') {
        cardStatus = CARD_STATUS.NOT_ACTIVATED;
      } else if (username === 'lost') {
        cardStatus = CARD_STATUS.LOST;
      } else if (username === 'suspended') {
        cardStatus = CARD_STATUS.SUSPENDED;
      }

      set({
        isLoggedIn: true,
        user: userData,
        cardStatus,
        cardBarcode,
        isLoggingIn: false,
        loginError: null,
      });

      return true;
    } catch {
      set({ isLoggingIn: false, loginError: '登入失敗，請稍後再試' });
      return false;
    }
  },

  /**
   * Logout - clear all auth state
   */
  logout: () => {
    set({
      isLoggedIn: false,
      user: null,
      cardStatus: null,
      cardBarcode: null,
      loginError: null,
    });
  },

  // Login form state
  isLoggingIn: false,
  loginError: null,
  clearLoginError: () => set({ loginError: null }),
}));
