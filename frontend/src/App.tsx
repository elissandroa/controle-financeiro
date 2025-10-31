import { useState, useEffect } from 'react';
import LoginScreen from './components/LoginScreen';
import Dashboard from './components/Dashboard';
import { ResetPasswordScreen } from './components/ResetPasswordScreen';
import { Toaster } from './components/ui/sonner';
import { isAuthenticated as checkAuth } from './components/auth-service';

type AppScreen = 'login' | 'dashboard' | 'reset-password';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('login');
  const [resetToken, setResetToken] = useState<string | null>(null);

  useEffect(() => {
    // Verifica se é uma URL de reset de senha
    const path = window.location.pathname;
    console.log('[App] Pathname atual:', path);
    
    // Aceita uma ou mais barras após /recover-password (exemplo: /recover-password//token ou /recover-password/token)
    const resetMatch = path.match(/(?:\/controle-financeiro)?\/recover-password\/([^/]+)/);
    
    if (resetMatch) {
      const token = resetMatch[1];
      console.log('[App] Token de recuperação detectado:', token);
      setResetToken(token);
      setCurrentScreen('reset-password');
      setIsInitialized(true);
      return;
    }

    // Verifica se o usuário já está autenticado
    const authenticated = checkAuth();
    console.log('[App] Usuário autenticado?', authenticated);
    setIsAuthenticated(authenticated);
    setCurrentScreen(authenticated ? 'dashboard' : 'login');
    setIsInitialized(true);
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
    setCurrentScreen('dashboard');
    window.history.pushState({}, '', '/');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentScreen('login');
    window.history.pushState({}, '', '/');
  };

  const handleResetSuccess = () => {
    setCurrentScreen('login');
    setResetToken(null);
    window.history.pushState({}, '', '/');
  };

  const handleResetCancel = () => {
    setCurrentScreen('login');
    setResetToken(null);
    window.history.pushState({}, '', '/');
  };

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mb-4"></div>
          <p className="text-gray-600">Inicializando aplicação...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {currentScreen === 'reset-password' && resetToken ? (
        <ResetPasswordScreen
          token={resetToken}
          onSuccess={handleResetSuccess}
          onCancel={handleResetCancel}
        />
      ) : !isAuthenticated ? (
        <LoginScreen onLogin={handleLogin} />
      ) : (
        <Dashboard onLogout={handleLogout} />
      )}
      <Toaster />
    </>
  );
}
