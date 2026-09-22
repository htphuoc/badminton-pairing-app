import { BrowserRouter, Routes, Route, NavLink, Navigate, Link } from 'react-router-dom';
import PlayersPage from './pages/PlayersPage';
import SessionPage from './pages/SessionPage';
import HistoryPage from './pages/HistoryPage';
import SettingsPage from './pages/SettingsPage';
import { Users, PlaySquare, Clock, Settings } from 'lucide-react';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen pb-20">
        <header className="bg-white/90 backdrop-blur shadow-sm sticky top-0 z-10 border-b border-teal-50">
          <Link to="/session" className="px-4 py-3 flex items-center justify-center gap-2">
            <img
              src="/logo.jpg"
              alt="Cầu Lông 360°"
              className="h-10 w-10 rounded-full object-cover ring-2 ring-primary/20"
            />
            <h1 className="text-xl font-bold text-primary tracking-wide">
              CẦU LÔNG 360°
            </h1>
          </Link>
        </header>

        <main className="p-4 max-w-md mx-auto">
          <Routes>
            <Route path="/" element={<Navigate to="/session" replace />} />
            <Route path="/players" element={<PlayersPage />} />
            <Route path="/session" element={<SessionPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </main>

        <nav className="fixed bottom-0 w-full bg-white border-t border-teal-100 flex justify-around p-3 z-10 max-w-md mx-auto left-0 right-0 rounded-t-2xl shadow-lg">
          <NavLink to="/session" className={({ isActive }) => `flex flex-col items-center ${isActive ? 'text-primary font-bold' : 'text-gray-400'}`}>
            <PlaySquare size={24} />
            <span className="text-xs mt-1">Sân</span>
          </NavLink>
          <NavLink to="/history" className={({ isActive }) => `flex flex-col items-center ${isActive ? 'text-primary font-bold' : 'text-gray-400'}`}>
            <Clock size={24} />
            <span className="text-xs mt-1">Tổng kết</span>
          </NavLink>
          <NavLink to="/players" className={({ isActive }) => `flex flex-col items-center ${isActive ? 'text-primary font-bold' : 'text-gray-400'}`}>
            <Users size={24} />
            <span className="text-xs mt-1">Thành viên</span>
          </NavLink>
          <NavLink to="/settings" className={({ isActive }) => `flex flex-col items-center ${isActive ? 'text-primary font-bold' : 'text-gray-400'}`}>
            <Settings size={24} />
            <span className="text-xs mt-1">Cài đặt</span>
          </NavLink>
        </nav>
      </div>
    </BrowserRouter>
  );
}
