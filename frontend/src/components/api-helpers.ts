// Helpers para conversão entre tipos da API e tipos da aplicação
import { ApiTransaction, ApiMember, transactionsApi, membersApi, categoriesApi } from './api-service';

// Tipos da aplicação
export interface Transaction {
  id: string;
  amount: number;
  description: string;
  date: string;
  type: 'income' | 'expense';
  category: string;
  memberId: string;
  memberName?: string;
}

export interface Member {
  id: string;
  name: string;
  role: string;
}

export interface Category {
  id: string;
  name: string;
}

// Categorias padrão
export const EXPENSE_CATEGORIES = [
  'Alimentação',
  'Transporte',
  'Moradia',
  'Saúde',
  'Educação',
  'Lazer',
  'Outros'
];

export const INCOME_CATEGORIES = [
  'Salário',
  'Freelance',
  'Investimentos',
  'Outros'
];

/**
 * Converte ApiTransaction para Transaction
 */
export function apiTransactionToTransaction(apiTx: ApiTransaction): Transaction {
  return {
    id: String(apiTx.id),
    amount: apiTx.amount,
    description: apiTx.description,
    date: apiTx.date,
    type: apiTx.transactionType === 'INCOME' ? 'income' : 'expense',
    category: apiTx.category?.name || 'Outros',
    memberId: String(apiTx.memberId),
    memberName: apiTx.member?.name,
  };
}

/**
 * Converte ApiMember para Member
 */
export function apiMemberToMember(apiMember: ApiMember): Member {
  return {
    id: String(apiMember.id),
    name: apiMember.name,
    role: apiMember.role,
  };
}

/**
 * Busca todas as transações
 */
export async function getTransactions(): Promise<Transaction[]> {
  const apiTransactions = await transactionsApi.getAll();
  return apiTransactions.map(apiTransactionToTransaction);
}

/**
 * Busca todos os membros
 */
export async function getMembers(): Promise<Member[]> {
  const apiMembers = await membersApi.getAll();
  return apiMembers.map(apiMemberToMember);
}

/**
 * Busca todas as categorias
 */
export async function getCategories(): Promise<Category[]> {
  const apiCategories = await categoriesApi.getAll();
  return apiCategories.map(cat => ({
    id: String(cat.id),
    name: cat.name,
  }));
}

/**
 * Salva uma nova transação
 */
export async function saveTransaction(transaction: Omit<Transaction, 'id'>): Promise<Transaction> {
  // Busca o ID da categoria pelo nome
  const categories = await categoriesApi.getAll();
  const category = categories.find(c => c.name === transaction.category);
  
  if (!category) {
    throw new Error(`Categoria "${transaction.category}" não encontrada`);
  }

  const apiTransaction = await transactionsApi.create({
    amount: transaction.amount,
    description: transaction.description,
    date: transaction.date,
    transactionType: transaction.type === 'income' ? 'INCOME' : 'EXPENSE',
    memberId: parseInt(transaction.memberId),
    categoryId: category.id,
  });

  return apiTransactionToTransaction(apiTransaction);
}

/**
 * Atualiza uma transação existente
 */
export async function updateTransaction(id: string, transaction: Omit<Transaction, 'id'>): Promise<Transaction> {
  // Busca o ID da categoria pelo nome
  const categories = await categoriesApi.getAll();
  const category = categories.find(c => c.name === transaction.category);
  
  if (!category) {
    throw new Error(`Categoria "${transaction.category}" não encontrada`);
  }

  const apiTransaction = await transactionsApi.update(parseInt(id), {
    amount: transaction.amount,
    description: transaction.description,
    date: transaction.date,
    transactionType: transaction.type === 'income' ? 'INCOME' : 'EXPENSE',
    memberId: parseInt(transaction.memberId),
    categoryId: category.id,
  });

  return apiTransactionToTransaction(apiTransaction);
}

/**
 * Deleta uma transação
 */
export async function deleteTransaction(id: string): Promise<void> {
  await transactionsApi.delete(parseInt(id));
}

/**
 * Salva um novo membro
 */
export async function saveMember(member: Omit<Member, 'id'>): Promise<Member> {
  const apiMember = await membersApi.create(member.name, member.role);
  return apiMemberToMember(apiMember);
}

/**
 * Atualiza um membro existente
 */
export async function updateMember(id: string, member: Omit<Member, 'id'>): Promise<Member> {
  const apiMember = await membersApi.update(parseInt(id), member.name, member.role);
  return apiMemberToMember(apiMember);
}

/**
 * Deleta um membro
 */
export async function deleteMember(id: string): Promise<void> {
  await membersApi.delete(parseInt(id));
}
