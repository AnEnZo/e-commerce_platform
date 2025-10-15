
import { useEffect, useState } from 'react';
import { authService, User } from '@/services/authService';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      setLoading(true);
      const response = await authService.validateToken();
      setIsAuthenticated(response.valid);
      setUser(response.valid ? authService.getCurrentUser() : null);
    } catch (error) {
      console.error('Auth check error:', error);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (username: string, password: string) => {
    const result = await authService.login(username, password);
    if (result.success) {
      await checkAuth();
    }
    return result;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  const hasRole = (role: string) => authService.hasRole(role);
  const hasAnyRole = (roles: string[]) => authService.hasAnyRole(roles);

  return {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
    checkAuth,
    hasRole,
    hasAnyRole
  };
}

export function useAuthFromUrl() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenFromUrl = params.get('token');
    const savedRedirect = params.get('redirect') || '/';

    if (tokenFromUrl) {
      // Handle OAuth2 redirect with token
      params.delete('token');
      params.delete('redirect');
      const clean = window.location.pathname + (params.toString() ? `?${params.toString()}` : '');
      window.history.replaceState({}, document.title, clean);
      window.location.href = savedRedirect;
    }
  }, []);
}
