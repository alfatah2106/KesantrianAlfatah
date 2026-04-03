import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';

export const LoginOverlay: React.FC = () => {
  const { login } = useAppContext();
  const [email, setEmail] = useState('');
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (isAdminMode) {
      if (password === 'alfatah123') {
        login('admin@alfatah.com', 'admin');
      } else {
        alert('Password Admin Salah');
      }
    } else {
      if (email.includes('@')) {
        login(email, 'staff');
      } else {
        alert('Masukkan email yang valid');
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Kesantrian Alfatah App</h1>
          <p className="text-gray-500 mt-2">
            {isAdminMode ? 'Masuk sebagai Admin' : 'Masuk sebagai Staff'}
          </p>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-6">
          {!isAdminMode ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Gmail</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@gmail.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                required
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password Admin</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                required
              />
            </div>
          )}
          
          <button
            type="submit"
            className={`w-full ${isAdminMode ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'} text-white font-medium py-3 px-4 rounded-lg transition-colors flex justify-center items-center gap-2`}
          >
            {!isAdminMode && (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
            )}
            {isAdminMode ? 'Login Admin' : 'Lanjutkan dengan Google (Mock)'}
          </button>

          <div className="relative flex py-3 items-center">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="flex-shrink mx-4 text-gray-400 text-sm">atau</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>

          <button
            type="button"
            onClick={() => setIsAdminMode(!isAdminMode)}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors text-sm"
          >
            {isAdminMode ? 'Kembali ke Login Staff' : 'Masuk sebagai Admin'}
          </button>
        </form>
      </div>
    </div>
  );
};

