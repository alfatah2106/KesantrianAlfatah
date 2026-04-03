import React, { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';
import { getLocalData } from '../../lib/storage';
import { useAppContext } from '../../context/AppContext';
import { MASTER_KEGIATAN } from '../../data/mock';

export const JurnalKalender: React.FC = () => {
  const { genderFilter } = useAppContext();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [data, setData] = useState<any>({ kegiatanRecords: [], supervisiRecords: [] });

  useEffect(() => {
    const allData = getLocalData();
    const filteredKegiatan = allData.kegiatanRecords.filter(
      (r: any) => genderFilter === 'Semua' || r.gender === genderFilter
    );
    const filteredSupervisi = allData.supervisiRecords.filter(
      (r: any) => genderFilter === 'Semua' || r.gender === genderFilter
    );
    setData({ kegiatanRecords: filteredKegiatan, supervisiRecords: filteredSupervisi });
  }, [genderFilter, currentMonth]);

  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth)
  });

  const getDayStats = (date: Date) => {
    const kToday = data.kegiatanRecords.filter((r: any) => isSameDay(parseISO(r.waktu), date));
    const sToday = data.supervisiRecords.filter((r: any) => isSameDay(parseISO(r.waktu), date));
    
    // Planned activities filtered by gender
    const plannedActivities = MASTER_KEGIATAN.filter(
      k => genderFilter === 'Semua' || k.gender === genderFilter
    );
    const planned = plannedActivities.length;
    const actual = new Set([...kToday.map((k:any) => k.kegiatanId), ...sToday.map((s:any) => s.kegiatanId)]).size;
    const unreported = planned - actual;

    return {
      planned,
      actual,
      unreported,
      kegiatanList: kToday,
      supervisiList: sToday
    };
  };

  const selectedStats = getDayStats(selectedDate);

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-6 print:hidden">
        <h2 className="text-xl font-semibold text-gray-800">Jurnal Kalender</h2>
        <div className="flex gap-4 items-center">
          <input 
            type="month" 
            value={format(currentMonth, 'yyyy-MM')}
            onChange={(e) => {
              const newDate = new Date(e.target.value);
              setCurrentMonth(newDate);
              setSelectedDate(newDate);
            }}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none"
          />
          <button onClick={() => window.print()} className="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm">
            Print Jurnal
          </button>
        </div>
      </div>

      <div className="mb-6 text-center hidden print:block">
        <h1 className="text-2xl font-bold">Jurnal Kegiatan Kesantrian</h1>
        <p className="text-gray-600">Bulan: {format(currentMonth, 'MMMM yyyy', { locale: id })} | Filter: {genderFilter}</p>
      </div>

      <div className="grid grid-cols-7 gap-1 sm:gap-4 mb-8">
        {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map(day => (
          <div key={day} className="text-center font-semibold text-gray-600 py-2 border-b text-xs sm:text-base">
            {day}
          </div>
        ))}
        
        {/* Empty cells for offset */}
        {Array.from({ length: startOfMonth(currentMonth).getDay() }).map((_, i) => (
          <div key={`empty-${i}`} className="p-2 sm:p-4 border border-transparent"></div>
        ))}

        {daysInMonth.map(date => {
          const isSelected = isSameDay(date, selectedDate);
          const isToday = isSameDay(date, new Date());
          const stats = getDayStats(date);
          const hasData = stats.actual > 0;
          
          return (
            <button 
              key={date.toISOString()} 
              onClick={() => setSelectedDate(date)}
              className={`min-h-[60px] sm:min-h-[80px] p-1 sm:p-2 border rounded-lg flex flex-col items-center justify-center transition-all relative
                ${isSelected ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' : 'border-gray-200 hover:bg-gray-50'}
              `}
            >
              <span className={`text-sm sm:text-lg ${isToday ? 'text-blue-600 font-bold' : 'text-gray-700 font-medium'}`}>
                {format(date, 'd')}
              </span>
              {hasData && (
                <span className="absolute bottom-1 sm:bottom-2 w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-green-500"></span>
              )}
            </button>
          );
        })}
      </div>

      {/* Detail Section */}
      <div className="border-t border-gray-200 pt-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-6">
          Detail Tanggal: <span className="text-blue-600">{format(selectedDate, 'dd MMMM yyyy', { locale: id })}</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 text-center">
            <div className="text-sm font-medium text-gray-500 mb-1">Rencana Kegiatan</div>
            <div className="text-3xl font-bold text-gray-800">{selectedStats.planned}</div>
          </div>
          <div className="bg-green-50 p-6 rounded-xl border border-green-100 text-center">
            <div className="text-sm font-medium text-green-600 mb-1">Terlaksana</div>
            <div className="text-3xl font-bold text-green-700">{selectedStats.actual}</div>
          </div>
          <div className="bg-red-50 p-6 rounded-xl border border-red-100 text-center">
            <div className="text-sm font-medium text-red-600 mb-1">Belum Dilaporkan</div>
            <div className="text-3xl font-bold text-red-700">{selectedStats.unreported}</div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <h4 className="font-semibold text-gray-800">Daftar Laporan Masuk</h4>
          </div>
          <div className="p-6">
            {selectedStats.kegiatanList.length === 0 && selectedStats.supervisiList.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Tidak ada laporan kegiatan atau supervisi pada tanggal ini.
              </div>
            ) : (
              <ul className="space-y-4">
                {selectedStats.kegiatanList.map((k: any, i: number) => (
                  <li key={`k-${i}`} className="flex items-start gap-4 p-4 rounded-lg bg-gray-50 border border-gray-100">
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold mt-0.5">Kegiatan</span>
                    <div>
                      <p className="font-medium text-gray-800">{k.kegiatanName}</p>
                      <p className="text-sm text-gray-600 mt-1">Dilaporkan oleh: <span className="font-medium">{k.staffName}</span></p>
                      {k.catatan && <p className="text-sm text-gray-500 mt-2 italic">"{k.catatan}"</p>}
                    </div>
                  </li>
                ))}
                {selectedStats.supervisiList.map((s: any, i: number) => (
                  <li key={`s-${i}`} className="flex items-start gap-4 p-4 rounded-lg bg-gray-50 border border-gray-100">
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold mt-0.5">Supervisi</span>
                    <div>
                      <p className="font-medium text-gray-800">{s.kegiatanName}</p>
                      <p className="text-sm text-gray-600 mt-1">Disupervisi oleh: <span className="font-medium">{s.staffName}</span></p>
                      <p className="text-sm text-gray-600">Kelompok: <span className="font-medium">{s.kelompok}</span></p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
