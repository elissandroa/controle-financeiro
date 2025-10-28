import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Button } from './ui/button';
import { LogOut, Eye, EyeOff, Cloud, CloudOff } from 'lucide-react';
import DashboardOverview from './DashboardOverview';
import MembersManagement from './MembersManagement';
import TransactionsView from './TransactionsView';
import Reports from './Reports';
import { getDataMode } from './data-service';

interface DashboardProps {
  onLogout: () => void;
}

export default function Dashboard({ onLogout }: DashboardProps) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [hideValues, setHideValues] = useState(false);
  const dataMode = getDataMode();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1>Controle Financeiro Familiar</h1>
              <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                dataMode === 'api' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
              }`}>
                {dataMode === 'api' ? <Cloud className="w-3 h-3" /> : <CloudOff className="w-3 h-3" />}
                <span className="hidden sm:inline">{dataMode === 'api' ? 'Online' : 'Offline'}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setHideValues(!hideValues)}
              >
                {hideValues ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                <span className="ml-2 hidden sm:inline">
                  {hideValues ? 'Mostrar' : 'Ocultar'}
                </span>
              </Button>
              <Button variant="outline" size="sm" onClick={onLogout}>
                <LogOut className="w-4 h-4" />
                <span className="ml-2 hidden sm:inline">Sair</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="transactions">Transações</TabsTrigger>
            <TabsTrigger value="members">Membros</TabsTrigger>
            <TabsTrigger value="reports">Relatórios</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <DashboardOverview hideValues={hideValues} />
          </TabsContent>

          <TabsContent value="transactions" className="space-y-6">
            <TransactionsView />
          </TabsContent>

          <TabsContent value="members" className="space-y-6">
            <MembersManagement />
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <Reports hideValues={hideValues} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
