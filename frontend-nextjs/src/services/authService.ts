// src/services/authService.ts
// Authentication service for managing user authentication state
import { getUserInfoFromToken } from '@/utils/jwt'; // optional; không bắt buộc
const BACKEND_BASE = 'http://localhost:8080/auth-service';

export interface User {
  username: string;
  displayName?: string;
  userID?: string;
  roles: string[];
  expiresAt: Date;
}

export interface AuthResponse {
  valid: boolean;
  username?: string;
  displayName?: string;
  userID?: string;
  roles?: string[];
  expiresAt?: string | Date;
  message?: string;
}

class AuthService {
  private currentUser: User | null = null;

  // Keep getCookie for CSRF header reading (XSRF-TOKEN), don't use it to read HttpOnly ACCESS-TOKEN
  private getCookie(name: string): string | null {
    if (typeof document === 'undefined') return null;
    const match = document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)');
    return match ? decodeURIComponent(match[2]) : null;
  }

  private notifyAuthChanged() {
    if (typeof window !== 'undefined' && typeof CustomEvent !== 'undefined') {
      window.dispatchEvent(new CustomEvent('auth-changed'));
    }
  }

  /**
   * Validate current authentication token via backend.
   * IMPORTANT: do NOT rely on reading ACCESS-TOKEN from document.cookie (HttpOnly).
   */
  async validateToken(): Promise<AuthResponse> {
    try {
      const response = await fetch(`${BACKEND_BASE}/api/auth/validate-token`, {
        method: 'POST',
        credentials: 'include', // ensure HttpOnly cookie is sent
        headers: {
          'Content-Type': 'application/json',
        },
        body: null,
      });

      if (!response.ok) {
        // try parse message body if present
        const err = await response.json().catch(() => ({ valid: false, message: 'Token invalid' }));
        this.currentUser = null;
        return err as AuthResponse;
      }

      const data: AuthResponse = await response.json();

      if (data.valid && data.username && data.roles) {
        this.currentUser = {
          username: data.username,
          displayName: data.displayName || undefined,
          userID: data.userID ? String(data.userID) : undefined,
          roles: data.roles,
          expiresAt: data.expiresAt ? new Date(data.expiresAt) : new Date(),
        };
      } else {
        this.currentUser = null;
      }

      return data;
    } catch (error) {
      console.error('Token validation error:', error);
      this.currentUser = null;
      return { valid: false, message: 'Network error' };
    }
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  async isAuthenticated(): Promise<boolean> {
    const response = await this.validateToken();
    return response.valid;
  }

  hasRole(role: string): boolean {
    return this.currentUser?.roles?.includes(role) ?? false;
  }

  hasAnyRole(roles: string[]): boolean {
    return this.currentUser?.roles?.some(role => roles.includes(role)) ?? false;
  }

  /**
   * Login: call backend; backend sets HttpOnly cookie. Then call validateToken() to populate client state.
   * Dispatch 'auth-changed' so UI can react immediately.
   */
  async login(username: string, password: string): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await fetch(`${BACKEND_BASE}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Login failed' }));
        return { success: false, message: errorData.message };
      }

      // backend should set HttpOnly cookie; call validate to get current user
      const data = await response.json().catch(() => ({ message: 'Login successful' }));
      await this.validateToken();

      // notify other windows/components
      this.notifyAuthChanged();

      return { success: true, message: data.message || 'Login successful' };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Network error' };
    }
  }

  async register(userData: {
    username: string;
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
  }): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await fetch(`${BACKEND_BASE}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json().catch(() => ({ message: 'User registered successfully' }));
        return { success: true, message: data.message || 'User registered successfully' };
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Registration failed' }));
        return { success: false, message: errorData.message };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, message: 'Network error' };
    }
  }

  async forgotPasswordEmail(username: string): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await fetch(`${BACKEND_BASE}/api/auth/forgot-password-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json().catch(() => ({ message: 'OTP sent' }));
        return { success: true, message: data.message };
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Failed to send reset email' }));
        return { success: false, message: errorData.message };
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      return { success: false, message: 'Network error' };
    }
  }

  async resetPasswordEmail(username: string, otp: string, newPassword: string): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await fetch(`${BACKEND_BASE}/api/auth/reset-password-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, otp, newPassword }),
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json().catch(() => ({ message: 'Password reset success' }));
        return { success: true, message: data.message };
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Password reset failed' }));
        return { success: false, message: errorData.message };
      }
    } catch (error) {
      console.error('Reset password error:', error);
      return { success: false, message: 'Network error' };
    }
  }

  clearLocalAuth(): void {
    this.currentUser = null;
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('some-app-auth-key');
      }
    } catch (e) {
      // ignore
    }
  }

  /**
   * Logout: call backend to clear cookie / blacklist token, then clear client state.
   * Dispatch 'auth-changed' so UI can update.
   */
  async logout(): Promise<{ success: boolean; message?: string }> {
    try {
      const csrf = this.getCookie('XSRF-TOKEN') || '';
      const res = await fetch(`${BACKEND_BASE}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-XSRF-TOKEN': csrf,
        },
        body: null,
      });

      if (res.ok) {
        this.clearLocalAuth();
        this.notifyAuthChanged();
        return { success: true, message: 'Logout successful' };
      } else {
        const data = await res.json().catch(() => ({ message: 'Logout failed' }));
        this.clearLocalAuth();
        this.notifyAuthChanged();
        return { success: false, message: data.message || 'Logout failed' };
      }
    } catch (error) {
      console.error('Logout error:', error);
      this.clearLocalAuth();
      this.notifyAuthChanged();
      return { success: false, message: 'Network error' };
    }
  }
}

export const authService = new AuthService();
export default authService;
