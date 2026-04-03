import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { MASTER_KEGIATAN, MASTER_STAFF, MASTER_SISWA, KELOMPOK_LIST } from '../../data/mock';
import { AbsensiRecord, FormSupervisiData } from '../../types';
import { addSupervisiRecord } from '../../lib/storage';

export const FormSupervisi: React.FC = () => {
  const { user, genderFilter } = useAppContext();
  
  const [kegiatanId, setKegiatanId] = useState('');
  const [staffId, setStaffId] = useState('');
  const [kelompok, setKelompok] = useState('');
  const [absensi, setAbsensi] = useState<AbsensiRecord[]>([]);
  const [sopChecklist, setSopChecklist] = useState<{sop: string, checked: boolean}[]>([]);

  // Filter kegiatan based on gender filter
  const availableKegiatan = MASTER_KEGIATAN.filter(
    k => genderFilter === 'Semua' || k.gender === genderFilter
  );

  const availableStaff = MASTER_STAFF.filter(
    s => genderFilter === 'Semua' || s.gender === genderFilter
  );

  const [availableKelompok, setAvailableKelompok] = useState<string[]>([]);

  useEffect(() => {
    if (kegiatanId) {
      const kegiatan = MASTER_KEGIATAN.find(k => k.id === kegiatanId);
      if (kegiatan) {
        setSopChecklist(kegiatan.sops.map(sop => ({ sop, checked: false })));
        // Set available kelompok based on targetKelompok
        setAvailableKelompok(kegiatan.targetKelompok);
        // Reset kelompok if the currently selected one is not in the new list
        if (!kegiatan.targetKelompok.includes(kelompok)) {
          setKelompok('');
        }
      }
    } else {
      setSopChecklist([]);
      setAvailableKelompok([]);
      setKelompok('');
    }
  }, [kegiatanId]);

  // Reset selected kegiatan if it doesn't match the new gender filter
  useEffect(() => {
    if (kegiatanId) {
      const kegiatan = MASTER_KEGIATAN.find(k => k.id === kegiatanId);
      if (kegiatan && genderFilter !== 'Semua' && kegiatan.gender !== genderFilter) {
        setKegiatanId('');
      }
    }
  }, [genderFilter, kegiatanId]);

  useEffect(() => {
    if (kelompok) {
      const anggotaKelompok = MASTER_SISWA.filter(s => s.kelompok === kelompok);
      const initialAbsensi: AbsensiRecord[] = anggotaKelompok.map(siswa => ({
        targetId: siswa.id,
        targetName: siswa.name,
        kehadiran: 'Hadir',
        nilai: 100,
      }));
      setAbsensi(initialAbsensi);
    } else {
      setAbsensi([]);
    }
  }, [kelompok]);

  const handleAbsensiChange = (targetId: string, field: keyof AbsensiRecord, value: any) => {
    setAbsensi(prev => prev.map(a => 
      a.targetId === targetId ? { ...a, [field]: value } : a
    ));
  };

  const handleSopChange = (index: number, checked: boolean) => {
    setSopChecklist(prev => {
      const newSop = [...prev];
      newSop[index].checked = checked;
      return newSop;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!kegiatanId || !staffId || !kelompok) return;

    const kegiatan = MASTER_KEGIATAN.find(k => k.id === kegiatanId);
    const kegiatanName = kegiatan?.name || '';
    const staffName = MASTER_STAFF.find(s => s.id === staffId)?.name || '';

    const record: FormSupervisiData = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'supervisi',
      kegiatanId,
      kegiatanName,
      staffId,
      staffName,
      kelompok,
      absensi,
      sopChecklist,
      email: user?.email || '',
      waktu: new Date().toISOString(),
      gender: kegiatan?.gender || 'Putra',
    };

    addSupervisiRecord(record);
    alert('Data Supervisi berhasil disimpan!');
    
    // Reset
    setKegiatanId('');
    setStaffId('');
    setKelompok('');
    setAbsensi([]);
    setSopChecklist([]);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 max-w-4xl mx-auto">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Input Form Supervisi</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Kegiatan</label>
            <select
              required
              value={kegiatanId}
              onChange={(e) => setKegiatanId(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="">-- Pilih Kegiatan --</option>
              {availableKegiatan.map(k => (
                <option key={k.id} value={k.id}>{k.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Staff Penanggung Jawab</label>
            <select
              required
              value={staffId}
              onChange={(e) => setStaffId(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="">-- Pilih Staff --</option>
              {availableStaff.map(s => (
                <option key={s.id} value={s.id}>{s.name} ({s.gender})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Kelompok</label>
            <select
              required
              value={kelompok}
              onChange={(e) => setKelompok(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              disabled={!kegiatanId}
            >
              <option value="">-- Pilih Kelompok --</option>
              {availableKelompok.map(k => (
                <option key={k} value={k}>{k}</option>
              ))}
            </select>
          </div>
        </div>

        {kegiatanId && sopChecklist.length > 0 && (
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-3 border-b pb-2">Checklist SOP Kegiatan</h3>
            <div className="space-y-2 bg-gray-50 p-4 rounded-lg border border-gray-100">
              {sopChecklist.map((item, idx) => (
                <label key={idx} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={item.checked}
                    onChange={(e) => handleSopChange(idx, e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{item.sop}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {kelompok && (
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-4 border-b pb-2">Absensi Anggota Kelompok</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[500px]">
                <thead>
                  <tr className="bg-gray-50 text-gray-600 text-sm">
                    <th className="p-3 border-b font-medium">Nama Siswa</th>
                    <th className="p-3 border-b font-medium w-48">Kehadiran</th>
                    <th className="p-3 border-b font-medium w-32">Nilai</th>
                  </tr>
                </thead>
                <tbody>
                  {absensi.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="p-4 text-center text-gray-500">Tidak ada siswa di kelompok ini.</td>
                    </tr>
                  ) : (
                    absensi.map((record) => (
                      <tr key={record.targetId} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="p-3 text-sm text-gray-800">{record.targetName}</td>
                        <td className="p-3">
                          <select
                            value={record.kehadiran}
                            onChange={(e) => handleAbsensiChange(record.targetId, 'kehadiran', e.target.value)}
                            className="w-full border border-gray-300 rounded px-2 py-1 text-sm outline-none"
                          >
                            <option value="Hadir">Hadir</option>
                            <option value="Sakit">Sakit</option>
                            <option value="Izin">Izin</option>
                            <option value="Alfa">Alfa</option>
                          </select>
                        </td>
                        <td className="p-3">
                          <select
                            value={record.nilai}
                            onChange={(e) => handleAbsensiChange(record.targetId, 'nilai', Number(e.target.value))}
                            className="w-full border border-gray-300 rounded px-2 py-1 text-sm outline-none"
                          >
                            {[100, 90, 80, 70, 50, 0].map(n => (
                              <option key={n} value={n}>{n}</option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="flex justify-end pt-4 border-t border-gray-100">
          <button
            type="submit"
            className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
          >
            Simpan Supervisi
          </button>
        </div>
      </form>
    </div>
  );
};

