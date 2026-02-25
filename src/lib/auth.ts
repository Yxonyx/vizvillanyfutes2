// Authentication utilities for client-side session management

export interface UserSession {
  user: {
    id: string;
    email: string;
    role: 'admin' | 'dispatcher' | 'contractor' | 'customer' | null;
    status: 'active' | 'pending_approval' | 'suspended' | null;
  };
  session: {
    access_token: string;
    refresh_token?: string;
    expires_at?: number;
  };
  contractor_profile?: {
    id: string;
    display_name: string;
    phone?: string;
    trades?: string[];
    service_areas?: string[];
    status?: string;
    credit_balance?: number;
  } | null;
}

const SESSION_KEY = 'vvf_session';

// Get session from localStorage
export function getSession(): UserSession | null {
  if (typeof window === 'undefined') return null;

  try {
    const stored = localStorage.getItem(SESSION_KEY);
    if (!stored) return null;

    const session = JSON.parse(stored) as UserSession;

    // Check if token is expired
    if (session.session.expires_at && session.session.expires_at * 1000 < Date.now()) {
      clearSession();
      return null;
    }

    return session;
  } catch {
    clearSession();
    return null;
  }
}

// Store session in localStorage
export function setSession(session: UserSession): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

// Clear session from localStorage
export function clearSession(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(SESSION_KEY);
}

// Check if user is authenticated
export function isAuthenticated(): boolean {
  return getSession() !== null;
}

// Get authorization header for API calls
export function getAuthHeader(): string | null {
  const session = getSession();
  if (!session?.session.access_token) return null;
  return `Bearer ${session.session.access_token}`;
}

// Get current user's role
export function getUserRole(): 'admin' | 'dispatcher' | 'contractor' | 'customer' | null {
  const session = getSession();
  return session?.user.role || null;
}

// Check if user has specific role
export function hasRole(roles: ('admin' | 'dispatcher' | 'contractor' | 'customer')[]): boolean {
  const userRole = getUserRole();
  return userRole !== null && roles.includes(userRole);
}

// Check if user is admin or dispatcher
export function isAdminOrDispatcher(): boolean {
  return hasRole(['admin', 'dispatcher']);
}

// Check if user is contractor
export function isContractor(): boolean {
  return hasRole(['contractor']);
}

// Check if user is customer
export function isCustomer(): boolean {
  return hasRole(['customer']);
}

// Get contractor profile ID
export function getContractorProfileId(): string | null {
  const session = getSession();
  return session?.contractor_profile?.id || null;
}
