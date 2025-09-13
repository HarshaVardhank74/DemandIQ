import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ForecastPage from './pages/ForecastPage';
import KeywordAnalysisPage from './pages/KeywordAnalysisPage';
import AuthLayout from './components/AuthLayout';
import { AnimatePresence } from 'framer-motion';

function MainLayout({ children }) {
  return (
    <div style={{ display: 'flex' }}>
      <Navbar />
      <main style={{ flexGrow: 1, padding: '2.5rem', marginLeft: '280px' }}>
        <AnimatePresence mode="wait">
          {children}
        </AnimatePresence>
      </main>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            
            <Route path="/login" element={<AuthLayout><LoginPage /></AuthLayout>} />
            <Route path="/register" element={<AuthLayout><RegisterPage /></AuthLayout>} />

            <Route path="/dashboard" element={<ProtectedRoute><MainLayout><DashboardPage /></MainLayout></ProtectedRoute>} />
            <Route path="/forecast" element={<ProtectedRoute><MainLayout><ForecastPage /></MainLayout></ProtectedRoute>} />
            <Route path="/analysis" element={<ProtectedRoute><MainLayout><KeywordAnalysisPage /></MainLayout></ProtectedRoute>} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;