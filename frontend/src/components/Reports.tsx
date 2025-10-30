import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectSeparator, SelectTrigger, SelectValue } from './ui/select';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Transaction, Member, getTransactions, getMembers } from './api-helpers';
import { TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';

interface ReportsProps {
  hideValues: boolean;
}

export default function Reports({ hideValues }: ReportsProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedMember, setSelectedMember] = useState<string>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('6');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [transactionsData, membersData] = await Promise.all([
        getTransactions(),
        getMembers()
      ]);
      setTransactions(transactionsData || []);
      setMembers(membersData || []);
    } catch (error) {
      setTransactions([]);
      setMembers([]);
    } finally {
      setIsLoading(false);
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
    if (!t || !t.date) {
      return false;
    }
    
    if (selectedMember !== 'all' && t.memberId !== selectedMember) return false;
    
    // Se "all" está selecionado, retorna todas as transações
    if (selectedPeriod === 'all') return true;
    
    const monthsAgo = parseInt(selectedPeriod);
    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - monthsAgo);
    
    const transactionDate = new Date(t.date);
    return transactionDate >= cutoffDate;
  });

  // Calcula totais uma única vez para reuso
  const totalIncome = filteredTransactions
    .filter((t) => t && t.type === 'income')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const totalExpenses = filteredTransactions
    .filter((t) => t && t.type === 'expense')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const balance = totalIncome - totalExpenses;

  // Calcula o número real de meses com transações para médias mais precisas
  const getActualMonthsCount = (): number => {
    if (filteredTransactions.length === 0) return 1;
    
    if (selectedPeriod === 'all') {
      const dates = filteredTransactions.map(t => new Date(t.date));
      const oldestDate = new Date(Math.min(...dates.map(d => d.getTime())));
      const newestDate = new Date(Math.max(...dates.map(d => d.getTime())));
      return Math.max(
        1,
        (newestDate.getFullYear() - oldestDate.getFullYear()) * 12 + 
        (newestDate.getMonth() - oldestDate.getMonth()) + 1
      );
    }
    
    return parseInt(selectedPeriod) || 1;
  };

  const actualMonths = getActualMonthsCount();
  const avgMonthlyIncome = totalIncome / actualMonths;
  const avgMonthlyExpenses = totalExpenses / actualMonths;

  // Monthly data
  const monthlyData = [];
  
  // Se "all" está selecionado, calcula o número de meses baseado nas transações
  let monthsToShow: number;
  if (selectedPeriod === 'all' && filteredTransactions.length > 0) {
    const dates = filteredTransactions.map(t => new Date(t.date));
    const oldestDate = new Date(Math.min(...dates.map(d => d.getTime())));
    const now = new Date();
    monthsToShow = Math.max(
      1,
      (now.getFullYear() - oldestDate.getFullYear()) * 12 + 
      (now.getMonth() - oldestDate.getMonth()) + 1
    );
    // Limita a 60 meses (5 anos) para não sobrecarregar o gráfico
    monthsToShow = Math.min(monthsToShow, 60);
  } else {
    monthsToShow = parseInt(selectedPeriod) || 6;
  }
  
  for (let i = monthsToShow - 1; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const month = date.getMonth();
    const year = date.getFullYear();
    
    const monthTransactions = filteredTransactions.filter((t) => {
      if (!t || !t.date) return false;
      const tDate = new Date(t.date);
      return tDate.getMonth() === month && tDate.getFullYear() === year;
    });
    
    const income = monthTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
    
    const expenses = monthTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
    
    // Formata o mês/ano para períodos longos
    const monthLabel = monthsToShow > 12
      ? date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })
      : date.toLocaleDateString('pt-BR', { month: 'short' });
    
    monthlyData.push({
      month: monthLabel,
      Receitas: income,
      Despesas: expenses,
      Saldo: income - expenses,
    });
  }

  // Category data - Expenses
  const categoryMap: { [key: string]: number } = {};
  filteredTransactions
    .filter((t) => t && t.type === 'expense' && t.category)
    .forEach((t) => {
      const category = t.category || 'Outros';
      const amount = Number(t.amount) || 0;
      categoryMap[category] = (categoryMap[category] || 0) + amount;
    });
  
  const categoryData = Object.entries(categoryMap)
    .map(([name, value]) => ({
      name,
      value,
      percentage: totalExpenses > 0 ? (value / totalExpenses) * 100 : 0,
    }))
    .filter(item => item.value > 0)
    .sort((a, b) => b.value - a.value);

  // Category data - Income
  const incomeCategoryMap: { [key: string]: number } = {};
  filteredTransactions
    .filter((t) => t && t.type === 'income' && t.category)
    .forEach((t) => {
      const category = t.category || 'Outros';
      const amount = Number(t.amount) || 0;
      incomeCategoryMap[category] = (incomeCategoryMap[category] || 0) + amount;
    });
  
  const incomeCategoryData = Object.entries(incomeCategoryMap)
    .map(([name, value]) => ({
      name,
      value,
      percentage: totalIncome > 0 ? (value / totalIncome) * 100 : 0,
    }))
    .filter(item => item.value > 0)
    .sort((a, b) => b.value - a.value);

  const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

  // Member performance
  const memberPerformance = members
    .map((member) => {
      if (!member || !member.id) return null;
      
      const memberTransactions = filteredTransactions.filter((t) => 
        t && t.memberId === member.id
      );
      const income = memberTransactions
        .filter((t) => t.type === 'income')
        .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
      const expenses = memberTransactions
        .filter((t) => t.type === 'expense')
        .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
      
      return {
        name: member.name,
        Receitas: income,
        Despesas: expenses,
        Saldo: income - expenses,
      };
    })
    .filter(item => item !== null);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-2">
          <h2>Relatórios e Análises</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={loadData}
            disabled={isLoading}
            title="Atualizar dados"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
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
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Último mês</SelectItem>
              <SelectItem value="2">Últimos 2 meses</SelectItem>
              <SelectItem value="3">Últimos 3 meses</SelectItem>
              <SelectSeparator />
              <SelectItem value="6">Últimos 6 meses</SelectItem>
              <SelectItem value="9">Últimos 9 meses</SelectItem>
              <SelectItem value="12">Último ano</SelectItem>
              <SelectSeparator />
              <SelectItem value="18">Últimos 18 meses</SelectItem>
              <SelectItem value="24">Últimos 2 anos</SelectItem>
              <SelectItem value="36">Últimos 3 anos</SelectItem>
              <SelectSeparator />
              <SelectItem value="all">Todo o período</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Info Badge */}
      {filteredTransactions.length > 0 && (
        <div className="bg-muted/50 rounded-lg px-4 py-3 text-sm text-muted-foreground">
          <span className="font-medium">
            {filteredTransactions.length} transação{filteredTransactions.length !== 1 ? 'ões' : ''} 
          </span>
          {' '}analisada{filteredTransactions.length !== 1 ? 's' : ''} no período selecionado
          {selectedMember !== 'all' && members.find(m => m.id === selectedMember) && (
            <span> para <span className="font-medium">{members.find(m => m.id === selectedMember)?.name}</span></span>
          )}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Total de Receitas</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-green-600">
              {formatCurrency(totalIncome)}
            </div>
            {parseInt(selectedPeriod) > 1 || selectedPeriod === 'all' ? (
              <p className="text-xs text-muted-foreground mt-1">
                Média: {formatCurrency(avgMonthlyIncome)}/mês
              </p>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Total de Despesas</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-red-600">
              {formatCurrency(totalExpenses)}
            </div>
            {parseInt(selectedPeriod) > 1 || selectedPeriod === 'all' ? (
              <p className="text-xs text-muted-foreground mt-1">
                Média: {formatCurrency(avgMonthlyExpenses)}/mês
              </p>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Saldo do Período</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(balance)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Trend */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle>Evolução Mensal</CardTitle>
          {monthlyData.length > 24 && (
            <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
              {monthlyData.length} meses
            </span>
          )}
        </CardHeader>
        <CardContent>
          {monthlyData.length > 0 ? (
            <>
              {monthlyData.length > 24 && (
                <p className="text-xs text-muted-foreground mb-3 text-center">
                  👉 Arraste horizontalmente para ver todos os meses
                </p>
              )}
              <div className={monthlyData.length > 24 ? 'overflow-x-auto' : ''}>
                <ResponsiveContainer 
                width={monthlyData.length > 24 ? monthlyData.length * 50 : '100%'} 
                height={monthlyData.length > 18 ? 400 : 300}
              >
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="month" 
                    angle={monthlyData.length > 12 ? -45 : 0}
                    textAnchor={monthlyData.length > 12 ? "end" : "middle"}
                    height={monthlyData.length > 12 ? 80 : 30}
                    interval={0}
                  />
                  <YAxis hide={hideValues} />
                  <Tooltip 
                    formatter={(value: number) => hideValues ? '••••••' : formatCurrency(value)}
                  />
                  <Legend />
                  <Bar dataKey="Receitas" fill="#10b981" />
                  <Bar dataKey="Despesas" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
              </div>
            </>
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

      {/* Values by Category */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Expense Categories Table */}
        <Card>
          <CardHeader>
            <CardTitle>Valores por Categoria - Despesas</CardTitle>
          </CardHeader>
          <CardContent>
            {categoryData.length > 0 ? (
              <div className="space-y-3">
                {categoryData.map((category, index) => (
                  <div
                    key={category.name}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="font-medium">{category.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-red-600">
                        {formatCurrency(category.value)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {hideValues ? '••%' : `${category.percentage.toFixed(1)}%`}
                      </div>
                    </div>
                  </div>
                ))}
                <div className="flex items-center justify-between p-3 bg-gray-100 rounded-lg border-t-2 border-gray-300 mt-4">
                  <span className="font-bold">Total</span>
                  <span className="text-red-600 font-bold">
                    {formatCurrency(totalExpenses)}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-12">
                Nenhuma despesa registrada
              </p>
            )}
          </CardContent>
        </Card>

        {/* Income Categories Table */}
        <Card>
          <CardHeader>
            <CardTitle>Valores por Categoria - Receitas</CardTitle>
          </CardHeader>
          <CardContent>
            {incomeCategoryData.length > 0 ? (
              <div className="space-y-3">
                {incomeCategoryData.map((category, index) => (
                  <div
                    key={category.name}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="font-medium">{category.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-green-600">
                        {formatCurrency(category.value)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {hideValues ? '••%' : `${category.percentage.toFixed(1)}%`}
                      </div>
                    </div>
                  </div>
                ))}
                <div className="flex items-center justify-between p-3 bg-gray-100 rounded-lg border-t-2 border-gray-300 mt-4">
                  <span className="font-bold">Total</span>
                  <span className="text-green-600 font-bold">
                    {formatCurrency(totalIncome)}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-12">
                Nenhuma receita registrada
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
