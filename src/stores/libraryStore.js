import { create } from 'zustand';

/**
 * Borrow validation result types
 */
export const BORROW_RESULT = {
  SUCCESS: 'success',
  ALREADY_BORROWED: 'already_borrowed',
  IN_LIBRARY_ONLY: 'in_library_only',
  RESERVED: 'reserved',
  OVER_LIMIT: 'over_limit',
  NOT_FOUND: 'not_found',
};

/**
 * Simulated book catalog for demo purposes
 */
const BOOK_CATALOG = {
  '9789573281': {
    id: 'B001',
    title: '解憂雜貨店',
    author: '東野圭吾',
    isbn: '9789573281',
    status: 'available',
  },
  '9789862137': {
    id: 'B002',
    title: '小王子',
    author: '安東尼·聖修伯里',
    isbn: '9789862137',
    status: 'available',
  },
  '9789573327': {
    id: 'B003',
    title: '哈利波特：神秘的魔法石',
    author: 'J.K. 羅琳',
    isbn: '9789573327',
    status: 'borrowed',
  },
  '9789861795': {
    id: 'B004',
    title: '被討厭的勇氣',
    author: '岸見一郎',
    isbn: '9789861795',
    status: 'available',
  },
  '9789573269': {
    id: 'B005',
    title: '人間失格',
    author: '太宰治',
    isbn: '9789573269',
    status: 'in_library_only',
  },
  '9789863426': {
    id: 'B006',
    title: '原子習慣',
    author: 'James Clear',
    isbn: '9789863426',
    status: 'reserved',
  },
};

const MAX_BORROW_LIMIT = 10;

/**
 * Library Store
 *
 * Manages library borrowing state including:
 * - Current session borrowed books
 * - All borrowed books history
 * - Scan and validation logic
 */
export const useLibraryStore = create((set, get) => ({
  // Borrowing records
  borrowedBooks: [],
  sessionBorrowedBooks: [], // Books borrowed in this scan session

  // Scan state
  isScanning: false,
  scanError: null,
  lastScanResult: null,

  // Countdown timer
  countdownSeconds: 120,
  isCountdownActive: false,

  /**
   * Start a new scanning session
   */
  startSession: () => {
    set({
      sessionBorrowedBooks: [],
      isScanning: true,
      scanError: null,
      lastScanResult: null,
      countdownSeconds: 120,
      isCountdownActive: true,
    });
  },

  /**
   * Reset countdown timer (when user borrows another book)
   */
  resetCountdown: () => {
    set({ countdownSeconds: 120, isCountdownActive: true });
  },

  /**
   * Tick countdown by 1 second
   */
  tickCountdown: () => {
    const current = get().countdownSeconds;
    if (current <= 1) {
      set({ countdownSeconds: 0, isCountdownActive: false, isScanning: false });
      return true; // timeout
    }
    set({ countdownSeconds: current - 1 });
    return false;
  },

  /**
   * Process a scanned barcode
   * Validates the book and attempts to borrow it
   */
  processBarcode: async (barcode) => {
    set({ scanError: null, lastScanResult: null });

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    const { borrowedBooks, sessionBorrowedBooks } = get();

    // Check if book exists in catalog
    const book = BOOK_CATALOG[barcode];
    if (!book) {
      const result = {
        type: BORROW_RESULT.NOT_FOUND,
        message: '查無此館藏，請確認條碼是否正確',
      };
      set({ lastScanResult: result });
      return result;
    }

    // Check borrow limit
    if (borrowedBooks.length + sessionBorrowedBooks.length >= MAX_BORROW_LIMIT) {
      const result = {
        type: BORROW_RESULT.OVER_LIMIT,
        message: `已達借閱上限（${MAX_BORROW_LIMIT}本），請先歸還再借`,
        book,
      };
      set({ lastScanResult: result });
      return result;
    }

    // Check if already borrowed in this session
    const alreadyInSession = sessionBorrowedBooks.find((b) => b.isbn === barcode);
    if (alreadyInSession) {
      const result = {
        type: BORROW_RESULT.ALREADY_BORROWED,
        message: '此書已在本次借閱清單中',
        book,
      };
      set({ lastScanResult: result });
      return result;
    }

    // Check book availability
    if (book.status === 'borrowed') {
      const result = {
        type: BORROW_RESULT.ALREADY_BORROWED,
        message: '此書已被借出',
        book,
      };
      set({ lastScanResult: result });
      return result;
    }

    if (book.status === 'in_library_only') {
      const result = {
        type: BORROW_RESULT.IN_LIBRARY_ONLY,
        message: '此書僅限館內使用，無法外借',
        book,
      };
      set({ lastScanResult: result });
      return result;
    }

    if (book.status === 'reserved') {
      const result = {
        type: BORROW_RESULT.RESERVED,
        message: '此書已被預約',
        book,
      };
      set({ lastScanResult: result });
      return result;
    }

    // Success - process borrow
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);

    const borrowRecord = {
      ...book,
      borrowDate: new Date().toISOString(),
      dueDate: dueDate.toISOString(),
      status: 'borrowed',
    };

    set({
      sessionBorrowedBooks: [...sessionBorrowedBooks, borrowRecord],
      lastScanResult: {
        type: BORROW_RESULT.SUCCESS,
        message: '借閱成功',
        book: borrowRecord,
      },
    });

    return {
      type: BORROW_RESULT.SUCCESS,
      message: '借閱成功',
      book: borrowRecord,
    };
  },

  /**
   * End the scanning session and move session books to borrowed list
   */
  endSession: () => {
    const { borrowedBooks, sessionBorrowedBooks } = get();
    set({
      borrowedBooks: [...borrowedBooks, ...sessionBorrowedBooks],
      isScanning: false,
      isCountdownActive: false,
      lastScanResult: null,
      scanError: null,
    });
  },

  /**
   * Clear scan result
   */
  clearScanResult: () => {
    set({ lastScanResult: null, scanError: null });
  },
}));
