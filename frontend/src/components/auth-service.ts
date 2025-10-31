// Serviço de Autenticação OAuth2 para Spring Boot

const API_BASE_URL = 'https://controle-financeiro-proxy.vercel.app';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
}

export interface DecodedToken {
  sub: string;
  authorities?: string[];
  exp: number;
  iat: number;
}

// Armazena o token JWT
let authToken: string | null = null;

// Configuração OAuth2 do Spring Boot
const CLIENT_ID = 'myclientid';
const CLIENT_SECRET = 'myclientsecret';

/**
 * Faz login usando OAuth2 Password Grant Type
 */
export async function login(credentials: LoginCredentials): Promise<boolean> {
  try {
    // Prepara o body do OAuth2 Token Request (sem client_id e client_secret no body)
    const params = new URLSearchParams();
    params.append('grant_type', 'password');
    params.append('username', credentials.username);
    params.append('password', credentials.password);

    const response = await fetch(`${API_BASE_URL}/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + btoa(`${CLIENT_ID}:${CLIENT_SECRET}`)
      },
      body: params.toString(),
    });

    if (!response.ok) {
      return false;
    }

    const data: AuthResponse = await response.json();
    
    // Armazena o token
    authToken = data.access_token;
    sessionStorage.setItem('auth_token', data.access_token);
    sessionStorage.setItem('auth_expires_at', String(Date.now() + (data.expires_in * 1000)));
    
    if (data.refresh_token) {
      sessionStorage.setItem('refresh_token', data.refresh_token);
    }

    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Faz logout e limpa os tokens
 */
export function logout(): void {
  authToken = null;
  sessionStorage.removeItem('auth_token');
  sessionStorage.removeItem('auth_expires_at');
  sessionStorage.removeItem('refresh_token');
}

/**
 * Retorna o token de autenticação
 */
export function getAuthToken(): string | null {
  if (authToken) return authToken;
  
  const token = sessionStorage.getItem('auth_token');
  const expiresAt = sessionStorage.getItem('auth_expires_at');
  
  // Verifica se o token expirou
  if (token && expiresAt) {
    if (Date.now() < parseInt(expiresAt)) {
      authToken = token;
      return token;
    } else {
      logout();
    }
  }
  
  return null;
}

/**
 * Verifica se o usuário está autenticado
 */
export function isAuthenticated(): boolean {
  return getAuthToken() !== null;
}

/**
 * Retorna os headers de autenticação para as requisições
 */
export function getAuthHeaders(): HeadersInit {
  const token = getAuthToken();
  if (token) {
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }
  return {
    'Content-Type': 'application/json',
  };
}

/**
 * Decodifica o JWT token (apenas a parte do payload)
 * Nota: Não valida a assinatura - isso é feito pelo servidor
 */
function decodeJWT(token: string): DecodedToken | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }
    
    // Decodifica a parte do payload (segunda parte)
    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded);
  } catch (error) {
    return null;
  }
}

/**
 * Retorna as roles/authorities do usuário atual
 */
export function getUserAuthorities(): string[] {
  const token = getAuthToken();
  if (!token) return [];
  
  const decoded = decodeJWT(token);
  return decoded?.authorities || [];
}

/**
 * Verifica se o usuário tem uma role específica
 */
export function hasRole(role: string): boolean {
  const authorities = getUserAuthorities();
  return authorities.includes(role);
}

/**
 * Verifica se o usuário é administrador
 */
export function isAdmin(): boolean {
  return hasRole('ROLE_ADMIN');
}

/**
 * Retorna o username do usuário atual
 */
export function getCurrentUsername(): string | null {
  const token = getAuthToken();
  if (!token) return null;
  
  const decoded = decodeJWT(token);
  return decoded?.sub || null;
}
