// API client utilities with authentication

import { getAuthHeader, clearSession } from './auth';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export class ApiError extends Error {
  status: number;
  
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

// API client with automatic auth headers
export async function apiClient<T = unknown>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const authHeader = getAuthHeader();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (authHeader) {
    (headers as Record<string, string>)['Authorization'] = authHeader;
  }
  
  try {
    const response = await fetch(endpoint, {
      ...options,
      headers,
      cache: 'no-store', // Disable Next.js fetch caching
    });
    
    const data = await response.json();
    
    // Handle unauthorized - clear session and redirect
    if (response.status === 401) {
      clearSession();
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        window.location.href = '/login?expired=true';
      }
      throw new ApiError(data.error || 'Unauthorized', 401);
    }
    
    if (!response.ok) {
      throw new ApiError(data.error || 'API request failed', response.status);
    }
    
    return data as ApiResponse<T>;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      error instanceof Error ? error.message : 'Network error',
      0
    );
  }
}

// Standardized error handling
export function handleApiError(error: unknown): string {
  if (error instanceof ApiError) {
    // Map common errors to Hungarian
    const errorMessages: Record<string, string> = {
      'Invalid login credentials': 'Hibás email vagy jelszó',
      'Email not confirmed': 'Kérjük erősítse meg email címét',
      'User already registered': 'Ez az email cím már regisztrálva van',
      'Password should be at least 8 characters': 'A jelszónak legalább 8 karakternek kell lennie',
      'Unauthorized': 'Nincs jogosultsága ehhez a művelethez',
      'Contractor profile not found': 'Partner profil nem található',
      'Job not found': 'Munka nem található',
    };
    
    return errorMessages[error.message] || error.message;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'Ismeretlen hiba történt';
}

// Add cache-busting query parameter to URL
function addCacheBuster(endpoint: string): string {
  const separator = endpoint.includes('?') ? '&' : '?';
  return `${endpoint}${separator}_t=${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

// Convenience methods for common API calls
export const api = {
  get: <T>(endpoint: string) => 
    apiClient<T>(addCacheBuster(endpoint), { method: 'GET' }),
    
  post: <T>(endpoint: string, body: unknown) =>
    apiClient<T>(endpoint, { 
      method: 'POST', 
      body: JSON.stringify(body) 
    }),
    
  put: <T>(endpoint: string, body: unknown) =>
    apiClient<T>(endpoint, { 
      method: 'PUT', 
      body: JSON.stringify(body) 
    }),
    
  delete: <T>(endpoint: string) =>
    apiClient<T>(endpoint, { method: 'DELETE' }),
};
