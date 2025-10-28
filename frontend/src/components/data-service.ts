import { membersApi, transactionsApi, categoriesApi, ApiMember, ApiTransaction, ApiCategory, checkApiAvailability, isApiAvailable } from './api-service';

// Interfaces do frontend (mantém compatibilidade)
export interface Member {
  id: string;
  name: string;
  role: string;
  createdAt: string;
}

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  date: string;
  memberId: string;
}

// Keys do localStorage
const MEMBERS_KEY = 'financialApp_members';
const TRANSACTIONS_KEY = 'financialApp_transactions';
const API_MODE_KEY = 'financialApp_apiMode';

// Estado da API
let useApiMode = false;

// Inicializa e verifica modo API
export async function initializeDataService(): Promise<boolean> {
  const apiAvailable = await checkApiAvailability();
  useApiMode = apiAvailable;
  localStorage.setItem(API_MODE_KEY, apiAvailable ? 'api' : 'local');
  return apiAvailable;
}

export function getDataMode(): 'api' | 'local' {
  return useApiMode ? 'api' : 'local';
}

// Cache local para categorias
let categoriesCache: ApiCategory[] = [];
let categoriesLoaded = false;

// Função auxiliar para carregar categorias
async function loadCategories(): Promise<void> {
  if (!categoriesLoaded && useApiMode) {
    try {
      categoriesCache = await categoriesApi.getAll();
      categoriesLoaded = true;
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
      categoriesCache = [];
    }
  }
}

// Função para obter ID da categoria pelo nome
async function getCategoryIdByName(name: string): Promise<number> {
  await loadCategories();
  const category = categoriesCache.find(c => c.name === name);
  if (category) {
    return category.id;
  }
  
  // Se não encontrar, cria uma nova categoria
  try {
    const newCategory = await categoriesApi.create(name);
    categoriesCache.push(newCategory);
    return newCategory.id;
  } catch (error) {
    console.error('Erro ao criar categoria:', error);
    return 1; // Fallback para categoria padrão
  }
}

// Função para obter nome da categoria pelo ID
async function getCategoryNameById(id: number): Promise<string> {
  await loadCategories();
  const category = categoriesCache.find(c => c.id === id);
  return category ? category.name : 'Outros';
}

// Conversores API -> Frontend
function apiMemberToMember(apiMember: ApiMember): Member {
  return {
    id: apiMember.id.toString(),
    name: apiMember.name,
    role: apiMember.role,
    createdAt: new Date().toISOString(),
  };
}

async function apiTransactionToTransaction(apiTransaction: ApiTransaction): Promise<Transaction> {
  const categoryName = apiTransaction.category.name || await getCategoryNameById(apiTransaction.category.id);
  
  return {
    id: apiTransaction.id.toString(),
    type: apiTransaction.transactionType === 'INCOME' ? 'income' : 'expense',
    amount: apiTransaction.amount,
    category: categoryName,
    description: apiTransaction.description,
    date: apiTransaction.date,
    memberId: apiTransaction.memberId.toString(),
  };
}

// ==================== MEMBROS ====================

// LocalStorage Members
function getMembersFromLocal(): Member[] {
  const data = localStorage.getItem(MEMBERS_KEY);
  return data ? JSON.parse(data) : [];
}

function saveMemberToLocal(member: Omit<Member, 'id' | 'createdAt'>): Member {
  const members = getMembersFromLocal();
  const newMember: Member = {
    ...member,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
  };
  members.push(newMember);
  localStorage.setItem(MEMBERS_KEY, JSON.stringify(members));
  return newMember;
}

function updateMemberInLocal(id: string, updates: Partial<Member>): void {
  const members = getMembersFromLocal();
  const index = members.findIndex((m) => m.id === id);
  if (index !== -1) {
    members[index] = { ...members[index], ...updates };
    localStorage.setItem(MEMBERS_KEY, JSON.stringify(members));
  }
}

function deleteMemberFromLocal(id: string): void {
  const members = getMembersFromLocal().filter((m) => m.id !== id);
  localStorage.setItem(MEMBERS_KEY, JSON.stringify(members));
}

// API Members
export async function getMembers(): Promise<Member[]> {
  if (useApiMode) {
    try {
      const apiMembers = await membersApi.getAll();
      return apiMembers.map(apiMemberToMember);
    } catch (error) {
      console.error('Erro ao buscar membros da API:', error);
      // Fallback para localStorage
      return getMembersFromLocal();
    }
  }
  return getMembersFromLocal();
}

export async function saveMember(member: Omit<Member, 'id' | 'createdAt'>): Promise<Member> {
  if (useApiMode) {
    try {
      const apiMember = await membersApi.create(member.name, member.role);
      return apiMemberToMember(apiMember);
    } catch (error) {
      console.error('Erro ao salvar membro na API:', error);
      // Fallback para localStorage
      return saveMemberToLocal(member);
    }
  }
  return saveMemberToLocal(member);
}

export async function updateMember(id: string, updates: Partial<Member>): Promise<void> {
  if (useApiMode) {
    try {
      const memberId = parseInt(id);
      const currentMembers = await membersApi.getAll();
      const currentMember = currentMembers.find(m => m.id === memberId);
      
      if (!currentMember) {
        throw new Error('Membro não encontrado');
      }
      
      await membersApi.update(
        memberId,
        updates.name ?? currentMember.name,
        updates.role ?? currentMember.role
      );
      return;
    } catch (error) {
      console.error('Erro ao atualizar membro na API:', error);
      // Fallback para localStorage
      updateMemberInLocal(id, updates);
      return;
    }
  }
  updateMemberInLocal(id, updates);
}

