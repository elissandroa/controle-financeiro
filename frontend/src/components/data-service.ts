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
  fuelData?: {
    liters: number;
    kilometers: number;
    consumption?: number;
  };
}

const MEMBERS_KEY = 'financialApp_members';
const TRANSACTIONS_KEY = 'financialApp_transactions';

// Members
export function getMembers(): Member[] {
  const data = localStorage.getItem(MEMBERS_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveMember(member: Omit<Member, 'id' | 'createdAt'>): Member {
  const members = getMembers();
  const newMember: Member = {
    ...member,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
  };
  members.push(newMember);
  localStorage.setItem(MEMBERS_KEY, JSON.stringify(members));
  return newMember;
}

export function updateMember(id: string, updates: Partial<Member>): void {
  const members = getMembers();
  const index = members.findIndex((m) => m.id === id);
  if (index !== -1) {
    members[index] = { ...members[index], ...updates };
    localStorage.setItem(MEMBERS_KEY, JSON.stringify(members));
  }
}

export function deleteMember(id: string): void {
  const members = getMembers().filter((m) => m.id !== id);
  localStorage.setItem(MEMBERS_KEY, JSON.stringify(members));
}

// Transactions
export function getTransactions(): Transaction[] {
  const data = localStorage.getItem(TRANSACTIONS_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveTransaction(transaction: Omit<Transaction, 'id'>): Transaction {
  const transactions = getTransactions();
  const newTransaction: Transaction = {
    ...transaction,
    id: Date.now().toString(),
  };
  transactions.push(newTransaction);
  localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
  return newTransaction;
}

export function updateTransaction(id: string, updates: Partial<Transaction>): void {
  const transactions = getTransactions();
  const index = transactions.findIndex((t) => t.id === id);
  if (index !== -1) {
    transactions[index] = { ...transactions[index], ...updates };
    localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
  }
}

export function deleteTransaction(id: string): void {
  const transactions = getTransactions().filter((t) => t.id !== id);
  localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
}

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
