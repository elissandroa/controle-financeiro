// Configuração da URL base da API
// Em desenvolvimento: usa localhost
// Em produção: usa variável de ambiente VITE_API_BASE_URL
const API_BASE_URL = 
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) || 
  'https://controle-financeiro-proxy.vercel.app';

import { getAuthHeaders } from './auth-service';

// Tipos da API
export interface ApiCategory {
  id: number;
  name: string;
}

export interface ApiMember {
  id: number;
  name: string;
  role: string;
}

export interface ApiTransaction {
  id: number;
  amount: number;
  description: string;
  date: string;
  transactionType: 'INCOME' | 'EXPENSE';
  memberId: number;
  member?: {
    id: number;
    name: string;
    role: string;
    createdAt: string;
    transactions: any[];
  };
  category: {
    id: number;
    name?: string;
  };
}

// Interface para resposta paginada
export interface PagedResponse<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  last: boolean;
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  first: boolean;
  numberOfElements: number;
  empty: boolean;
}

export interface ApiUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  roles: Array<{ id: number; authority?: string }>;
}

export interface ApiRole {
  id: number;
  authority: string;
}

// Estado da API
let apiAvailable = false;
let apiCheckInProgress = false;

// Verifica se a API está disponível
export async function checkApiAvailability(): Promise<boolean> {
  if (apiCheckInProgress) return apiAvailable;
  
  apiCheckInProgress = true;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    
    const response = await fetch(`${API_BASE_URL}/members`, {
      signal: controller.signal,
      method: 'GET',
    });
    
    clearTimeout(timeoutId);
    apiAvailable = response.ok;
  } catch (error) {
    apiAvailable = false;
  } finally {
    apiCheckInProgress = false;
  }
  
  return apiAvailable;
}

export function isApiAvailable(): boolean {
  return apiAvailable;
}

// Helper para lidar com erros
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || `HTTP error! status: ${response.status}`);
  }
  
  // Se for DELETE, pode não ter conteúdo
  if (response.status === 204) {
    return null as T;
  }
  
  return response.json();
}

// Categories API
export const categoriesApi = {
  getAll: async (): Promise<ApiCategory[]> => {
    const response = await fetch(`${API_BASE_URL}/categories`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<ApiCategory[]>(response);
  },

  create: async (name: string): Promise<ApiCategory> => {
    const response = await fetch(`${API_BASE_URL}/categories`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ name }),
    });
    return handleResponse<ApiCategory>(response);
  },

  update: async (id: number, name: string): Promise<ApiCategory> => {
    const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ id, name }),
    });
    return handleResponse<ApiCategory>(response);
  },

  delete: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse<void>(response);
  },
};

