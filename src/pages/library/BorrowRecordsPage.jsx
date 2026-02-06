import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { useLibraryStore } from '../../stores/libraryStore';
import {
  BookOpen,
  Calendar,
  User,
  ArrowLeft,
  LogOut,
  BookCopy,
} from 'lucide-react';

/**
 * BorrowRecordsPage - 借閱記錄頁面
 *
 * Flowchart nodes:
 * - ViewRecord: 查看借閱記錄
 * - ShowBorrowList: 顯示本次借閱清單，顯示到期日期
 */
export default function BorrowRecordsPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const logout = useAuthStore((s) => s.logout);
  const borrowedBooks = useLibraryStore((s) => s.borrowedBooks);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleBorrowMore = () => {
    navigate('/library/scan');
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800 rounded-2xl shadow-xl max-w-sm w-full p-6 text-center space-y-4">
          <BookOpen className="w-12 h-12 text-gray-600 mx-auto" />
          <p className="text-gray-400">請先登入以查看借閱記錄</p>
          <button
            onClick={() => navigate('/library/login')}
            className="btn btn-primary w-full py-3"
          >
            前往登入
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1 text-gray-400 hover:text-gray-200"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">首頁</span>
        </button>
        <span className="text-gray-100 font-medium">借閱記錄</span>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1 text-gray-400 hover:text-red-400"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* User info */}
        <div className="bg-gray-800 rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-600/20 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-primary-400" />
          </div>
          <div>
            <p className="text-gray-100 font-medium">{user?.name}</p>
            <p className="text-gray-500 text-xs">已借閱 {borrowedBooks.length} 本</p>
          </div>
        </div>

        {/* Borrowed books list */}
        {borrowedBooks.length === 0 ? (
          <div className="bg-gray-800 rounded-xl p-8 text-center space-y-3">
            <BookCopy className="w-12 h-12 text-gray-600 mx-auto" />
            <p className="text-gray-400">目前沒有借閱記錄</p>
            <p className="text-gray-500 text-sm">開始掃描借書吧！</p>
          </div>
        ) : (
          <div className="space-y-3">
            <h2 className="text-gray-300 text-sm font-medium px-1">借閱清單</h2>
            {borrowedBooks.map((book, index) => (
              <div
                key={`${book.id}-${index}`}
                className="bg-gray-800 rounded-xl p-4 space-y-2"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-gray-100 font-medium">{book.title}</h3>
                    <p className="text-gray-400 text-sm">{book.author}</p>
                  </div>
                  <span className="text-xs bg-green-900/30 text-green-400 px-2 py-1 rounded-full">
                    借閱中
                  </span>
                </div>

                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    借閱日：{new Date(book.borrowDate).toLocaleDateString('zh-TW')}
                  </div>
                  <div className="flex items-center gap-1 text-primary-400">
                    <Calendar className="w-3.5 h-3.5" />
                    到期日：{new Date(book.dueDate).toLocaleDateString('zh-TW')}
                  </div>
                </div>

                <div className="text-xs text-gray-500">
                  ISBN：{book.isbn}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Action buttons */}
        <div className="space-y-2 pb-4">
          <button
            onClick={handleBorrowMore}
            className="w-full btn btn-primary py-3 flex items-center justify-center gap-2"
          >
            <BookOpen className="w-5 h-5" />
            繼續借書
          </button>
          <button
            onClick={() => navigate('/')}
            className="w-full btn btn-secondary py-3"
          >
            返回首頁
          </button>
        </div>
      </div>
    </div>
  );
}
