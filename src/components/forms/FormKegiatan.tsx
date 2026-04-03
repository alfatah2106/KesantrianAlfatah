import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { fetchStaff, fetchKegiatan, submitFormKegiatan, uploadToGDrive } from '../../lib/api';
import { AbsensiRecord, FormKegiatanData, Kehadiran, Nilai, Staff, MasterKegiatan } from '../../types';

export const FormKegiatan: React.FC = () => {
  const { user, genderFilter } = useAppContext();
  
  const [kegiatanId, setKegiatanId] = useState('');
  const [staffId, setStaffId] = useState('');
  const [catatan, setCatatan] = useState('');
  const [absensi, setAbsensi] = useState<AbsensiRecord[]>([]);
  const [fotoUrl, setFotoUrl] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);

  const [availableKegiatan, setAvailableKegiatan] = useState<MasterKegiatan[]>([]);
  const [availableStaff, setAvailableStaff] = useState<Staff[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [st, kg] = await Promise.all([fetchStaff(), fetchKegiatan()]);
        setAvailableStaff(st.filter((s: Staff) => genderFilter === 'Semua' || s.gender === genderFilter));
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
        const targetIds = kegiatan.target_staff_ids || kegiatan.targetStaffIds || [];
        const targetStaff = availableStaff.filter((s: Staff) => targetIds.includes(s.id));
        const initialAbsensi: AbsensiRecord[] = targetStaff.map((staff: Staff) => ({
          targetId: staff.id,
          targetName: staff.name,
          kehadiran: 'Hadir',
          nilai: 100,
        }));
        setAbsensi(initialAbsensi);
      }
    } else {
      setAbsensi([]);
    }
  }, [kegiatanId, availableKegiatan, availableStaff]);

  useEffect(() => {
    if (kegiatanId) {
      const kegiatan = availableKegiatan.find(k => k.id === kegiatanId);
      if (kegiatan && genderFilter !== 'Semua' && kegiatan.gender !== genderFilter) {
        setKegiatanId('');
      }
    }
  }, [genderFilter, kegiatanId, availableKegiatan]);

  const handleAbsensiChange = (targetId: string, field: keyof AbsensiRecord, value: any) => {
    setAbsensi(prev => prev.map(a => 
      a.targetId === targetId ? { ...a, [field]: value } : a
    ));
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      try {
        const url = await uploadToGDrive(file);
        setFotoUrl(url);
      } catch (err: any) {
        alert("Gagal mengunggah foto: " + err.message);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!kegiatanId || !staffId) return;

    const kegiatan = availableKegiatan.find(k => k.id === kegiatanId);
    const kegiatanName = kegiatan?.name || '';
    const staffName = availableStaff.find(s => s.id === staffId)?.name || '';

    const record: any = {
      id: Math.random().toString(36).substr(2, 9),
      kegiatan_id: kegiatanId,
      kegiatan_name: kegiatanName,
      staff_id: staffId,
      staff_name: staffName,
      catatan,
      absensi,
      foto_url: fotoUrl,
      email: user?.email || '',
      gender: kegiatan?.gender || 'Putra',
    };

    try {
      await submitFormKegiatan(record);
      alert('Data berhasil disimpan!');
      
      setKegiatanId('');
      setStaffId('');
      setCatatan('');
      setFotoUrl('');
      setAbsensi([]);
    } catch (err) {
      alert('Gagal menyimpan data');
      console.error(err);
    }
  };


  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 max-w-4xl mx-auto">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Input Form Kegiatan</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Catatan</label>
          <textarea
            value={catatan}
            onChange={(e) => setCatatan(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none h-24"
            placeholder="Tambahkan catatan kegiatan..."
          />
        </div>

        {kegiatanId && (
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-4 border-b pb-2">Absensi Anggota Staff</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[500px]">
                <thead>
                  <tr className="bg-gray-50 text-gray-600 text-sm">
                    <th className="p-3 border-b font-medium">Nama Staff</th>
                    <th className="p-3 border-b font-medium w-48">Kehadiran</th>
                    <th className="p-3 border-b font-medium w-32">Nilai</th>
                  </tr>
                </thead>
                <tbody>
                  {absensi.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="p-4 text-center text-gray-500">Tidak ada target staff untuk kegiatan ini.</td>
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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Upload Foto Ke Google Drive (Opsional)</label>
          <input
            type="file"
            accept="image/*"
            disabled={isUploading}
            onChange={handlePhotoUpload}
            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
          />
          {isUploading && (
              <p className="text-sm text-blue-600 mt-2 font-medium animate-pulse">Sedang mengunggah foto ke Google Drive...</p>
          )}
          {fotoUrl && !isUploading && (
            <div className="mt-4">
              <span className="text-xs text-green-600 mb-1 block">✓ Foto berhasil tersimpan di GDrive</span>
              <img src={fotoUrl} alt="Preview" className="h-40 object-cover rounded-lg border border-gray-200" />
            </div>
          )}
        </div>

        <div className="flex justify-end pt-4 border-t border-gray-100">
          <button
            type="submit"
            disabled={isUploading}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-2 px-6 rounded-lg transition-colors"
          >
            {isUploading ? 'Menunggu Upload...' : 'Simpan Kegiatan'}
          </button>
        </div>
      </form>
    </div>
  );
};