export async function deleteMember(id: string): Promise<void> {
  if (useApiMode) {
    try {
      await membersApi.delete(parseInt(id));
      return;
    } catch (error) {
      console.error('Erro ao deletar membro na API:', error);
      // Fallback para localStorage
      deleteMemberFromLocal(id);
      return;
    }
  }
  deleteMemberFromLocal(id);
}

// ==================== TRANSAÇÕES ====================

// LocalStorage Transactions
function getTransactionsFromLocal(): Transaction[] {
  const data = localStorage.getItem(TRANSACTIONS_KEY);
  return data ? JSON.parse(data) : [];
}

function saveTransactionToLocal(transaction: Omit<Transaction, 'id'>): Transaction {
  const transactions = getTransactionsFromLocal();
  const newTransaction: Transaction = {
    ...transaction,
    id: Date.now().toString(),
  };
  transactions.push(newTransaction);
  localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
  return newTransaction;
}

function updateTransactionInLocal(id: string, updates: Partial<Transaction>): void {
  const transactions = getTransactionsFromLocal();
  const index = transactions.findIndex((t) => t.id === id);
  if (index !== -1) {
    transactions[index] = { ...transactions[index], ...updates };
    localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
  }
}

function deleteTransactionFromLocal(id: string): void {
  const transactions = getTransactionsFromLocal().filter((t) => t.id !== id);
  localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
}

// API Transactions
export async function getTransactions(): Promise<Transaction[]> {
  if (useApiMode) {
    try {
      const apiTransactions = await transactionsApi.getAll();
      console.log('🔄 Converting API transactions:', apiTransactions.length);
      const transactions = await Promise.all(
        apiTransactions.map(apiTransactionToTransaction)
      );
      console.log('✅ Transactions converted:', transactions.length);
      return transactions;
    } catch (error) {
      console.error('❌ Erro ao buscar transações da API:', error);
      // Fallback para localStorage
      return getTransactionsFromLocal();
    }
  }
  return getTransactionsFromLocal();
}

export async function saveTransaction(transaction: Omit<Transaction, 'id'>): Promise<Transaction> {
  if (useApiMode) {
    try {
      const categoryId = await getCategoryIdByName(transaction.category);
      
      const apiTransaction = await transactionsApi.create({
        amount: transaction.amount,
        description: transaction.description,
        date: transaction.date,
        transactionType: transaction.type === 'income' ? 'INCOME' : 'EXPENSE',
        memberId: parseInt(transaction.memberId),
        categoryId: categoryId,
      });
      
      return await apiTransactionToTransaction(apiTransaction);
    } catch (error) {
      console.error('Erro ao salvar transação na API:', error);
      // Fallback para localStorage
      return saveTransactionToLocal(transaction);
    }
  }
  return saveTransactionToLocal(transaction);
}

export async function updateTransaction(id: string, updates: Partial<Transaction>): Promise<void> {
  if (useApiMode) {
    try {
      const transactionId = parseInt(id);
      const currentTransaction = await transactionsApi.getById(transactionId);
      
      if (!currentTransaction) {
        throw new Error('Transação não encontrada');
      }
      
      const categoryId = updates.category 
        ? await getCategoryIdByName(updates.category)
        : currentTransaction.category.id;
      
      await transactionsApi.update(transactionId, {
        amount: updates.amount ?? currentTransaction.amount,
        description: updates.description ?? currentTransaction.description,
        date: updates.date ?? currentTransaction.date,
        transactionType: updates.type 
          ? (updates.type === 'income' ? 'INCOME' : 'EXPENSE')
          : currentTransaction.transactionType,
        memberId: updates.memberId 
          ? parseInt(updates.memberId)
          : currentTransaction.memberId,
        categoryId: categoryId,
      });
      return;
    } catch (error) {
      console.error('Erro ao atualizar transação na API:', error);
      // Fallback para localStorage
      updateTransactionInLocal(id, updates);
      return;
    }
  }
  updateTransactionInLocal(id, updates);
}

export async function deleteTransaction(id: string): Promise<void> {
  if (useApiMode) {
    try {
      await transactionsApi.delete(parseInt(id));
      return;
    } catch (error) {
      console.error('Erro ao deletar transação da API:', error);
      // Fallback para localStorage
      deleteTransactionFromLocal(id);
      return;
    }
  }
  deleteTransactionFromLocal(id);
}

// ==================== CATEGORIAS ====================

export const EXPENSE_CATEGORIES = [
  'Abastecimento',
  'Alimentação',
  'Moradia',
  'Transporte',
  'Saúde',
  'Educação',
  'Lazer',
  'Vestuário',
  'Contas',
  'Outros',
];

export const INCOME_CATEGORIES = [
  'Salário',
  'Freelance',
  'Investimentos',
  'Outros',
];

export async function getCategories(): Promise<string[]> {
  if (useApiMode) {
    await loadCategories();
    return categoriesCache.map(c => c.name);
  }
  return [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];
}

export async function createCategory(name: string): Promise<void> {
  if (useApiMode) {
    try {
      const newCategory = await categoriesApi.create(name);
      categoriesCache.push(newCategory);
    } catch (error) {
      console.error('Erro ao criar categoria:', error);
      throw error;
    }
  }
}
