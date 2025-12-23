import { useRegisterSW } from 'virtual:pwa-register/react';
import { useEffect } from 'react';
import { toast } from 'sonner'; // Ou sua biblioteca de toast
import { RefreshCw } from 'lucide-react';

export function PWAUpdater() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW();

  useEffect(() => {
    if (needRefresh) {
      toast("Nova versão disponível!", {
        description: "Clique no botão para atualizar e ver as novidades.",
        duration: Infinity, // Não fecha sozinho
        action: {
          label: "Atualizar agora",
          onClick: () => updateServiceWorker(true),
        },
        icon: <RefreshCw className="h-4 w-4" />,
      });
    }

    if (offlineReady) {
      toast.success("App pronto para uso offline!");
    }
  }, [needRefresh, offlineReady, updateServiceWorker]);

  return null; // O componente não renderiza nada visual, apenas gerencia os toasts
}