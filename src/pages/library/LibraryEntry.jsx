import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { BookOpen, LogIn, ScanLine } from 'lucide-react';

/**
 * LibraryEntry - 圖書館借書入口頁面
 *
 * Flowchart node:
 * - Start: 手機借書 - 借書情境
 * - CheckLogin: 是否已登入? → 已登入直接進入借書流程，未登入導向登入頁
 */
export default function LibraryEntry() {
  const navigate = useNavigate();
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);

  const handleStartBorrow = () => {
    if (isLoggedIn) {
      // CheckLogin: 已登入 → CheckCardStatus
      navigate('/library/card-check');
    } else {
      // CheckLogin: 未登入 → LoginPrompt
      navigate('/library/login');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-2xl shadow-xl max-w-sm w-full p-6 space-y-8">
        <div className="text-center">
          <div className="w-20 h-20 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-100">手機借書服務</h1>
          <p className="text-gray-400 mt-2">使用手機掃描條碼，輕鬆借書</p>
        </div>

        <button
          onClick={handleStartBorrow}
          className="w-full btn btn-primary py-4 text-lg flex items-center justify-center gap-3"
        >
          {isLoggedIn ? (
            <>
              <ScanLine className="w-6 h-6" />
              開始借書
            </>
          ) : (
            <>
              <LogIn className="w-6 h-6" />
              登入借書
            </>
          )}
        </button>

        <div className="text-center space-y-2">
          <p className="text-gray-500 text-xs">借閱前請確認已辦理借閱證</p>
          {isLoggedIn && (
            <p className="text-green-400 text-sm">
              已登入：{useAuthStore.getState().user?.name}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
