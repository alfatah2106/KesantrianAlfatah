import React, { useEffect, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { getLocalData } from '../lib/storage';
import { Users, Activity, CheckSquare, Calendar } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { genderFilter } = useAppContext();
  const [stats, setStats] = useState({
    totalKegiatan: 0,
    totalSupervisi: 0,
    kegiatanHariIni: 0,
    supervisiHariIni: 0,
  });

  useEffect(() => {
    const data = getLocalData();
    const today = new Date().toISOString().split('T')[0];

    const filteredKegiatan = data.kegiatanRecords.filter(
      (r) => genderFilter === 'Semua' || r.gender === genderFilter
    );
    const filteredSupervisi = data.supervisiRecords.filter(
      (r) => genderFilter === 'Semua' || r.gender === genderFilter
    );

    setStats({
      totalKegiatan: filteredKegiatan.length,
      totalSupervisi: filteredSupervisi.length,
      kegiatanHariIni: filteredKegiatan.filter(r => r.waktu.startsWith(today)).length,
      supervisiHariIni: filteredSupervisi.filter(r => r.waktu.startsWith(today)).length,
    });
  }, [genderFilter]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Kegiatan" 
          value={stats.totalKegiatan} 
          icon={Activity} 
          color="bg-blue-500" 
        />
        <StatCard 
          title="Total Supervisi" 
          value={stats.totalSupervisi} 
          icon={CheckSquare} 
          color="bg-green-500" 
        />
        <StatCard 
          title="Kegiatan Hari Ini" 
          value={stats.kegiatanHariIni} 
          icon={Calendar} 
          color="bg-purple-500" 
        />
        <StatCard 
          title="Supervisi Hari Ini" 
          value={stats.supervisiHariIni} 
          icon={Users} 
          color="bg-orange-500" 
        />
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Informasi Dashboard</h3>
        <p className="text-gray-600">
          Selamat datang di Sistem Informasi Kesantrian Alfatah. 
          Saat ini Anda melihat data untuk: <strong className="text-blue-600">{genderFilter}</strong>.
          Gunakan menu di sebelah kiri untuk menavigasi aplikasi.
        </p>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon: Icon, color }: any) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
    <div className={`${color} p-4 rounded-lg text-white`}>
      <Icon className="w-6 h-6" />
    </div>
    <div>
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  </div>
);