// Members API
export const membersApi = {
  getAll: async (): Promise<ApiMember[]> => {
    const response = await fetch(`${API_BASE_URL}/members`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<ApiMember[]>(response);
  },

  create: async (name: string, role: string): Promise<ApiMember> => {
    const response = await fetch(`${API_BASE_URL}/members`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ name, role }),
    });
    return handleResponse<ApiMember>(response);
  },

  update: async (id: number, name: string, role: string): Promise<ApiMember> => {
    const response = await fetch(`${API_BASE_URL}/members/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ name, role }),
    });
    return handleResponse<ApiMember>(response);
  },

  delete: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/members/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse<void>(response);
  },
};

// Transactions API
export const transactionsApi = {
  getAll: async (): Promise<ApiTransaction[]> => {
    // Busca todas as páginas com ordenação decrescente por ID (mais recentes primeiro)
    let allTransactions: ApiTransaction[] = [];
    let currentPage = 0;
    let hasMore = true;
    
    while (hasMore) {
      const response = await fetch(
        `${API_BASE_URL}/transactions?page=${currentPage}&size=100&sort=date,desc&sort=id,desc`,
        {
          headers: getAuthHeaders(),
        }
      );
      const pagedData = await handleResponse<PagedResponse<ApiTransaction>>(response);
      
      allTransactions = [...allTransactions, ...pagedData.content];
      
      hasMore = !pagedData.last;
      currentPage++;
    }
    
    return allTransactions;
  },

  getById: async (id: number): Promise<ApiTransaction> => {
    const response = await fetch(`${API_BASE_URL}/transactions/${id}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<ApiTransaction>(response);
  },

  create: async (transaction: {
    amount: number;
    description: string;
    date: string;
    transactionType: 'INCOME' | 'EXPENSE';
    memberId: number;
    categoryId: number;
  }): Promise<ApiTransaction> => {
    const response = await fetch(`${API_BASE_URL}/transactions`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        amount: transaction.amount,
        description: transaction.description,
        date: transaction.date,
        transactionType: transaction.transactionType,
        memberId: transaction.memberId,
        category: { id: transaction.categoryId },
      }),
    });
    return handleResponse<ApiTransaction>(response);
  },

  update: async (id: number, transaction: {
    amount: number;
    description: string;
    date: string;
    transactionType: 'INCOME' | 'EXPENSE';
    memberId: number;
    categoryId: number;
  }): Promise<ApiTransaction> => {
    const response = await fetch(`${API_BASE_URL}/transactions/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        id,
        amount: transaction.amount,
        description: transaction.description,
        date: transaction.date,
        transactionType: transaction.transactionType,
        memberId: transaction.memberId,
        category: { id: transaction.categoryId },
      }),
    });
    return handleResponse<ApiTransaction>(response);
  },

  delete: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/transactions/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse<void>(response);
  },
};

// Users API
export const usersApi = {
  getAll: async (): Promise<PagedResponse<ApiUser>> => {
    const response = await fetch(`${API_BASE_URL}/users`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<PagedResponse<ApiUser>>(response);
  },

  getById: async (id: number): Promise<ApiUser> => {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<ApiUser>(response);
  },

  create: async (user: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    password: string;
    roles: Array<{ id: number }>;
  }): Promise<ApiUser> => {
    const body: any = {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      password: user.password, 
      roles: user.roles,
    };
    
    // Só inclui phone se foi fornecido
    if (user.phone && user.phone.trim() !== '') {
      body.phone = user.phone;
    }
    
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(body),
    });
    return handleResponse<ApiUser>(response);
  },

  update: async (id: number, user: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    password?: string;
    roles: Array<{ id: number }>;
  }): Promise<ApiUser> => {
    const body: any = {
      id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      roles: user.roles,
    };
    
    // Só inclui phone se foi fornecido
    if (user.phone && user.phone.trim() !== '') {
      body.phone = user.phone;
    }
    
    // Só inclui password se foi fornecida
    if (user.password && user.password.trim() !== '') {
      body.Password = user.password;
    }
    
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(body),
    });
    return handleResponse<ApiUser>(response);
  },

  delete: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse<void>(response);
  },
};

// Roles API
export const rolesApi = {
  getAll: async (): Promise<ApiRole[]> => {
    const response = await fetch(`${API_BASE_URL}/roles`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<ApiRole[]>(response);
  },
};

// Password Recovery API
// IMPORTANTE: Este módulo NÃO valida tokens.
// Apenas envia requisições para o backend.
// O backend é responsável por validar tokens (validade, expiração, uso único).
export const passwordRecoveryApi = {
  // Solicitar recuperação de senha
  // Backend: valida email, gera token, envia email
  // IMPORTANTE: subject e body podem ser customizados aqui se necessário
  requestRecovery: async (email: string): Promise<{ message: string }> => {
    const response = await fetch(`${API_BASE_URL}/auth/recover-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: email, // Email do usuário
        subject: 'Recuperação de Senha', // Assunto do email (customizável)
        body: 'Recuperação de Senha você tem 30 minutos para utilizar o token contido nesse email:' // Corpo (customizável)
      }),
    });
    return handleResponse<{ message: string }>(response);
  },

  // Resetar senha com token
  // Backend: valida token, valida senha, altera senha, invalida token
  // Frontend: apenas envia, não valida
  resetPassword: async (token: string, newPassword: string): Promise<{ message: string }> => {
    const response = await fetch(`${API_BASE_URL}/auth/new-password`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token, newPassword }), // Corrigido: newPassword ao invés de password
    });
    return handleResponse<{ message: string }>(response);
  },
};
