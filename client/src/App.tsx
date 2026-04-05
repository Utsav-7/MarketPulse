import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
// On GitHub Pages the app is served from /<repo-name>/ — pick up the base from Vite
const BASE = import.meta.env.BASE_URL ?? '/';
import { Toaster } from 'sonner';
import { AuthProvider } from './context/AuthContext';
import { DashboardPage } from './pages/DashboardPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter basename={BASE}>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
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
