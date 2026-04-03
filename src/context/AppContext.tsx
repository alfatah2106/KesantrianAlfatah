import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Gender } from '../types';

interface AppContextType {
  user: User | null;
  login: (email: string, role?: 'admin' | 'staff') => void;
  logout: () => void;
  genderFilter: Gender | 'Semua';
  setGenderFilter: (gender: Gender | 'Semua') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [genderFilter, setGenderFilter] = useState<Gender | 'Semua'>('Semua');

  useEffect(() => {
    const storedUser = localStorage.getItem('kesantrian_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = (email: string, role: 'admin' | 'staff' = 'staff') => {
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      name: email.split('@')[0],
      email,
      role,
    };
    setUser(newUser);
    localStorage.setItem('kesantrian_user', JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('kesantrian_user');
    localStorage.removeItem('kesantrian_alfatah_data'); // Clear local data on logout as requested
  };

  return (
    <AppContext.Provider value={{ user, login, logout, genderFilter, setGenderFilter }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
