// ==========================================================
// UniMart: AuthContext for Session & Profile State
// ==========================================================
import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('unimart_token'));
  const [loading, setLoading] = useState(true);
  const [allowedDomains, setAllowedDomains] = useState([
    '@___.___ .ac.lk',
    '@student.rjt.ac.lk',
    '.ac.lk'
  ]);

  // Load allowed domains and current user on mount
  useEffect(() => {
    async function initAuth() {
      try {
        const domainsRes = await authApi.getDomains();
        if (domainsRes.allowedDomains) {
          setAllowedDomains(domainsRes.allowedDomains);
        }
      } catch (err) {
        console.warn('Could not load domain list from server:', err);
      }

      // Automatically wipe any legacy demo dummy account from local storage
      const storedUser = localStorage.getItem('unimart_current_user');
      if (storedUser && (storedUser.includes('kavindu') || storedUser.includes('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'))) {
        localStorage.removeItem('unimart_current_user');
        localStorage.removeItem('unimart_token');
      }

      const storedToken = localStorage.getItem('unimart_token');
      if (storedToken) {
        try {
          const res = await authApi.getMe();
          if (res.user && !res.user.email?.includes('kavindu')) {
            setUser(res.user);
          } else {
            localStorage.removeItem('unimart_token');
            localStorage.removeItem('unimart_current_user');
            setToken(null);
            setUser(null);
          }
        } catch (err) {
          console.warn('Session expired or invalid:', err);
          localStorage.removeItem('unimart_token');
          localStorage.removeItem('unimart_current_user');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    }

    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await authApi.login(email, password);
    if (res.token && res.user) {
      localStorage.setItem('unimart_token', res.token);
      localStorage.setItem('unimart_current_user', JSON.stringify(res.user));
      setToken(res.token);
      setUser(res.user);
    }
    return res;
  };

  const register = async (userData) => {
    logout();
    const res = await authApi.register(userData);
    if (res.token && res.user) {
      localStorage.setItem('unimart_token', res.token);
      localStorage.setItem('unimart_current_user', JSON.stringify(res.user));
      setToken(res.token);
      setUser(res.user);
    }
    return res;
  };

  const logout = () => {
    localStorage.removeItem('unimart_token');
    localStorage.removeItem('unimart_current_user');
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (profileData) => {
    const res = await authApi.updateProfile(profileData);
    if (res.user) {
      setUser(res.user);
    }
    return res;
  };

  const deleteAccount = async () => {
    const res = await authApi.deleteAccount();
    logout();
    return res;
  };

  const verifyOtp = async (email, otpToken) => {
    const res = await authApi.verifyOtp(email, otpToken);
    if (res.token && res.user) {
      localStorage.setItem('unimart_token', res.token);
      localStorage.setItem('unimart_current_user', JSON.stringify(res.user));
      setToken(res.token);
      setUser(res.user);
    }
    return res;
  };

  const confirmDirect = async (email) => {
    const res = await authApi.confirmDirect(email);
    if (res.token && res.user) {
      localStorage.setItem('unimart_token', res.token);
      localStorage.setItem('unimart_current_user', JSON.stringify(res.user));
      setToken(res.token);
      setUser(res.user);
    }
    return res;
  };

  const refreshUser = async () => {
    try {
      const res = await authApi.getMe();
      if (res.user) {
        setUser(res.user);
        localStorage.setItem('unimart_current_user', JSON.stringify(res.user));
      }
    } catch {}
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        allowedDomains,
        isAuthenticated: Boolean(user && token),
        login,
        register,
        logout,
        updateProfile,
        deleteAccount,
        verifyOtp,
        confirmDirect,
        refreshUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
