import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { fetchStaff, fetchSiswa, fetchKegiatan, submitFormSupervisi } from '../../lib/api';
import { AbsensiRecord, FormSupervisiData, Staff, Siswa, MasterKegiatan } from '../../types';

export const FormSupervisi: React.FC = () => {
  const { user, genderFilter } = useAppContext();
  
  const [kegiatanId, setKegiatanId] = useState('');
  const [staffId, setStaffId] = useState('');
  const [kelompok, setKelompok] = useState('');
  const [absensi, setAbsensi] = useState<AbsensiRecord[]>([]);
  const [sopChecklist, setSopChecklist] = useState<{sop: string, checked: boolean}[]>([]);

  const [availableKegiatan, setAvailableKegiatan] = useState<MasterKegiatan[]>([]);
  const [availableStaff, setAvailableStaff] = useState<Staff[]>([]);
  const [availableSiswa, setAvailableSiswa] = useState<Siswa[]>([]);
  const [availableKelompok, setAvailableKelompok] = useState<string[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [st, sw, kg] = await Promise.all([fetchStaff(), fetchSiswa(), fetchKegiatan()]);
        setAvailableStaff(st.filter((s: Staff) => genderFilter === 'Semua' || s.gender === genderFilter));
        setAvailableSiswa(sw.filter((s: Siswa) => genderFilter === 'Semua' || s.gender === genderFilter));
        setAvailableKegiatan(kg.filter((k: MasterKegiatan) => genderFilter === 'Semua' || k.gender === genderFilter));
      } catch (error) {
        console.error("Error loading master data", error);
      }
    };
    loadData();
  }, [genderFilter]);

  useEffect(() => {
    if (kegiatanId) {
      const kegiatan: any = availableKegiatan.find(k => k.id === kegiatanId);
      if (kegiatan) {
        setSopChecklist((kegiatan.sops || []).map((sop: string) => ({ sop, checked: false })));
        const targetKelp = kegiatan.target_kelompok || kegiatan.targetKelompok || [];
        setAvailableKelompok(targetKelp);
        if (!targetKelp.includes(kelompok)) {
          setKelompok('');
        }
      }
    } else {
      setSopChecklist([]);
      setAvailableKelompok([]);
      setKelompok('');
    }
  }, [kegiatanId, availableKegiatan]);

  useEffect(() => {
    if (kegiatanId) {
      const kegiatan = availableKegiatan.find(k => k.id === kegiatanId);
      if (kegiatan && genderFilter !== 'Semua' && kegiatan.gender !== genderFilter) {
        setKegiatanId('');
      }
    }
  }, [genderFilter, kegiatanId, availableKegiatan]);

  useEffect(() => {
    if (kelompok) {
      // Filter siswa: mendukung banyak kelompok (misal: "A1, B1, C1")
      const anggotaKelompok = availableSiswa.filter(s => {
        if (!s.kelompok) return false;
        const groups = s.kelompok.split(',').map(g => g.trim().toLowerCase());
        return groups.includes(kelompok.trim().toLowerCase());
      });

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
  }, [kelompok, availableSiswa]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!kegiatanId || !staffId || !kelompok) return;

    const kegiatan = availableKegiatan.find(k => k.id === kegiatanId);
    const kegiatanName = kegiatan?.name || '';
    const staffName = availableStaff.find(s => s.id === staffId)?.name || '';

    const record: any = {
      id: Math.random().toString(36).substr(2, 9),
      kegiatan_id: kegiatanId,
      kegiatan_name: kegiatanName,
      staff_id: staffId,
      staff_name: staffName,
      kelompok,
      absensi,
      sop_checklist: sopChecklist,
      email: user?.email || '',
      gender: kegiatan?.gender || 'Putra',
    };

    try {
      await submitFormSupervisi(record);
      alert('Data Supervisi berhasil disimpan!');
      
      setKegiatanId('');
      setStaffId('');
      setKelompok('');
      setAbsensi([]);
      setSopChecklist([]);
    } catch (err) {
      alert('Gagal menyimpan data');
      console.error(err);
    }
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

