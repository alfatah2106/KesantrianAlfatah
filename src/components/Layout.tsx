import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { LogOut, LayoutDashboard, ClipboardList, CheckSquare, Calendar, FileText, Users, Activity, Menu, X } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
  const { user, logout, genderFilter, setGenderFilter } = useAppContext();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'form-kegiatan', label: 'Form Kegiatan', icon: ClipboardList },
    { id: 'form-supervisi', label: 'Form Supervisi', icon: CheckSquare },
    { id: 'jurnal', label: 'Jurnal (Kalender)', icon: Calendar },
    { id: 'raport-siswa', label: 'Raport Siswa', icon: Users },
    { id: 'laporan-staff', label: 'Laporan Staff', icon: FileText },
    { id: 'laporan-kegiatan', label: 'Laporan Kegiatan', icon: Activity },
  ];

  const handleTabClick = (id: string) => {
    setActiveTab(id);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-gray-900 bg-opacity-50 z-40 md:hidden transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 flex flex-col transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        md:relative md:translate-x-0 print:hidden
      `}>
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-blue-600">Kesantrian App</h1>
            <p className="text-sm text-gray-500 mt-1">Alfatah Management</p>
          </div>
          <button className="md:hidden text-gray-500 hover:text-gray-700" onClick={() => setIsMobileMenuOpen(false)}>
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => handleTabClick(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === item.id
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {item.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold shrink-0">
              {user?.name.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden w-full">
        {/* Header - Hidden when printing */}
        <header className="bg-white border-b border-gray-200 px-4 sm:px-8 py-4 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-3">
            <button className="md:hidden text-gray-600 hover:text-gray-900" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800 capitalize truncate">
              {menuItems.find(m => m.id === activeTab)?.label.replace('-', ' ')}
            </h2>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4">
            <span className="hidden sm:inline text-sm font-medium text-gray-600">Filter Gender:</span>
            <select
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value as any)}
              className="border border-gray-300 rounded-lg px-2 sm:px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="Semua">Semua</option>
              <option value="Putra">Putra</option>
              <option value="Putri">Putri</option>
            </select>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 print:p-0 print:overflow-visible">
          {children}
        </div>
      </main>
    </div>
  );
};
