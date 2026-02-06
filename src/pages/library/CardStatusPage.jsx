import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore, CARD_STATUS } from '../../stores/authStore';
import { AlertTriangle, ShieldAlert, ShieldOff, Loader2 } from 'lucide-react';

/**
 * CardStatusPage - 借閱證狀態檢查頁面
 *
 * Flowchart nodes:
 * - CheckCardStatus: 借閱證狀態? (正常/未啟用/已掛失/停權)
 * - ActivatePrompt: 提示需至櫃檯啟用，顯示啟用說明
 * - StatusPrompt: 顯示借閱證狀態，引導至處理方式
 */
export default function CardStatusPage() {
  const navigate = useNavigate();
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const cardStatus = useAuthStore((s) => s.cardStatus);
  const user = useAuthStore((s) => s.user);

  // Redirect to login if not logged in
  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/library/login');
      return;
    }

    // If card is normal, go directly to scan page
    if (cardStatus === CARD_STATUS.NORMAL) {
      navigate('/library/scan');
    }
  }, [isLoggedIn, cardStatus, navigate]);

  // Show loading while redirecting
  if (!isLoggedIn || cardStatus === CARD_STATUS.NORMAL) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary-400 animate-spin" />
      </div>
    );
  }

  // 未啟用 (ActivatePrompt)
  if (cardStatus === CARD_STATUS.NOT_ACTIVATED) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800 rounded-2xl shadow-xl max-w-sm w-full p-6 space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-yellow-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-yellow-400" />
            </div>
            <h1 className="text-xl font-bold text-gray-100">借閱證尚未啟用</h1>
            <p className="text-gray-400 text-sm mt-2">
              {user?.name}，您好！您的借閱證尚未啟用，請至圖書館櫃檯辦理啟用手續。
            </p>
          </div>

          <div className="bg-gray-700/50 rounded-lg p-4 space-y-3 text-sm">
            <h3 className="font-medium text-gray-100">啟用方式</h3>
            <ol className="list-decimal list-inside space-y-2 text-gray-400">
              <li>攜帶您的身分證件至任一分館服務櫃台</li>
              <li>出示身分證明文件</li>
              <li>由館員協助啟用借閱證</li>
              <li>啟用後即可使用手機借書服務</li>
            </ol>
          </div>

          <div className="bg-gray-700/50 rounded-lg p-4 text-sm">
            <h3 className="font-medium text-gray-100 mb-2">服務時間</h3>
            <p className="text-gray-400">週二至週日 09:00 - 21:00</p>
            <p className="text-gray-400">週一及國定假日休館</p>
          </div>

          <button
            onClick={() => navigate('/')}
            className="w-full btn btn-secondary py-3"
          >
            返回首頁
          </button>
        </div>
      </div>
    );
  }

  // 已掛失 (StatusPrompt - Lost)
  if (cardStatus === CARD_STATUS.LOST) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800 rounded-2xl shadow-xl max-w-sm w-full p-6 space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldAlert className="w-8 h-8 text-red-400" />
            </div>
            <h1 className="text-xl font-bold text-gray-100">借閱證已掛失</h1>
            <p className="text-gray-400 text-sm mt-2">
              {user?.name}，您好！您的借閱證目前為掛失狀態，無法使用借閱服務。
            </p>
          </div>

          <div className="bg-gray-700/50 rounded-lg p-4 space-y-3 text-sm">
            <h3 className="font-medium text-gray-100">處理方式</h3>
            <ul className="space-y-2 text-gray-400">
              <li className="flex gap-2">
                <span className="text-red-400 font-medium">補發新證：</span>
                至服務櫃台辦理補發，需繳補發工本費 NT$50
              </li>
              <li className="flex gap-2">
                <span className="text-yellow-400 font-medium">取消掛失：</span>
                若已尋回借閱證，可至櫃台辦理取消掛失
              </li>
            </ul>
          </div>

          <button
            onClick={() => navigate('/')}
            className="w-full btn btn-secondary py-3"
          >
            返回首頁
          </button>
        </div>
      </div>
    );
  }

  // 停權 (StatusPrompt - Suspended)
  if (cardStatus === CARD_STATUS.SUSPENDED) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800 rounded-2xl shadow-xl max-w-sm w-full p-6 space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-orange-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldOff className="w-8 h-8 text-orange-400" />
            </div>
            <h1 className="text-xl font-bold text-gray-100">借閱權限已停權</h1>
            <p className="text-gray-400 text-sm mt-2">
              {user?.name}，您好！您的借閱權限目前為停權狀態。
            </p>
          </div>

          <div className="bg-gray-700/50 rounded-lg p-4 space-y-3 text-sm">
            <h3 className="font-medium text-gray-100">可能原因</h3>
            <ul className="list-disc list-inside space-y-1 text-gray-400">
              <li>逾期未歸還書籍</li>
              <li>逾期罰款未繳清</li>
              <li>違反圖書館使用規定</li>
            </ul>
          </div>

          <div className="bg-gray-700/50 rounded-lg p-4 space-y-3 text-sm">
            <h3 className="font-medium text-gray-100">恢復方式</h3>
            <ol className="list-decimal list-inside space-y-1 text-gray-400">
              <li>歸還所有逾期書籍</li>
              <li>繳清逾期罰款</li>
              <li>至服務櫃台辦理恢復借閱權限</li>
            </ol>
          </div>

          <button
            onClick={() => navigate('/')}
            className="w-full btn btn-secondary py-3"
          >
            返回首頁
          </button>
        </div>
      </div>
    );
  }

  return null;
}
