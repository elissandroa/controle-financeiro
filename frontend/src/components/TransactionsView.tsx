import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from './ui/pagination';
import { Plus, Trash2, TrendingUp, TrendingDown, Calendar, Filter, Pencil } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import {
  Transaction,
  Member,
  getTransactions,
  getMembers,
  saveTransaction,
  updateTransaction,
  deleteTransaction,
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
} from './api-helpers';

export default function TransactionsView() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [transactionType, setTransactionType] = useState<'income' | 'expense'>('expense');
  const [currentPage, setCurrentPage] = useState(1);
  const [filterMemberId, setFilterMemberId] = useState<string>('all');
  const [filterMonth, setFilterMonth] = useState<string>('all');
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const itemsPerPage = 10;
  const [formData, setFormData] = useState({
    amount: '',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    memberId: '',
  });

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
      setCurrentPage(1);
    } catch (error) {
      toast.error('Erro ao carregar dados');
    }
  };

  const handleSubmit = async () => {
    if (!formData.amount || !formData.category || !formData.description || !formData.memberId) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Digite um valor válido');
      return;
    }

    try {
      if (editingTransaction) {
        // Editando transação existente
        await updateTransaction(editingTransaction.id, {
          type: transactionType,
          amount,
          category: formData.category,
          description: formData.description,
          date: formData.date,
          memberId: formData.memberId,
        });
        toast.success('Transação atualizada!');
      } else {
        // Criando nova transação
        const transaction: Omit<Transaction, 'id'> = {
          type: transactionType,
          amount,
          category: formData.category,
          description: formData.description,
          date: formData.date,
          memberId: formData.memberId,
        };
        await saveTransaction(transaction);
        toast.success(
          transactionType === 'income' ? 'Receita adicionada!' : 'Despesa adicionada!'
        );
      }
      await loadData();
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error(editingTransaction ? 'Erro ao atualizar transação' : 'Erro ao salvar transação');
    }
  };

  const resetForm = () => {
    setFormData({
      amount: '',
      category: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      memberId: '',
    });
    setEditingTransaction(null);
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setTransactionType(transaction.type);
    setFormData({
      amount: transaction.amount.toString(),
      category: transaction.category,
      description: transaction.description,
      date: transaction.date,
      memberId: transaction.memberId,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta transação?')) {
      try {
        await deleteTransaction(id);
        toast.success('Transação excluída!');
        await loadData();
      } catch (error) {
        toast.error('Erro ao excluir transação');
      }
    }
  };

  // As transações já vêm ordenadas do serviço (mais recentes primeiro)
  // Não é necessário ordenar novamente

  // Get available months for filter
  const availableMonths = Array.from(
    new Set(
      transactions.map(t => {
        const date = new Date(t.date);
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      })
    )
  ).sort((a, b) => b.localeCompare(a));

  // Apply filters
  const filteredTransactions = transactions.filter(transaction => {
    const memberMatch = filterMemberId === 'all' || transaction.memberId === filterMemberId;
    const monthMatch = filterMonth === 'all' || (() => {
      const date = new Date(transaction.date);
      const transactionMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      return transactionMonth === filterMonth;
    })();
    return memberMatch && monthMatch;
  });

  // Pagination on filtered transactions
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedTransactions = filteredTransactions.slice(startIndex, endIndex);

  // Group paginated transactions by month for display
  const groupedByMonth = paginatedTransactions.reduce((acc, transaction) => {
    const date = new Date(transaction.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const monthName = date.toLocaleDateString('pt-BR', { year: 'numeric', month: 'long' });
    
    if (!acc[monthKey]) {
      acc[monthKey] = {
        monthName,
        transactions: [],
      };
    }
    acc[monthKey].transactions.push(transaction);
    return acc;
  }, {} as Record<string, { monthName: string; transactions: Transaction[] }>);

  const currentMonthGroups = Object.entries(groupedByMonth).sort(([a], [b]) => b.localeCompare(a));

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const categories = transactionType === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2>Transações</h2>
        <div className="flex gap-2">
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Nova Transação
              </Button>
            </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingTransaction ? 'Editar Transação' : 'Adicionar Transação'}
              </DialogTitle>
              <DialogDescription>
                {editingTransaction 
                  ? 'Atualize os campos da transação' 
                  : 'Preencha os campos para registrar uma nova receita ou despesa'}
              </DialogDescription>
            </DialogHeader>
            <Tabs value={transactionType} onValueChange={(v) => setTransactionType(v as any)}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="expense">Despesa</TabsTrigger>
                <TabsTrigger value="income">Receita</TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="member">Membro</Label>
                <Select value={formData.memberId} onValueChange={(v) => setFormData({ ...formData, memberId: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um membro" />
                  </SelectTrigger>
                  <SelectContent>
                    {members.map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Categoria</Label>
                <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Input
                  id="description"
                  placeholder="Descrição da transação"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Valor (R$)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Data</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSubmit} className="flex-1">
                  {editingTransaction ? 'Atualizar' : 'Adicionar'}
                </Button>
                <Button onClick={() => setIsDialogOpen(false)} variant="outline" className="flex-1">
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de Transações</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center justify-between text-xs text-muted-foreground bg-muted/50 px-3 py-2 rounded-md">
              <span>📅 Ordenado por mais recentes primeiro</span>
              <span>{filteredTransactions.length} transação{filteredTransactions.length !== 1 ? 'ões' : ''}</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Filtrar por Membro
                </Label>
              <Select 
                value={filterMemberId} 
                onValueChange={(v) => {
                  setFilterMemberId(v);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger>
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
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Filtrar por Mês
              </Label>
              <Select 
                value={filterMonth} 
                onValueChange={(v) => {
                  setFilterMonth(v);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos os meses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os meses</SelectItem>
                  {availableMonths.map((month) => {
                    const [year, monthNum] = month.split('-');
                    const date = new Date(parseInt(year), parseInt(monthNum) - 1);
                    const monthName = date.toLocaleDateString('pt-BR', { year: 'numeric', month: 'long' });
                    return (
                      <SelectItem key={month} value={month}>
                        {monthName.charAt(0).toUpperCase() + monthName.slice(1)}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            </div>
          </div>

          {/* Transaction Count */}
          {transactions.length > 0 && (
            <div className="mb-4 text-sm text-muted-foreground">
              Mostrando {filteredTransactions.length > 0 ? startIndex + 1 : 0} - {Math.min(endIndex, filteredTransactions.length)} de {filteredTransactions.length} transação(ões)
            </div>
          )}

          {/* Transaction List */}
          {transactions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                Nenhuma transação registrada. Clique em "Nova Transação" para começar.
              </p>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                Nenhuma transação encontrada com os filtros aplicados.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {currentMonthGroups.map(([monthKey, { monthName, transactions }]) => {
                const monthTotal = transactions.reduce((sum, t) => {
                  return sum + (t.type === 'income' ? t.amount : -t.amount);
                }, 0);

                return (
                  <div key={monthKey} className="space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <h3 className="capitalize">{monthName}</h3>
                      </div>
                      <span className={`${monthTotal >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {monthTotal >= 0 ? '+' : ''}
                        {formatCurrency(monthTotal)}
                      </span>
                    </div>

                    <div className="space-y-2">
                      {transactions.map((transaction) => {
                        const member = members.find((m) => m.id === transaction.memberId);
                        return (
                          <div
                            key={transaction.id}
                            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <div className="flex items-center gap-4 flex-1">
                              <div
                                className={`p-2 rounded-full ${
                                  transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                                }`}
                              >
                                {transaction.type === 'income' ? (
                                  <TrendingUp className="w-5 h-5 text-green-600" />
                                ) : (
                                  <TrendingDown className="w-5 h-5 text-red-600" />
                                )}
                              </div>
                              <div className="flex-1">
                                <p>{transaction.description}</p>
                                <div className="flex flex-wrap gap-2 mt-1">
                                  <span className="text-xs text-muted-foreground">
                                    {transaction.category}
                                  </span>
                                  <span className="text-xs text-muted-foreground">•</span>
                                  <span className="text-xs text-muted-foreground">
                                    {member?.name}
                                  </span>
                                  <span className="text-xs text-muted-foreground">•</span>
                                  <span className="text-xs text-muted-foreground">
                                    {new Date(transaction.date).toLocaleDateString('pt-BR')}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span
                                className={`${
                                  transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                                }`}
                              >
                                {transaction.type === 'income' ? '+' : '-'}
                                {formatCurrency(transaction.amount)}
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(transaction)}
                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                              >
                                <Pencil className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(transaction.id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {totalPages > 1 && (
                <Pagination className="mt-6">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => setCurrentPage(page)}
                          isActive={currentPage === page}
                          className="cursor-pointer"
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}

                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
