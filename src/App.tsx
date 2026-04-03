/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useAppContext } from './context/AppContext';
import { LoginOverlay } from './components/LoginOverlay';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { FormKegiatan } from './components/forms/FormKegiatan';
import { FormSupervisi } from './components/forms/FormSupervisi';
import { JurnalKalender } from './components/reports/JurnalKalender';
import { RaportSiswa } from './components/reports/RaportSiswa';
import { LaporanStaff } from './components/reports/LaporanStaff';
import { LaporanKegiatan } from './components/reports/LaporanKegiatan';

const AppContent = () => {
  const { user } = useAppContext();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (!user) {
    return <LoginOverlay />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'form-kegiatan': return <FormKegiatan />;
      case 'form-supervisi': return <FormSupervisi />;
      case 'jurnal': return <JurnalKalender />;
      case 'raport-siswa': return <RaportSiswa />;
      case 'laporan-staff': return <LaporanStaff />;
      case 'laporan-kegiatan': return <LaporanKegiatan />;
      default: return <Dashboard />;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderContent()}
    </Layout>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

