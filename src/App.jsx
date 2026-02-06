import { Routes, Route } from 'react-router-dom';
import Toolbar from './components/Toolbar/Toolbar';
import Canvas from './components/Canvas/Canvas';
import Sidebar from './components/UI/Sidebar';
import { useAppStore } from './stores/appStore';
import LibraryEntry from './pages/library/LibraryEntry';
import LoginPage from './pages/library/LoginPage';
import CardStatusPage from './pages/library/CardStatusPage';
import ScanPage from './pages/library/ScanPage';
import BorrowRecordsPage from './pages/library/BorrowRecordsPage';

/**
 * Main Application Component
 *
 * Floorplan SVG Pro - Professional floor plan vectorization tool
 * with integrated Library Borrowing System
 */
function App() {
  return (
    <Routes>
      {/* Floorplan tool (original app) */}
      <Route path="/" element={<FloorplanApp />} />

      {/* Library borrowing flow */}
      <Route path="/library" element={<LibraryEntry />} />
      <Route path="/library/login" element={<LoginPage />} />
      <Route path="/library/card-check" element={<CardStatusPage />} />
      <Route path="/library/scan" element={<ScanPage />} />
      <Route path="/library/records" element={<BorrowRecordsPage />} />
    </Routes>
  );
}

/**
 * FloorplanApp - Original floorplan vectorization tool
 */
function FloorplanApp() {
  const darkMode = useAppStore((state) => state.darkMode);

  return (
    <div className={`${darkMode ? 'dark' : ''} h-screen flex flex-col bg-gray-900 text-gray-100`}>
      {/* Top Toolbar */}
      <Toolbar />

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Sidebar */}
        <Sidebar />

        {/* Canvas */}
        <Canvas />
      </div>

      {/* Footer / Status Bar */}
      <StatusBar />
    </div>
  );
}

/**
 * Status Bar Component
 */
function StatusBar() {
  const isProcessing = useAppStore((state) => state.isProcessing);
  const processingProgress = useAppStore((state) => state.processingProgress);
  const processingMessage = useAppStore((state) => state.processingMessage);
  const currentTool = useAppStore((state) => state.currentTool);

  return (
    <div className="bg-gray-800 border-t border-gray-700 px-4 py-2 flex items-center justify-between text-sm">
      <div className="flex items-center gap-4">
        <span className="text-gray-400">
          Tool: <span className="text-gray-200 capitalize">{currentTool.replace('_', ' ')}</span>
        </span>

        {isProcessing && (
          <div className="flex items-center gap-2">
            <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary-500 transition-all duration-300"
                style={{ width: `${processingProgress}%` }}
              />
            </div>
            <span className="text-gray-400">{processingMessage || 'Processing...'}</span>
          </div>
        )}
      </div>

      <div className="text-gray-400 text-xs">
        Floorplan SVG Pro v1.0 | Press{' '}
        <kbd className="px-1 py-0.5 bg-gray-700 rounded">Space</kbd> to pan
      </div>
    </div>
  );
}

export default App;
