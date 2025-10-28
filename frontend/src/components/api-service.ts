const API_BASE_URL = 'http://localhost:8080';

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
  transactionType: number; // 0 = income, 1 = expense
  memberId: number;
  category: {
    id: number;
  };
}

export interface ApiUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  roles: Array<{ id: number }>;
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
    const response = await fetch(`${API_BASE_URL}/categories`);
    return handleResponse<ApiCategory[]>(response);
  },

  create: async (name: string): Promise<ApiCategory> => {
    const response = await fetch(`${API_BASE_URL}/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    return handleResponse<ApiCategory>(response);
  },

  update: async (id: number, name: string): Promise<ApiCategory> => {
    const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, name }),
    });
    return handleResponse<ApiCategory>(response);
  },

  delete: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
      method: 'DELETE',
    });
    return handleResponse<void>(response);
  },
};

// Members API
export const membersApi = {
  getAll: async (): Promise<ApiMember[]> => {
    const response = await fetch(`${API_BASE_URL}/members`);
    return handleResponse<ApiMember[]>(response);
  },

  create: async (name: string, role: string): Promise<ApiMember> => {
    const response = await fetch(`${API_BASE_URL}/members`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, role }),
    });
    return handleResponse<ApiMember>(response);
  },

  update: async (id: number, name: string, role: string): Promise<ApiMember> => {
    const response = await fetch(`${API_BASE_URL}/members/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, role }),
    });
    return handleResponse<ApiMember>(response);
  },

  delete: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/members/${id}`, {
      method: 'DELETE',
    });
    return handleResponse<void>(response);
  },
};

// Transactions API
export const transactionsApi = {
  getAll: async (): Promise<ApiTransaction[]> => {
    const response = await fetch(`${API_BASE_URL}/transactions`);
    return handleResponse<ApiTransaction[]>(response);
  },

  getById: async (id: number): Promise<ApiTransaction> => {
    const response = await fetch(`${API_BASE_URL}/transactions/${id}`);
    return handleResponse<ApiTransaction>(response);
  },

  create: async (transaction: {
    amount: number;
    description: string;
    date: string;
    transactionType: number;
    memberId: number;
    categoryId: number;
  }): Promise<ApiTransaction> => {
    const response = await fetch(`${API_BASE_URL}/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
    transactionType: number;
    memberId: number;
    categoryId: number;
  }): Promise<ApiTransaction> => {
    const response = await fetch(`${API_BASE_URL}/transactions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
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
    });
    return handleResponse<void>(response);
  },
};

// Users API (se precisar no futuro)
export const usersApi = {
  getAll: async (): Promise<ApiUser[]> => {
    const response = await fetch(`${API_BASE_URL}/users`);
    return handleResponse<ApiUser[]>(response);
  },

  getById: async (id: number): Promise<ApiUser> => {
    const response = await fetch(`${API_BASE_URL}/users/${id}`);
    return handleResponse<ApiUser>(response);
  },

  create: async (user: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    roles: Array<{ id: number }>;
  }): Promise<ApiUser> => {
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        Password: user.password, // Nota: API usa "Password" com P maiúsculo
        roles: user.roles,
      }),
    });
    return handleResponse<ApiUser>(response);
  },

  delete: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'DELETE',
    });
    return handleResponse<void>(response);
  },
};
