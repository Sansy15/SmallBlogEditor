import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { EditorPage } from './pages/EditorPage';
import { AuthPage } from './pages/AuthPage';
import { useAuthStore } from './store/useAuthStore';

export default function App() {
  const token = useAuthStore((s) => s.token);

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/auth"
          element={token ? <Navigate to="/" replace /> : <AuthPage />}
        />
        <Route
          path="/"
          element={token ? <EditorPage /> : <Navigate to="/auth" replace />}
        />
        <Route
          path="*"
          element={<Navigate to={token ? '/' : '/auth'} replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}
