import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Transaction, Member, getTransactions, getMembers } from './data-service';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface ReportsProps {
  hideValues: boolean;
}

export default function Reports({ hideValues }: ReportsProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedMember, setSelectedMember] = useState<string>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('6');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [transactionsData, membersData] = await Promise.all([
        getTransactions(),
        getMembers()
      ]);
      setTransactions(transactionsData);
      setMembers(membersData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  };

  const formatCurrency = (value: number) => {
    if (hideValues) return '••••••';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  // Filter transactions
  const filteredTransactions = transactions.filter((t) => {
    if (selectedMember !== 'all' && t.memberId !== selectedMember) return false;
    
    const monthsAgo = parseInt(selectedPeriod);
    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - monthsAgo);
    
    return new Date(t.date) >= cutoffDate;
  });

  // Monthly data
  const monthlyData = [];
  const monthsToShow = parseInt(selectedPeriod);
  for (let i = monthsToShow - 1; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const month = date.getMonth();
    const year = date.getFullYear();
    
    const monthTransactions = filteredTransactions.filter((t) => {
      const tDate = new Date(t.date);
      return tDate.getMonth() === month && tDate.getFullYear() === year;
    });
    
    const income = monthTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expenses = monthTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    monthlyData.push({
      month: date.toLocaleDateString('pt-BR', { month: 'short' }),
      Receitas: income,
      Despesas: expenses,
      Saldo: income - expenses,
    });
  }

  // Category data
  const categoryMap: { [key: string]: number } = {};
  filteredTransactions
    .filter((t) => t.type === 'expense')
    .forEach((t) => {
      categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount;
    });
  
  const categoryData = Object.entries(categoryMap).map(([name, value]) => ({
    name,
    value,
  }));

  const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

  // Member performance
  const memberPerformance = members.map((member) => {
    const memberTransactions = filteredTransactions.filter((t) => t.memberId === member.id);
    const income = memberTransactions.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expenses = memberTransactions.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    
    return {
      name: member.name,
      Receitas: income,
      Despesas: expenses,
      Saldo: income - expenses,
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <h2>Relatórios e Análises</h2>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Select value={selectedMember} onValueChange={setSelectedMember}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Todos os membros" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os membros</SelectItem>
              {members.map((member) => (
                <SelectItem key={member.id} value={member.id}>
                  {member.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3">Últimos 3 meses</SelectItem>
              <SelectItem value="6">Últimos 6 meses</SelectItem>
              <SelectItem value="12">Último ano</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Total de Receitas</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-green-600">
              {formatCurrency(
                filteredTransactions
                  .filter((t) => t.type === 'income')
                  .reduce((sum, t) => sum + t.amount, 0)
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Total de Despesas</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-red-600">
              {formatCurrency(
                filteredTransactions
                  .filter((t) => t.type === 'expense')
                  .reduce((sum, t) => sum + t.amount, 0)
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Saldo do Período</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl ${
              filteredTransactions.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0) -
              filteredTransactions.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0) >= 0
                ? 'text-green-600'
                : 'text-red-600'
            }`}>
              {formatCurrency(
                filteredTransactions.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0) -
                filteredTransactions.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Evolução Mensal</CardTitle>
        </CardHeader>
        <CardContent>
          {monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis hide={hideValues} />
                <Tooltip 
                  formatter={(value: number) => hideValues ? '••••••' : formatCurrency(value)}
                />
                <Legend />
                <Bar dataKey="Receitas" fill="#10b981" />
                <Bar dataKey="Despesas" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-muted-foreground py-12">
              Nenhum dado disponível para o período selecionado
            </p>
          )}
        </CardContent>
      </Card>

      {/* Category Distribution and Member Performance */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Despesas por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      hideValues ? name : `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => hideValues ? '••••••' : formatCurrency(value)}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-muted-foreground py-12">
                Nenhuma despesa registrada
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Desempenho por Membro</CardTitle>
          </CardHeader>
          <CardContent>
            {memberPerformance.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={memberPerformance} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" hide={hideValues} />
                  <YAxis dataKey="name" type="category" width={100} />
                  <Tooltip 
                    formatter={(value: number) => hideValues ? '••••••' : formatCurrency(value)}
                  />
                  <Legend />
                  <Bar dataKey="Receitas" fill="#10b981" />
                  <Bar dataKey="Despesas" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-muted-foreground py-12">
                Nenhum membro cadastrado
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
