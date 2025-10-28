import { useState, useEffect } from 'react';
import LoginScreen from './components/LoginScreen';
import Dashboard from './components/Dashboard';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner@2.0.3';
import { initializeDataService, getDataMode } from './components/data-service';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const init = async () => {
      const auth = localStorage.getItem('financialApp_authenticated');
      if (auth === 'true') {
        setIsAuthenticated(true);
      }
      
      // Inicializa o serviço de dados
      const apiAvailable = await initializeDataService();
      setIsInitialized(true);
      
      // Mostra aviso sobre o modo de dados
      if (!apiAvailable) {
        toast.info('Modo Offline', {
          description: 'API não disponível. Usando armazenamento local. Inicie o backend Spring Boot em http://localhost:8080 para usar a API.',
          duration: 5000,
        });
      } else {
        toast.success('Modo Online', {
          description: 'Conectado à API Spring Boot.',
          duration: 3000,
        });
      }
    };
    
    init();
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
    localStorage.setItem('financialApp_authenticated', 'true');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('financialApp_authenticated');
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
      {!isAuthenticated ? (
        <LoginScreen onLogin={handleLogin} />
      ) : (
        <Dashboard onLogout={handleLogout} />
      )}
      <Toaster />
    </>
  );
}
