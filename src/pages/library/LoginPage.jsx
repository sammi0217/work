import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { LogIn, UserPlus, X, BookOpen, AlertCircle } from 'lucide-react';

/**
 * LoginPage - 登入頁面
 *
 * Flowchart nodes:
 * - LoginPrompt: 提示需要登入，顯示登入/註冊選項
 * - LoginChoice: 選擇登入/註冊說明/取消
 * - DoLogin: 執行登入
 * - RegisterGuide: 顯示申請說明，連結至註冊網站
 */
export default function LoginPage() {
  const [view, setView] = useState('prompt'); // 'prompt' | 'login' | 'register'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const isLoggingIn = useAuthStore((s) => s.isLoggingIn);
  const loginError = useAuthStore((s) => s.loginError);
  const clearLoginError = useAuthStore((s) => s.clearLoginError);

  const handleLogin = async (e) => {
    e.preventDefault();
    const success = await login(username, password);
    if (success) {
      navigate('/library/card-check');
    }
  };

  const handleCancel = () => {
    navigate('/');
  };

  // 登入提示畫面 (LoginPrompt + LoginChoice)
  if (view === 'prompt') {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800 rounded-2xl shadow-xl max-w-sm w-full p-6 space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-100">手機借書服務</h1>
            <p className="text-gray-400 text-sm mt-2">請先登入以使用借閱服務</p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => {
                clearLoginError();
                setView('login');
              }}
              className="w-full btn btn-primary flex items-center justify-center gap-2 py-3"
            >
              <LogIn className="w-5 h-5" />
              登入
            </button>

            <button
              onClick={() => setView('register')}
              className="w-full btn btn-secondary flex items-center justify-center gap-2 py-3"
            >
              <UserPlus className="w-5 h-5" />
              註冊說明
            </button>

            <button
              onClick={handleCancel}
              className="w-full btn bg-gray-700 hover:bg-gray-600 text-gray-300 flex items-center justify-center gap-2 py-3"
            >
              <X className="w-5 h-5" />
              取消
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 登入表單 (DoLogin)
  if (view === 'login') {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800 rounded-2xl shadow-xl max-w-sm w-full p-6 space-y-6">
          <div className="text-center">
            <h1 className="text-xl font-bold text-gray-100">讀者登入</h1>
            <p className="text-gray-400 text-sm mt-1">請輸入借閱證帳號和密碼</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">帳號（借閱證號）</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input w-full"
                placeholder="請輸入帳號"
                autoFocus
                disabled={isLoggingIn}
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">密碼</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input w-full"
                placeholder="請輸入密碼"
                disabled={isLoggingIn}
              />
            </div>

            {loginError && (
              <div className="flex items-center gap-2 text-red-400 text-sm bg-red-900/30 rounded-lg p-3">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {loginError}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full btn btn-primary py-3 flex items-center justify-center gap-2"
            >
              {isLoggingIn ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  登入中...
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  登入
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setView('prompt')}
              className="w-full text-gray-400 text-sm hover:text-gray-200 py-2"
            >
              返回
            </button>
          </form>

          <div className="border-t border-gray-700 pt-4">
            <p className="text-gray-500 text-xs text-center">
              測試帳號：demo / demo（正常）、inactive（未啟用）、lost（掛失）、suspended（停權）
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 註冊說明 (RegisterGuide)
  if (view === 'register') {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800 rounded-2xl shadow-xl max-w-sm w-full p-6 space-y-6">
          <div className="text-center">
            <h1 className="text-xl font-bold text-gray-100">申請借閱證說明</h1>
          </div>

          <div className="space-y-4 text-sm text-gray-300">
            <div className="bg-gray-700/50 rounded-lg p-4 space-y-2">
              <h3 className="font-medium text-gray-100">申請資格</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-400">
                <li>年滿6歲以上之國民</li>
                <li>持有效身分證件或戶口名簿</li>
                <li>在學學生可持學生證申請</li>
              </ul>
            </div>

            <div className="bg-gray-700/50 rounded-lg p-4 space-y-2">
              <h3 className="font-medium text-gray-100">申請方式</h3>
              <ol className="list-decimal list-inside space-y-1 text-gray-400">
                <li>至圖書館服務櫃台辦理</li>
                <li>攜帶身分證件及一吋照片一張</li>
                <li>填寫借閱證申請表</li>
                <li>或至線上申請系統辦理</li>
              </ol>
            </div>

            <a
              href="https://library.example.com/register"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full btn btn-primary text-center py-3"
            >
              前往線上註冊
            </a>
          </div>

          <button
            onClick={() => setView('prompt')}
            className="w-full text-gray-400 text-sm hover:text-gray-200 py-2"
          >
            返回
          </button>
        </div>
      </div>
    );
  }

  return null;
}
