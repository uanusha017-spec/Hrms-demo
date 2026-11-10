import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, Tenant, TenantMembership, UserRole } from '../types/index.ts';
import { apiFetch } from '../lib/api.ts';

interface AuthContextType {
  currentUser: User | null;
  currentTenant: Tenant | null;
  currentMembership: TenantMembership | null;
  accessibleTenants: Tenant[];
  allUsers: User[];
  activeRole: UserRole;
  isAuthenticated: boolean;
  isLoading: boolean;
  isMobileSimulatorOpen: boolean;
  toggleMobileSimulator: () => void;
  isMobileSidebarOpen: boolean;
  setIsMobileSidebarOpen: (open: boolean) => void;
  toggleMobileSidebar: () => void;
  login: (email: string, password?: string, tenantId?: string) => Promise<void>;
  logout: () => void;
  switchTenant: (tenantId: string) => Promise<void>;
  switchPersona: (userId: string, role?: UserRole) => Promise<void>;
  refreshAuth: () => Promise<void>;
  currentView: string;
  setCurrentView: (view: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentTenant, setCurrentTenant] = useState<Tenant | null>(null);
  const [currentMembership, setCurrentMembership] = useState<TenantMembership | null>(null);
  const [accessibleTenants, setAccessibleTenants] = useState<Tenant[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [activeRole, setActiveRole] = useState<UserRole>('COMPANY_ADMIN');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return Boolean(localStorage.getItem('natton_token') || localStorage.getItem('natton_user_id'));
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isMobileSimulatorOpen, setIsMobileSimulatorOpen] = useState<boolean>(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [currentView, setCurrentView] = useState<string>('dashboard');

  const refreshAuth = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await apiFetch('/auth/me');
      setCurrentUser(data.user);
      setCurrentTenant(data.tenant);
      setCurrentMembership(data.membership);
      setAccessibleTenants(data.accessibleTenants);
      setAllUsers(data.allUsersForPersonaSwitcher || []);
      if (data.membership?.role) {
        setActiveRole(data.membership.role);
      }
    } catch (err) {
      console.error('Failed to load auth context:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      refreshAuth();
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated, refreshAuth]);

  const login = async (email: string, password?: string, tenantId?: string) => {
    const res = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, tenantId })
    });

    localStorage.setItem('natton_token', res.token);
    localStorage.setItem('natton_user_id', res.user.id);
    localStorage.setItem('natton_tenant_id', res.tenant.id);

    setCurrentUser(res.user);
    setCurrentTenant(res.tenant);
    setCurrentMembership(res.membership);
    if (res.membership?.role) {
      setActiveRole(res.membership.role);
    }

    if (res.user.id === 'usr-superadmin') {
      setCurrentView('superadmin');
    } else {
      setCurrentView('dashboard');
    }

    setIsAuthenticated(true);
    await refreshAuth();
  };

  const logout = () => {
    localStorage.removeItem('natton_token');
    localStorage.removeItem('natton_user_id');
    setIsAuthenticated(false);
    setCurrentUser(null);
    setCurrentView('dashboard');
  };

  const switchTenant = async (tenantId: string) => {
    localStorage.setItem('natton_tenant_id', tenantId);
    await refreshAuth();
  };

  const switchPersona = async (userId: string, role?: UserRole) => {
    localStorage.setItem('natton_user_id', userId);
    if (role) {
      setActiveRole(role);
    }
    if (userId === 'usr-superadmin') {
      setCurrentView('superadmin');
    } else if (currentView === 'superadmin') {
      setCurrentView('dashboard');
    }
    await refreshAuth();
  };

  const toggleMobileSimulator = () => {
    setIsMobileSimulatorOpen(prev => !prev);
  };

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(prev => !prev);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        currentTenant,
        currentMembership,
        accessibleTenants,
        allUsers,
        activeRole,
        isAuthenticated,
        isLoading,
        isMobileSimulatorOpen,
        toggleMobileSimulator,
        isMobileSidebarOpen,
        setIsMobileSidebarOpen,
        toggleMobileSidebar,
        login,
        logout,
        switchTenant,
        switchPersona,
        refreshAuth,
        currentView,
        setCurrentView
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
