import { BrowserRouter, Routes, Route, NavLink, Navigate, Link, useLocation } from 'react-router-dom';
import PlayersPage from './pages/PlayersPage';
import SessionPage from './pages/SessionPage';
import HistoryPage from './pages/HistoryPage';
import SettingsPage from './pages/SettingsPage';
import { LoginPage } from './pages/LoginPage';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Users, PlaySquare, Clock, Settings, LogOut } from 'lucide-react';

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div className="p-8 text-center text-gray-500">Đang tải...</div>;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  return children;
}

function MainLayout() {
  const { logout } = useAuth();

  return (
    <div className="min-h-screen pb-20">
      <header className="bg-white/90 backdrop-blur shadow-sm sticky top-0 z-10 border-b border-teal-50">
        <div className="px-4 py-3 flex items-center justify-center relative">
          <Link to="/" className="flex items-center gap-2.5">
            <img
              src="/logo.png?v=2"
              alt="Cầu Lông 360°"
              className="h-12 w-12 object-contain"
            />
            <h1 className="text-3xl font-black text-primary tracking-widest drop-shadow-sm">
              CẦU LÔNG 360°
            </h1>
          </Link>
          <button onClick={logout} className="text-gray-500 hover:text-red-600 transition-colors absolute right-4" title="Đăng xuất">
            <LogOut size={20} />
          </button>
        </div>
      </header>

      <main className="p-4 max-w-md mx-auto">
        <Routes>
          <Route path="/" element={<SessionPage />} />
          <Route path="/session" element={<Navigate to="/" replace />} />
          <Route path="/players" element={<PlayersPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </main>

      <nav className="fixed bottom-0 w-full bg-white border-t border-teal-100 flex justify-around p-3 z-10 max-w-md mx-auto left-0 right-0 rounded-t-2xl shadow-lg">
        <NavLink to="/" className={({ isActive }) => `flex flex-col items-center ${isActive ? 'text-primary font-bold' : 'text-gray-400'}`}>
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
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/*"
            element={
              <RequireAuth>
                <MainLayout />
              </RequireAuth>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
