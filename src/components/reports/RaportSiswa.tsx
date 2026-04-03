import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { fetchSiswa } from '../../lib/api';
import { format, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';

export const RaportSiswa: React.FC = () => {
  const { genderFilter } = useAppContext();
  
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [kelas, setKelas] = useState('');
  const [siswaId, setSiswaId] = useState('');
  const [reportData, setReportData] = useState<any[] | null>(null);

  const [masterSiswa, setMasterSiswa] = useState<any[]>([]);
  const [kelasList, setKelasList] = useState<string[]>([]);
  
  useEffect(() => {
    const loadSiswa = async () => {
      try {
        const sw = await fetchSiswa();
        setMasterSiswa(sw);
        const uniqueKelas = Array.from(new Set(sw.map((s: any) => s.kelas))) as string[];
        setKelasList(uniqueKelas.sort());
      } catch (e) {
        console.error(e);
      }
    };
    loadSiswa();
  }, []);

  const availableSiswa = masterSiswa.filter(s => 
    (genderFilter === 'Semua' || s.gender === genderFilter) &&
    (kelas === '' || s.kelas === kelas)
  );

  const handleGenerate = async () => {
    if (!dateFrom || !dateTo || !siswaId) return;

    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE || ""}/records/supervisi`);
      const supervisiRecords = await res.json();
      
      const siswa = masterSiswa.find(s => s.id === siswaId);
      if (!siswa) return;

      const from = new Date(dateFrom).getTime();
      const to = new Date(dateTo).getTime() + 86400000; // include end date

      const results: any[] = [];

      supervisiRecords.forEach((record: any) => {
        const recordTime = new Date(record.waktu).getTime();
        if (recordTime >= from && recordTime <= to) {
          const absensiList = typeof record.absensi === 'string' ? JSON.parse(record.absensi) : record.absensi;
          if (Array.isArray(absensiList)) {
            const absensi = absensiList.find(a => a.targetId === siswaId);
            if (absensi) {
              results.push({
                tanggal: record.waktu,
                kegiatan: record.kegiatan_name || record.kegiatanName,
                kehadiran: absensi.kehadiran,
                nilai: absensi.nilai
              });
            }
          }
        }
      });

      setReportData(results.sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime()));
    } catch (e) {
      console.error(e);
      alert('Gagal mengambil report data');
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-6 print:hidden">
        <h2 className="text-xl font-semibold text-gray-800">Raport Siswa</h2>
        <button onClick={() => window.print()} className="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm">
          Print Raport
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 print:hidden">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Dari Tanggal</label>
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="w-full border rounded-lg px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Sampai Tanggal</label>
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="w-full border rounded-lg px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Kelas</label>
          <select value={kelas} onChange={e => setKelas(e.target.value)} className="w-full border rounded-lg px-3 py-2">
            <option value="">Semua Kelas</option>
            {kelasList.map((k: string) => <option key={k} value={k}>{k}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nama Siswa</label>
          <select value={siswaId} onChange={e => setSiswaId(e.target.value)} className="w-full border rounded-lg px-3 py-2">
            <option value="">-- Pilih Siswa --</option>
            {availableSiswa.map(s => <option key={s.id} value={s.id}>{s.name} ({s.kelas})</option>)}
          </select>
        </div>
        <div className="md:col-span-4 flex justify-end">
          <button onClick={handleGenerate} className="bg-blue-600 text-white px-6 py-2 rounded-lg">Generate Report</button>
        </div>
      </div>

      {reportData && (
        <div className="print:block">
          <div className="mb-6 text-center hidden print:block">
            <h1 className="text-2xl font-bold">Raport Kegiatan Siswa</h1>
            <p className="text-gray-600">
              Nama: {masterSiswa.find(s => s.id === siswaId)?.name} | 
              Kelas: {masterSiswa.find(s => s.id === siswaId)?.kelas}
            </p>
            <p className="text-gray-500 text-sm">Periode: {dateFrom} s/d {dateTo}</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse border border-gray-200 min-w-[600px]">
              <thead>
                <tr className="bg-gray-50 text-gray-700 text-sm">
                  <th className="p-3 border border-gray-200">Tanggal</th>
                  <th className="p-3 border border-gray-200">Kegiatan</th>
                  <th className="p-3 border border-gray-200 text-center">S</th>
                  <th className="p-3 border border-gray-200 text-center">I</th>
                  <th className="p-3 border border-gray-200 text-center">A</th>
                  <th className="p-3 border border-gray-200 text-center">H</th>
                  <th className="p-3 border border-gray-200 text-center">Nilai</th>
                </tr>
              </thead>
              <tbody>
                {reportData.length === 0 ? (
                  <tr><td colSpan={7} className="p-4 text-center text-gray-500">Tidak ada data di periode ini.</td></tr>
                ) : (
                  reportData.map((row, i) => (
                    <tr key={i} className="border-b border-gray-200 text-sm">
                      <td className="p-3 border border-gray-200">{format(parseISO(row.tanggal), 'dd MMM yyyy', { locale: id })}</td>
                      <td className="p-3 border border-gray-200">{row.kegiatan}</td>
                      <td className="p-3 border border-gray-200 text-center">{row.kehadiran === 'Sakit' ? '✓' : ''}</td>
                      <td className="p-3 border border-gray-200 text-center">{row.kehadiran === 'Izin' ? '✓' : ''}</td>
                      <td className="p-3 border border-gray-200 text-center">{row.kehadiran === 'Alfa' ? '✓' : ''}</td>
                      <td className="p-3 border border-gray-200 text-center">{row.kehadiran === 'Hadir' ? '✓' : ''}</td>
                      <td className="p-3 border border-gray-200 text-center font-medium">{row.nilai}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

