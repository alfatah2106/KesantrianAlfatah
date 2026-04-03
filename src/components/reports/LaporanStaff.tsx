import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { getLocalData } from '../../lib/storage';
import { MASTER_STAFF } from '../../data/mock';
import { format, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';

export const LaporanStaff: React.FC = () => {
  const { genderFilter } = useAppContext();
  
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [staffId, setStaffId] = useState('');
  const [reportData, setReportData] = useState<any>(null);

  const availableStaff = MASTER_STAFF.filter(s => 
    genderFilter === 'Semua' || s.gender === genderFilter
  );

  const handleGenerate = () => {
    if (!dateFrom || !dateTo || !staffId) return;

    const allData = getLocalData();
    const staff = MASTER_STAFF.find(s => s.id === staffId);
    if (!staff) return;

    const from = new Date(dateFrom).getTime();
    const to = new Date(dateTo).getTime() + 86400000;

    const kegiatanDipimpin: any[] = [];
    const absensiStaff: any[] = [];
    const photos: any[] = [];

    // Table 1: Kegiatan yang dipimpin oleh staff ini
    allData.kegiatanRecords.forEach(record => {
      const recordTime = new Date(record.waktu).getTime();
      if (recordTime >= from && recordTime <= to) {
        if (record.staffId === staffId) {
          kegiatanDipimpin.push(record);
          if (record.fotoUrl) {
            photos.push({ url: record.fotoUrl, caption: `${record.kegiatanName} - ${format(parseISO(record.waktu), 'dd MMM yyyy')}` });
          }
        }
        
        // Table 2: Absensi staff ini di kegiatan apapun
        const absensi = record.absensi.find(a => a.targetId === staffId);
        if (absensi) {
          absensiStaff.push({
            tanggal: record.waktu,
            kegiatan: record.kegiatanName,
            kehadiran: absensi.kehadiran,
            nilai: absensi.nilai
          });
        }
      }
    });

    setReportData({ kegiatanDipimpin, absensiStaff, photos, staffName: staff.name });
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-6 print:hidden">
        <h2 className="text-xl font-semibold text-gray-800">Laporan Staff</h2>
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
          <label className="block text-sm font-medium text-gray-700 mb-1">Nama Staff</label>
          <select value={staffId} onChange={e => setStaffId(e.target.value)} className="w-full border rounded-lg px-3 py-2">
            <option value="">-- Pilih Staff --</option>
            {availableStaff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div className="md:col-span-3 flex justify-end">
          <button onClick={handleGenerate} className="bg-blue-600 text-white px-6 py-2 rounded-lg">Generate Report</button>
        </div>
      </div>

      {reportData && (
        <div className="print:block space-y-8">
          <div className="text-center hidden print:block mb-6">
            <h1 className="text-2xl font-bold">Laporan Kinerja Staff</h1>
            <p className="text-gray-600">Nama: {reportData.staffName} | Periode: {dateFrom} s/d {dateTo}</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">1. Daftar Kegiatan yang Dipimpin</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse border border-gray-200 text-sm min-w-[600px]">
                <thead>
                  <tr className="bg-gray-50 text-gray-700">
                    <th className="p-2 border border-gray-200">Kegiatan</th>
                    <th className="p-2 border border-gray-200">Hari</th>
                    <th className="p-2 border border-gray-200">Tanggal</th>
                    <th className="p-2 border border-gray-200">Jam</th>
                    <th className="p-2 border border-gray-200">Email Pelapor</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.kegiatanDipimpin.map((row: any, i: number) => {
                    const date = parseISO(row.waktu);
                    return (
                      <tr key={i} className="border-b border-gray-200">
                        <td className="p-2 border border-gray-200">{row.kegiatanName}</td>
                        <td className="p-2 border border-gray-200">{format(date, 'EEEE', { locale: id })}</td>
                        <td className="p-2 border border-gray-200">{format(date, 'dd MMM yyyy', { locale: id })}</td>
                        <td className="p-2 border border-gray-200">{format(date, 'HH:mm')}</td>
                        <td className="p-2 border border-gray-200">{row.email}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">2. Kehadiran Staff</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse border border-gray-200 text-sm min-w-[600px]">
                <thead>
                  <tr className="bg-gray-50 text-gray-700">
                    <th className="p-2 border border-gray-200">Tanggal</th>
                    <th className="p-2 border border-gray-200">Kegiatan</th>
                    <th className="p-2 border border-gray-200 text-center">S</th>
                    <th className="p-2 border border-gray-200 text-center">I</th>
                    <th className="p-2 border border-gray-200 text-center">A</th>
                    <th className="p-2 border border-gray-200 text-center">H</th>
                    <th className="p-2 border border-gray-200 text-center">Nilai</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.absensiStaff.map((row: any, i: number) => (
                    <tr key={i} className="border-b border-gray-200">
                      <td className="p-2 border border-gray-200">{format(parseISO(row.tanggal), 'dd MMM yyyy', { locale: id })}</td>
                      <td className="p-2 border border-gray-200">{row.kegiatan}</td>
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

          {reportData.photos.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">3. Lampiran Foto</h3>
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
