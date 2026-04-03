import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { fetchKegiatan } from '../../lib/api';
import { format, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';

export const LaporanKegiatan: React.FC = () => {
  const { genderFilter } = useAppContext();
  
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [kegiatanId, setKegiatanId] = useState('');
  const [reportData, setReportData] = useState<any>(null);

  const [masterKegiatan, setMasterKegiatan] = useState<any[]>([]);

  useEffect(() => {
    fetchKegiatan().then(setMasterKegiatan).catch(console.error);
  }, []);

  const availableKegiatan = masterKegiatan.filter(
    k => genderFilter === 'Semua' || k.gender === genderFilter
  );

  const handleGenerate = async () => {
    if (!dateFrom || !dateTo || !kegiatanId) return;

    try {
      const [resKeg, resSup] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_BASE || ""}/records/kegiatan`).then(r => r.json()),
        fetch(`${import.meta.env.VITE_API_BASE || ""}/records/supervisi`).then(r => r.json()),
      ]);

      const kegiatan = availableKegiatan.find(k => k.id === kegiatanId);
      if (!kegiatan) return;

      const from = new Date(dateFrom).getTime();
      const to = new Date(dateTo).getTime() + 86400000;

      const kegiatanList: any[] = [];
      const supervisiStaff: any[] = [];
      const supervisiSiswa: any[] = [];
      const supervisiSop: any[] = [];
      const photos: any[] = [];

      resKeg.forEach((record: any) => {
        const recordTime = new Date(record.waktu).getTime();
        const recKegId = record.kegiatanId || record.kegiatan_id;
        if (recordTime >= from && recordTime <= to && recKegId === kegiatanId && (genderFilter === 'Semua' || record.gender === genderFilter)) {
          
          const absensiList = typeof record.absensi === 'string' ? JSON.parse(record.absensi) : record.absensi;
          const hadirCount = Array.isArray(absensiList) ? absensiList.filter((a: any) => a.kehadiran === 'Hadir').length : 0;

          kegiatanList.push({
            tanggal: record.waktu,
            staff: record.staff_name || record.staffName,
            catatan: record.catatan,
            hadirRatio: Array.isArray(absensiList) ? `${hadirCount}/${absensiList.length}` : '0/0'
          });
          
          if (Array.isArray(absensiList)) {
            absensiList.forEach((a: any) => {
              supervisiStaff.push({
                tanggal: record.waktu,
                nama: a.targetName,
                kehadiran: a.kehadiran,
                nilai: a.nilai
              });
            });
          }

          if (record.foto_url || record.fotoUrl) {
            photos.push({ url: record.foto_url || record.fotoUrl, caption: `${record.kegiatan_name || record.kegiatanName} - ${format(parseISO(record.waktu), 'dd MMM yyyy')}` });
          }
        }
      });

      resSup.forEach((record: any) => {
        const recordTime = new Date(record.waktu).getTime();
        const recKegId = record.kegiatanId || record.kegiatan_id;
        if (recordTime >= from && recordTime <= to && recKegId === kegiatanId && (genderFilter === 'Semua' || record.gender === genderFilter)) {
          
          const absensiList = typeof record.absensi === 'string' ? JSON.parse(record.absensi) : record.absensi;
          if (Array.isArray(absensiList)) {
            absensiList.forEach((a: any) => {
              supervisiSiswa.push({
                tanggal: record.waktu,
                nama: a.targetName,
                kelompok: record.kelompok,
                kehadiran: a.kehadiran,
                nilai: a.nilai
              });
            });
          }

          const sopList = typeof record.sop_checklist === 'string' ? JSON.parse(record.sop_checklist) : (record.sop_checklist || record.sopChecklist);
          if (Array.isArray(sopList)) {
            const checkedCount = sopList.filter((s: any) => s.checked).length;
            const totalSop = sopList.length;
            const percentage = totalSop > 0 ? Math.round((checkedCount / totalSop) * 100) : 0;
            
            supervisiSop.push({
              tanggal: record.waktu,
              staff: record.staff_name || record.staffName,
              kelompok: record.kelompok,
              percentage: `${percentage}% (${checkedCount}/${totalSop})`
            });
          }
        }
      });

      setReportData({ kegiatanList, supervisiStaff, supervisiSiswa, supervisiSop, photos, kegiatanName: kegiatan.name });

    } catch(err) {
      console.error(err);
      alert('Gagal mengambil laporan kegiatan');
    }
  };


  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-6 print:hidden">
        <h2 className="text-xl font-semibold text-gray-800">Laporan Kegiatan</h2>
        <button onClick={() => window.print()} className="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm">
          Print Laporan
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 print:hidden">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Dari Tanggal</label>
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="w-full border rounded-lg px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Sampai Tanggal</label>
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="w-full border rounded-lg px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Kegiatan</label>
          <select value={kegiatanId} onChange={e => setKegiatanId(e.target.value)} className="w-full border rounded-lg px-3 py-2">
            <option value="">-- Pilih Kegiatan --</option>
            {availableKegiatan.map(k => <option key={k.id} value={k.id}>{k.name}</option>)}
          </select>
        </div>
        <div className="md:col-span-3 flex justify-end">
          <button onClick={handleGenerate} className="bg-blue-600 text-white px-6 py-2 rounded-lg">Generate Report</button>
        </div>
      </div>

      {reportData && (
        <div className="print:block space-y-8">
          <div className="text-center hidden print:block mb-6">
            <h1 className="text-2xl font-bold">Laporan Pelaksanaan Kegiatan</h1>
            <p className="text-gray-600">Kegiatan: {reportData.kegiatanName} | Periode: {dateFrom} s/d {dateTo}</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">1. Laporan Kegiatan (Staff)</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse border border-gray-200 text-sm min-w-[600px]">
                <thead>
                  <tr className="bg-gray-50 text-gray-700">
                    <th className="p-2 border border-gray-200">Tanggal</th>
                    <th className="p-2 border border-gray-200">Staff Penanggung Jawab</th>
                    <th className="p-2 border border-gray-200">Catatan</th>
                    <th className="p-2 border border-gray-200 text-center">Hadir / Total</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.kegiatanList.map((row: any, i: number) => (
                    <tr key={i} className="border-b border-gray-200">
                      <td className="p-2 border border-gray-200">{format(parseISO(row.tanggal), 'dd MMM yyyy', { locale: id })}</td>
                      <td className="p-2 border border-gray-200">{row.staff}</td>
                      <td className="p-2 border border-gray-200">{row.catatan}</td>
                      <td className="p-2 border border-gray-200 text-center">{row.hadirRatio}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">2. Supervisi Staff</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse border border-gray-200 text-sm min-w-[600px]">
                <thead>
                  <tr className="bg-gray-50 text-gray-700">
                    <th className="p-2 border border-gray-200">Tanggal</th>
                    <th className="p-2 border border-gray-200">Nama Staff</th>
                    <th className="p-2 border border-gray-200 text-center">S</th>
                    <th className="p-2 border border-gray-200 text-center">I</th>
                    <th className="p-2 border border-gray-200 text-center">A</th>
                    <th className="p-2 border border-gray-200 text-center">H</th>
                    <th className="p-2 border border-gray-200 text-center">Nilai</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.supervisiStaff.map((row: any, i: number) => (
                    <tr key={i} className="border-b border-gray-200">
                      <td className="p-2 border border-gray-200">{format(parseISO(row.tanggal), 'dd MMM yyyy', { locale: id })}</td>
                      <td className="p-2 border border-gray-200">{row.nama}</td>
                      <td className="p-2 border border-gray-200 text-center">{row.kehadiran === 'Sakit' ? '✓' : ''}</td>
                      <td className="p-2 border border-gray-200 text-center">{row.kehadiran === 'Izin' ? '✓' : ''}</td>
                      <td className="p-2 border border-gray-200 text-center">{row.kehadiran === 'Alfa' ? '✓' : ''}</td>
                      <td className="p-2 border border-gray-200 text-center">{row.kehadiran === 'Hadir' ? '✓' : ''}</td>
                      <td className="p-2 border border-gray-200 text-center">{row.nilai}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">3. Supervisi Siswa</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse border border-gray-200 text-sm min-w-[600px]">
                <thead>
                  <tr className="bg-gray-50 text-gray-700">
                    <th className="p-2 border border-gray-200">Tanggal</th>
                    <th className="p-2 border border-gray-200">Nama Siswa</th>
                    <th className="p-2 border border-gray-200">Kelompok</th>
                    <th className="p-2 border border-gray-200 text-center">S</th>
                    <th className="p-2 border border-gray-200 text-center">I</th>
                    <th className="p-2 border border-gray-200 text-center">A</th>
                    <th className="p-2 border border-gray-200 text-center">H</th>
                    <th className="p-2 border border-gray-200 text-center">Nilai</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.supervisiSiswa.map((row: any, i: number) => (
                    <tr key={i} className="border-b border-gray-200">
                      <td className="p-2 border border-gray-200">{format(parseISO(row.tanggal), 'dd MMM yyyy', { locale: id })}</td>
                    <td className="p-2 border border-gray-200">{row.nama}</td>
                    <td className="p-2 border border-gray-200">{row.kelompok}</td>
                    <td className="p-2 border border-gray-200 text-center">{row.kehadiran === 'Sakit' ? '✓' : ''}</td>
                    <td className="p-2 border border-gray-200 text-center">{row.kehadiran === 'Izin' ? '✓' : ''}</td>
                    <td className="p-2 border border-gray-200 text-center">{row.kehadiran === 'Alfa' ? '✓' : ''}</td>
                    <td className="p-2 border border-gray-200 text-center">{row.kehadiran === 'Hadir' ? '✓' : ''}</td>
                    <td className="p-2 border border-gray-200 text-center">{row.nilai}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">4. Supervisi SOP Kegiatan</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse border border-gray-200 text-sm min-w-[600px]">
                <thead>
                  <tr className="bg-gray-50 text-gray-700">
                    <th className="p-2 border border-gray-200">Tanggal</th>
                    <th className="p-2 border border-gray-200">Staff Penanggung Jawab</th>
                    <th className="p-2 border border-gray-200">Kelompok</th>
                    <th className="p-2 border border-gray-200 text-center">Persentase SOP</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.supervisiSop.map((row: any, i: number) => (
                    <tr key={i} className="border-b border-gray-200">
                      <td className="p-2 border border-gray-200">{format(parseISO(row.tanggal), 'dd MMM yyyy', { locale: id })}</td>
                      <td className="p-2 border border-gray-200">{row.staff}</td>
                      <td className="p-2 border border-gray-200">{row.kelompok}</td>
                      <td className="p-2 border border-gray-200 text-center font-medium">{row.percentage}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {reportData.photos.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">5. Lampiran Foto</h3>
              <div className="grid grid-cols-2 gap-4">
                {reportData.photos.map((photo: any, i: number) => (
                  <div key={i} className="border border-gray-200 p-2 rounded-lg break-inside-avoid">
                    <img src={photo.url} alt="Lampiran" className="w-full h-48 object-cover rounded mb-2" />
                    <p className="text-xs text-center text-gray-600">{photo.caption}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
