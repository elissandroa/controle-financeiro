import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { TrendingUp, TrendingDown, Wallet, Users, Fuel, Receipt } from 'lucide-react';
import { Transaction, Member, getTransactions, getMembers } from './data-service';

interface DashboardOverviewProps {
  hideValues: boolean;
}

export default function DashboardOverview({ hideValues }: DashboardOverviewProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [members, setMembers] = useState<Member[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      console.log('📊 [Dashboard] Carregando dados...');
      const [transactionsData, membersData] = await Promise.all([
        getTransactions(),
        getMembers()
      ]);
      console.log('📊 [Dashboard] Dados carregados:', {
        transactions: transactionsData.length,
        members: membersData.length,
        primeira: transactionsData[0] ? { id: transactionsData[0].id, date: transactionsData[0].date } : null
      });
      setTransactions(transactionsData || []);
      setMembers(membersData || []);
    } catch (error) {
      console.error('❌ [Dashboard] Erro ao carregar dados:', error);
      setTransactions([]);
      setMembers([]);
    }
  };

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const monthlyTransactions = transactions.filter((t) => {
    if (!t || !t.date) return false;
    const date = new Date(t.date);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  });

  const totalIncome = monthlyTransactions
    .filter((t) => t && t.type === 'income')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const totalExpenses = monthlyTransactions
    .filter((t) => t && t.type === 'expense')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const balance = totalIncome - totalExpenses;

  const fuelExpenses = monthlyTransactions
    .filter((t) => t && t.category === 'Abastecimento')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  // As transações já vêm ordenadas (mais recentes primeiro)
  const recentTransactions = transactions.slice(0, 5);

  const formatCurrency = (value: number) => {
    if (hideValues) return '••••••';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Saldo do Mês</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(balance)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {balance >= 0 ? 'Superávit' : 'Déficit'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Receitas</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-green-600">{formatCurrency(totalIncome)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {monthlyTransactions.filter((t) => t.type === 'income').length} transações
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Despesas</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-red-600">{formatCurrency(totalExpenses)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {monthlyTransactions.filter((t) => t.type === 'expense').length} transações
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Abastecimento</CardTitle>
            <Fuel className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{formatCurrency(fuelExpenses)}</div>
            <p className="text-xs text-muted-foreground mt-1">Este mês</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Membros da Família</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {members.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Nenhum membro cadastrado. Vá para a aba "Membros" para adicionar.
                </p>
              ) : (
                members.map((member) => {
                  const memberTransactions = monthlyTransactions.filter(
                    (t) => t.memberId === member.id
                  );
                  const memberIncome = memberTransactions
                    .filter((t) => t.type === 'income')
                    .reduce((sum, t) => sum + t.amount, 0);
                  const memberExpenses = memberTransactions
                    .filter((t) => t.type === 'expense')
                    .reduce((sum, t) => sum + t.amount, 0);

                  return (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="bg-indigo-100 p-2 rounded-full">
                          <Users className="w-4 h-4 text-indigo-600" />
                        </div>
                        <div>
                          <p>{member.name}</p>
                          <p className="text-xs text-muted-foreground">{member.role}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-green-600">
                          +{formatCurrency(memberIncome)}
                        </p>
                        <p className="text-sm text-red-600">
                          -{formatCurrency(memberExpenses)}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Transações Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentTransactions.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Nenhuma transação registrada. Vá para "Transações" para adicionar.
                </p>
              ) : (
                recentTransactions.map((transaction) => {
                  const member = members.find((m) => m.id === transaction.memberId);
                  return (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-full ${
                            transaction.type === 'income'
                              ? 'bg-green-100'
                              : 'bg-red-100'
                          }`}
                        >
                          <Receipt className={`w-4 h-4 ${
                            transaction.type === 'income'
                              ? 'text-green-600'
                              : 'text-red-600'
                          }`} />
                        </div>
                        <div>
                          <p className="text-sm">{transaction.description}</p>
                          <p className="text-xs text-muted-foreground">
                            {member?.name} • {new Date(transaction.date).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>
                      <div
                        className={`${
                          transaction.type === 'income'
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}
                      >
                        {transaction.type === 'income' ? '+' : '-'}
                        {formatCurrency(transaction.amount)}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
