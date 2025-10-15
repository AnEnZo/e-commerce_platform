'use client';

import React, { useEffect, useState } from 'react';
import { authService, User } from '@/services/authService';

export default function UserInfo(): React.JSX.Element {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserInfo();
  }, []);

  async function loadUserInfo() {
    try {
      setLoading(true);
      const response = await authService.validateToken();
      if (response.valid) {
        setUser(authService.getCurrentUser());
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Error loading user info:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="p-4 bg-gray-100 rounded-lg">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-300 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-600">Chưa đăng nhập</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold text-gray-800 mb-3">Thông tin người dùng</h3>
      <div className="space-y-2">
        <div>
          <span className="font-medium text-gray-600">Username:</span>
          <span className="ml-2 text-gray-800">{user.username}</span>
        </div>
        {user.displayName && (
          <div>
            <span className="font-medium text-gray-600">Display Name:</span>
            <span className="ml-2 text-gray-800">{user.displayName}</span>
          </div>
        )}
        {user.userID && (
          <div>
            <span className="font-medium text-gray-600">User ID:</span>
            <span className="ml-2 text-gray-800">{user.userID}</span>
          </div>
        )}
        <div>
          <span className="font-medium text-gray-600">Roles:</span>
          <span className="ml-2 text-gray-800">{user.roles.join(', ')}</span>
        </div>
        <div>
          <span className="font-medium text-gray-600">Expires At:</span>
          <span className="ml-2 text-gray-800">{user.expiresAt.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}
