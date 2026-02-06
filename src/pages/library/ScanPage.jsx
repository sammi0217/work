import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { useLibraryStore, BORROW_RESULT } from '../../stores/libraryStore';
import {
  Camera,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  BookOpen,
  ArrowRight,
  RotateCcw,
  List,
} from 'lucide-react';

/**
 * ScanPage - 掃描借書頁面
 *
 * Flowchart nodes:
 * - ScanPage: 掃描頁面，顯示借閱證條碼，啟動倒數計時
 * - ScanAction: 掃描館藏條碼 (成功/失敗/倒數結束)
 * - ValidateBook: 驗證館藏 (可借閱/不可借/超過上限/查無此書)
 * - ProcessBorrow: 執行借閱，更新系統資料
 * - BorrowSuccess: 借閱成功，顯示書籍資訊
 * - MoreBooks: 繼續借書?
 * - ResetTimer: 重置倒數計時
 * - TimeoutClose: 自動關閉，返回首頁
 */
export default function ScanPage() {
  const navigate = useNavigate();
  const [manualBarcode, setManualBarcode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const inputRef = useRef(null);
  const timerRef = useRef(null);

  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const cardBarcode = useAuthStore((s) => s.cardBarcode);
  const user = useAuthStore((s) => s.user);

  const countdownSeconds = useLibraryStore((s) => s.countdownSeconds);
  const isCountdownActive = useLibraryStore((s) => s.isCountdownActive);
  const lastScanResult = useLibraryStore((s) => s.lastScanResult);
  const sessionBorrowedBooks = useLibraryStore((s) => s.sessionBorrowedBooks);
  const startSession = useLibraryStore((s) => s.startSession);
  const tickCountdown = useLibraryStore((s) => s.tickCountdown);
  const resetCountdown = useLibraryStore((s) => s.resetCountdown);
  const processBarcode = useLibraryStore((s) => s.processBarcode);
  const endSession = useLibraryStore((s) => s.endSession);
  const clearScanResult = useLibraryStore((s) => s.clearScanResult);

  // Redirect if not logged in
  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/library/login');
    }
  }, [isLoggedIn, navigate]);

  // Start session on mount
  useEffect(() => {
    startSession();
    return () => {
      // Cleanup timer on unmount
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [startSession]);

  // Countdown timer
  useEffect(() => {
    if (isCountdownActive) {
      timerRef.current = setInterval(() => {
        const timeout = tickCountdown();
        if (timeout) {
          // TimeoutClose: auto-close, return to home
          clearInterval(timerRef.current);
        }
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isCountdownActive, tickCountdown]);

  // Auto-navigate home on timeout
  useEffect(() => {
    if (countdownSeconds === 0 && !isCountdownActive) {
      endSession();
      navigate('/library/records');
    }
  }, [countdownSeconds, isCountdownActive, endSession, navigate]);

  // Handle barcode scan (manual input simulation)
  const handleScan = useCallback(async () => {
    if (!manualBarcode.trim() || isProcessing) return;

    setIsProcessing(true);
    clearScanResult();

    const result = await processBarcode(manualBarcode.trim());

    if (result.type === BORROW_RESULT.SUCCESS) {
      resetCountdown();
    }

    setManualBarcode('');
    setIsProcessing(false);
  }, [manualBarcode, isProcessing, clearScanResult, processBarcode, resetCountdown]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleScan();
    }
  };

  const handleContinueScan = () => {
    clearScanResult();
    setManualBarcode('');
    inputRef.current?.focus();
  };

  const handleFinish = () => {
    endSession();
    navigate('/library/records');
  };

  // Format countdown display
  const minutes = Math.floor(countdownSeconds / 60);
  const seconds = countdownSeconds % 60;
  const countdownDisplay = `${minutes}:${String(seconds).padStart(2, '0')}`;
  const isCountdownLow = countdownSeconds <= 30;

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Header with countdown */}
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary-400" />
          <span className="text-gray-100 font-medium">手機借書</span>
        </div>

        <div
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-mono ${
            isCountdownLow
              ? 'bg-red-900/50 text-red-300 animate-pulse'
              : 'bg-gray-700 text-gray-300'
          }`}
        >
          <Clock className="w-4 h-4" />
          {countdownDisplay}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Library card barcode display */}
        <div className="bg-gray-800 rounded-xl p-4">
          <p className="text-gray-400 text-xs mb-2">借閱證條碼</p>
          <div className="bg-white rounded-lg p-3 text-center">
            <div className="font-mono text-2xl tracking-widest text-gray-900 font-bold">
              {cardBarcode}
            </div>
            <p className="text-gray-500 text-xs mt-1">{user?.name}</p>
          </div>
        </div>

        {/* Barcode scan input (simulates camera scan) */}
        <div className="bg-gray-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2 text-gray-300 text-sm">
            <Camera className="w-4 h-4 text-primary-400" />
            掃描館藏條碼
          </div>

          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={manualBarcode}
              onChange={(e) => setManualBarcode(e.target.value)}
              onKeyDown={handleKeyDown}
              className="input flex-1"
              placeholder="輸入或掃描書籍條碼..."
              disabled={isProcessing}
              autoFocus
            />
            <button
              onClick={handleScan}
              disabled={isProcessing || !manualBarcode.trim()}
              className="btn btn-primary px-4 flex items-center gap-1"
            >
              {isProcessing ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <ArrowRight className="w-4 h-4" />
              )}
            </button>
          </div>

          <p className="text-gray-500 text-xs">
            可用條碼：9789573281（解憂雜貨店）、9789862137（小王子）、9789861795（被討厭的勇氣）、9789573327（已借出）、9789573269（館內使用）、9789863426（已預約）
          </p>
        </div>

        {/* Scan result display */}
        {lastScanResult && (
          <ScanResultCard
            result={lastScanResult}
            onContinue={handleContinueScan}
            onFinish={handleFinish}
          />
        )}

        {/* Session borrowed books count */}
        {sessionBorrowedBooks.length > 0 && (
          <div className="bg-gray-800 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <List className="w-4 h-4 text-primary-400" />
                <span className="text-gray-300 text-sm">
                  本次已借 <span className="text-primary-400 font-bold">{sessionBorrowedBooks.length}</span> 本
                </span>
              </div>
              <button
                onClick={handleFinish}
                className="text-primary-400 text-sm hover:text-primary-300"
              >
                完成借書 →
              </button>
            </div>

            <div className="mt-3 space-y-2">
              {sessionBorrowedBooks.map((book) => (
                <div
                  key={book.id}
                  className="flex items-center gap-2 text-sm text-gray-400 bg-gray-700/50 rounded-lg px-3 py-2"
                >
                  <CheckCircle className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
                  <span className="truncate">{book.title}</span>
                  <span className="text-gray-500 ml-auto flex-shrink-0">{book.author}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * ScanResultCard - Displays the result of a barcode scan
 */
function ScanResultCard({ result, onContinue, onFinish }) {
  const isSuccess = result.type === BORROW_RESULT.SUCCESS;
  const isOverLimit = result.type === BORROW_RESULT.OVER_LIMIT;

  const navigate = useNavigate();

  const resultConfig = {
    [BORROW_RESULT.SUCCESS]: {
      icon: CheckCircle,
      iconColor: 'text-green-400',
      bgColor: 'bg-green-900/20 border-green-800/50',
    },
    [BORROW_RESULT.ALREADY_BORROWED]: {
      icon: XCircle,
      iconColor: 'text-red-400',
      bgColor: 'bg-red-900/20 border-red-800/50',
    },
    [BORROW_RESULT.IN_LIBRARY_ONLY]: {
      icon: AlertCircle,
      iconColor: 'text-yellow-400',
      bgColor: 'bg-yellow-900/20 border-yellow-800/50',
    },
    [BORROW_RESULT.RESERVED]: {
      icon: AlertCircle,
      iconColor: 'text-orange-400',
      bgColor: 'bg-orange-900/20 border-orange-800/50',
    },
    [BORROW_RESULT.OVER_LIMIT]: {
      icon: XCircle,
      iconColor: 'text-red-400',
      bgColor: 'bg-red-900/20 border-red-800/50',
    },
    [BORROW_RESULT.NOT_FOUND]: {
      icon: AlertCircle,
      iconColor: 'text-gray-400',
      bgColor: 'bg-gray-700/50 border-gray-600/50',
    },
  };

  const config = resultConfig[result.type] || resultConfig[BORROW_RESULT.NOT_FOUND];
  const Icon = config.icon;

  return (
    <div className={`rounded-xl p-4 border ${config.bgColor} space-y-3`}>
      <div className="flex items-start gap-3">
        <Icon className={`w-6 h-6 ${config.iconColor} flex-shrink-0 mt-0.5`} />
        <div className="flex-1">
          <p className="text-gray-100 font-medium">{result.message}</p>
          {result.book && (
            <div className="mt-2 text-sm text-gray-400 space-y-1">
              <p>書名：{result.book.title}</p>
              <p>作者：{result.book.author}</p>
              {isSuccess && result.book.dueDate && (
                <p className="text-green-400">
                  到期日：{new Date(result.book.dueDate).toLocaleDateString('zh-TW')}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        {isOverLimit ? (
          <button
            onClick={() => navigate('/library/records')}
            className="flex-1 btn btn-secondary text-sm py-2 flex items-center justify-center gap-1"
          >
            <List className="w-4 h-4" />
            查看借閱記錄
          </button>
        ) : (
          <>
            <button
              onClick={onContinue}
              className="flex-1 btn btn-primary text-sm py-2 flex items-center justify-center gap-1"
            >
              <RotateCcw className="w-4 h-4" />
              繼續掃描
            </button>
            <button
              onClick={onFinish}
              className="flex-1 btn btn-secondary text-sm py-2 flex items-center justify-center gap-1"
            >
              <List className="w-4 h-4" />
              完成借書
            </button>
          </>
        )}
      </div>
    </div>
  );
}
