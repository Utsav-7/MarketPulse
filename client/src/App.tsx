import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
// On GitHub Pages the app is served from /<repo-name>/ — pick up the base from Vite
const BASE = import.meta.env.BASE_URL ?? '/';
import { Toaster } from 'sonner';
import { AuthProvider } from './context/AuthContext';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { CreateUserPage } from './pages/CreateUserPage';
import { ProtectedRoute } from './components/ProtectedRoute';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter basename={BASE}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/create-user" element={<CreateUserPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster
        position="top-right"
        duration={2000}
        toastOptions={{
          style: {
            background: '#1e293b',
            color: '#f1f5f9',
            border: '1px solid #334155',
          },
        }}
      />
    </AuthProvider>
  );
}
