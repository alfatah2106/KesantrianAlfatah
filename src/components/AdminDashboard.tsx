import React, { useState, useEffect, useMemo } from 'react';
import { fetchStaff, fetchSiswa, fetchKegiatan, addStaff, updateStaff, deleteStaff, addSiswa, updateSiswa, deleteSiswa, addKegiatan, updateKegiatan, deleteKegiatan, uploadToGDrive } from '../lib/api';
import { Staff, Siswa, MasterKegiatan } from '../types';

import { AgGridReact } from 'ag-grid-react';
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

ModuleRegistry.registerModules([AllCommunityModule]);

export const AdminDashboard: React.FC = () => {
    const [view, setView] = useState<'staff' | 'siswa' | 'kegiatan'>('staff');
    const [staffs, setStaffs] = useState<Staff[]>([]);
    const [siswas, setSiswas] = useState<Siswa[]>([]);
    const [kegiatans, setKegiatans] = useState<MasterKegiatan[]>([]);
    const [loading, setLoading] = useState(true);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editItem, setEditItem] = useState<any>(null);

    const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
    const [bulkData, setBulkData] = useState('');
    const [parsedData, setParsedData] = useState<any[]>([]);
    
    const [isUploading, setIsUploading] = useState(false);

    const [classFilter, setClassFilter] = useState('');
    const [genderFilter, setGenderFilter] = useState<'Semua' | 'Putra' | 'Putri'>('Semua');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        const [st, sw, kg] = await Promise.all([fetchStaff(), fetchSiswa(), fetchKegiatan()]);
        setStaffs(st);
        setSiswas(sw);
        setKegiatans(kg);
        setLoading(false);
    };

    const handleDelete = async (type: 'staff' | 'siswa' | 'kegiatan', id: string) => {
        if (!confirm('Apakah Anda yakin ingin menghapus data ini?')) return;
        
        if (type === 'staff') await deleteStaff(id);
        else if (type === 'siswa') await deleteSiswa(id);
        else if (type === 'kegiatan') await deleteKegiatan(id);
        
        loadData();
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData.entries());

        try {
            if (view === 'staff') {
                const payload = { ...data, gender: data.gender as any };
                if (editItem) await updateStaff(editItem.id, payload);
                else await addStaff({ id: `st-${Date.now()}`, ...payload });
            } else if (view === 'siswa') {
                const payload = { ...data, gender: data.gender as any };
                if (editItem) await updateSiswa(editItem.id, payload);
                else await addSiswa({ id: `sw-${Date.now()}`, ...payload });
            } else if (view === 'kegiatan') {
                const payload = { 
                    ...data, 
                    gender: data.gender as any,
                    sops: (data.sops as string).split(',').map(s => s.trim()),
                    target_staff_ids: formData.getAll('staff_check') as string[],
                    target_kelompok: formData.getAll('kelompok_check') as string[],
                    tipe: data.tipe as any,
                    hari: formData.getAll('hari_check').join(','),
                    pekan: formData.getAll('pekan_check').join(',')
                };
                if (editItem) await updateKegiatan(editItem.id, payload);
                else await addKegiatan({ id: `kg-${Date.now()}`, ...payload });
            }
            setIsModalOpen(false);
            setEditItem(null);
            loadData();
        } catch (err) {
            alert('Gagal menyimpan data');
        }
    };

    const parsePastedData = (val: string) => {
        setBulkData(val);
        const rows = val.split('\n').filter(r => r.trim() !== '');
        const items = rows.map((row, i) => {
            const cols = row.split('\t').map(c => c.trim());
            if (view === 'staff') {
                return { name: cols[0], email: cols[1], gender: cols[2] || 'Putra', photo_url: cols[3] || '' };
            } else if (view === 'siswa') {
                return { name: cols[0], kelas: cols[1], kelompok: cols[2], gender: cols[3] || 'Putra', photo_url: cols[4] || '' };
            } else if (view === 'kegiatan' && cols.length >= 7) {
                   const payload = {
                       id: `kg-${Date.now()}-${i}`,
                       name: cols[0], gender: cols[1] === 'Putra' ? 'Putra' : 'Putri',
                       sops: cols[2] || '',
                       target_staff_ids: cols[3] || '',
                       target_kelompok: cols[4] || '',
                       tipe: cols[5] || 'Rutin',
                       hari: cols[6] || '',
                       pekan: cols[7] || ''
                   };
                   return addKegiatan(payload as any);
                }
            return {};
        });
        setParsedData(items);
    };

    const colDefs = useMemo(() => {
        if (view === 'staff') {
            return [
                { field: 'name', headerName: 'Nama Staff', editable: true, flex: 1 },
                { field: 'email', headerName: 'Email', editable: true, flex: 1 },
                { field: 'gender', headerName: 'Gender', editable: true, flex: 1 },
                { field: 'photo_url', headerName: 'Link Foto', editable: true, flex: 1 },
            ];
        } else if (view === 'siswa') {
            return [
                { field: 'name', headerName: 'Nama Siswa', editable: true, flex: 1 },
                { field: 'kelas', headerName: 'Kelas', editable: true, flex: 1 },
                { field: 'kelompok', headerName: 'Kelompok', editable: true, flex: 1 },
                { field: 'gender', headerName: 'Gender', editable: true, flex: 1 },
                { field: 'photo_url', headerName: 'Link Foto', editable: true, flex: 1 },
            ];
        } else {
            return [
                { field: 'name', headerName: 'Nama Kegiatan', editable: true, flex: 1 },
                { field: 'gender', headerName: 'Gender', editable: true, flex: 1 },
                { field: 'tipe', headerName: 'Tipe', editable: true, flex: 1 },
                { field: 'hari', headerName: 'Hari (1-7)', editable: true, flex: 1 },
                { field: 'pekan', headerName: 'Pekan (1-5)', editable: true, flex: 1 },
                { field: 'sops', headerName: 'SOP', editable: true, flex: 1 },
                { field: 'target_staff_ids', headerName: 'Target Staff ID', editable: true, flex: 1 },
                { field: 'target_kelompok', headerName: 'Target Kelompok', editable: true, flex: 1 },
            ];
        }
    }, [view]);

    const handleBulkSave = async () => {
        if (parsedData.length === 0) return;
        
        try {
            setLoading(true);
            const promises = parsedData.map(async (item, i) => {
                if (view === 'staff') {
                   return addStaff({
                       id: `st-${Date.now()}-${i}`,
                       ...item
                   } as any);
                } else if (view === 'siswa') {
                   return addSiswa({
                       id: `sw-${Date.now()}-${i}`,
                       ...item
                   } as any);
                } else if (view === 'kegiatan') {
                   return addKegiatan({
                       id: `kg-${Date.now()}-${i}`,
                       name: item.name,
                       gender: item.gender,
                       tipe: item.tipe,
                       hari: item.hari,
                       pekan: item.pekan,
                       sops: String(item.sops).split(',').map((s:string) => s.trim()),
                       target_staff_ids: String(item.target_staff_ids).split(',').map((s:string) => s.trim()),
                       target_kelompok: String(item.target_kelompok).split(',').map((s:string) => s.trim())
                   } as any);
                }
            });
            await Promise.all(promises);
            setIsBulkModalOpen(false);
            setBulkData('');
            setParsedData([]);
            loadData();
        } catch (err) {
            alert('Beberapa data mungkin gagal diupload massal');
            loadData();
        }
    };

    const filteredData = useMemo(() => {
        if (view === 'staff') {
            return staffs.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()));
        }
        if (view === 'siswa') {
            return siswas.filter(s => {
                const matchName = s.name.toLowerCase().includes(searchQuery.toLowerCase());
                const matchClass = classFilter === '' || s.kelas === classFilter;
                const matchGender = genderFilter === 'Semua' || s.gender === genderFilter;
                return matchName && matchClass && matchGender;
            });
        }
        if (view === 'kegiatan') {
            return kegiatans.filter(k => {
                const matchName = k.name.toLowerCase().includes(searchQuery.toLowerCase());
                const matchGender = genderFilter === 'Semua' || k.gender === genderFilter;
                return matchName && matchGender;
            });
        }
        return [];
    }, [view, staffs, siswas, kegiatans, searchQuery, classFilter, genderFilter]);

    const uniqueClasses = useMemo(() => {
        return Array.from(new Set(siswas.map(s => s.kelas))).filter(c => c).sort();
    }, [siswas]);

    if (loading) return <div className="p-8 text-center flex items-center justify-center min-h-screen text-gray-500 font-medium">Memuat Data Master Admin...</div>;


    return (
        <div className="min-h-screen bg-gray-50 flex flex-col p-8">
            <div className="max-w-[1400px] mx-auto w-full space-y-8 flex-1 flex flex-col">
                <header className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight text-center sm:text-left">Data Master Admin</h1>
                    <div className="flex bg-white rounded-lg shadow-sm border p-1 scale-90 sm:scale-100">
                        <button 
                            onClick={() => setView('staff')}
                            className={`px-4 py-2 rounded-md font-medium transition-all ${view === 'staff' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}
                        >
                            Staff
                        </button>
                        <button 
                            onClick={() => setView('siswa')}
                            className={`px-4 py-2 rounded-md font-medium transition-all ${view === 'siswa' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}
                        >
                            Siswa
                        </button>
                        <button 
                            onClick={() => setView('kegiatan')}
                            className={`px-4 py-2 rounded-md font-medium transition-all ${view === 'kegiatan' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}
                        >
                            Kegiatan
                        </button>
                    </div>
                </header>

                <div className="mb-6 flex flex-col sm:flex-row justify-end gap-3 px-2">
                    <button 
                        onClick={() => { setBulkData(''); setParsedData([]); setIsBulkModalOpen(true); }}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2.5 rounded-lg shadow-lg hover:shadow-xl transition-all font-semibold flex items-center justify-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                        Upload Massal (Excel Paste)
                    </button>
                    <button 
                        onClick={() => { setEditItem(null); setIsModalOpen(true); }}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-lg shadow-lg hover:shadow-xl transition-all font-semibold flex items-center justify-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
                        Tambah Manual
                    </button>
                </div>

                <div className="flex flex-wrap gap-4 items-center bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex-1 min-w-[200px]">
                        <input 
                            type="text" 
                            placeholder={`Cari ${view}...`}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    
                    {(view === 'siswa' || view === 'kegiatan') && (
                        <select 
                            value={genderFilter} 
                            onChange={(e) => setGenderFilter(e.target.value as any)}
                            className="px-4 py-2 bg-gray-50 border border-gray-100 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="Semua">Semua Gender</option>
                            <option value="Putra">Putra</option>
                            <option value="Putri">Putri</option>
                        </select>
                    )}

                    {view === 'siswa' && (
                        <select 
                            value={classFilter} 
                            onChange={(e) => setClassFilter(e.target.value)}
                            className="px-4 py-2 bg-gray-50 border border-gray-100 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Semua Kelas</option>
                            {uniqueClasses.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    )}
                </div>

                <div className="bg-white rounded-2xl shadow-xl shadow-gray-100 border border-gray-100 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/50 border-b border-gray-100">
                            <tr>
                                {view === 'staff' && (
                                    <>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Nama</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Email</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Gender</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Aksi</th>
                                    </>
                                )}
                                {view === 'siswa' && (
                                    <>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Nama</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Kelas</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Kelompok</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Gender</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Aksi</th>
                                    </>
                                )}
                                {view === 'kegiatan' && (
                                    <>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Kegiatan</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Tipe/Jadwal</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Target</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Aksi</th>
                                    </>
                                )}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {view === 'staff' && (filteredData as Staff[]).map(s => (
                                <tr key={s.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-900">{s.name}</td>
                                    <td className="px-6 py-4 text-gray-600">{s.email}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${s.gender === 'Putra' ? 'bg-blue-50 text-blue-700' : 'bg-pink-50 text-pink-700'}`}>
                                            {s.gender}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 flex gap-3">
                                        <button onClick={() => { setEditItem(s); setIsModalOpen(true); }} className="text-amber-600 hover:text-amber-800 transition-colors font-medium">Edit</button>
                                        <button onClick={() => handleDelete('staff', s.id)} className="text-rose-600 hover:text-rose-800 transition-colors font-medium">Hapus</button>
                                    </td>
                                </tr>
                            ))}
                            {view === 'siswa' && (filteredData as Siswa[]).map(s => (
                                <tr key={s.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-900">{s.name}</td>
                                    <td className="px-6 py-4 text-gray-600">{s.kelas}</td>
                                    <td className="px-6 py-4 text-gray-600">{s.kelompok}</td>
                                    <td className="px-6 py-4 flex gap-3">
                                        <button onClick={() => { setEditItem(s); setIsModalOpen(true); }} className="text-amber-600 hover:text-amber-800 transition-colors font-medium">Edit</button>
                                        <button onClick={() => handleDelete('siswa', s.id)} className="text-rose-600 hover:text-rose-800 transition-colors font-medium">Hapus</button>
                                    </td>
                                </tr>
                            ))}
                            {view === 'kegiatan' && (filteredData as MasterKegiatan[]).map(k => (
                                <tr key={k.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-900">{k.name}</td>
                                    <td className="px-6 py-4">
                                        <div className="space-y-1">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${k.tipe === 'Rutin' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                                {k.tipe}
                                            </span>
                                            {k.tipe === 'Rutin' && (
                                                <div className="text-[11px] text-gray-400">
                                                    Hari: {k.hari || '-'} | Pekan: {k.pekan || '-'}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-xs text-gray-500">
                                            <div>Staff: {k.target_staff_ids?.length || 0}</div>
                                            <div>Kelompok: {k.target_kelompok?.length || 0}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 flex gap-3">
                                        <button onClick={() => { setEditItem(k); setIsModalOpen(true); }} className="text-amber-600 hover:text-amber-800 transition-colors font-medium">Edit</button>
                                        <button onClick={() => handleDelete('kegiatan', k.id)} className="text-rose-600 hover:text-rose-800 transition-colors font-medium">Hapus</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        </table>
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="px-8 py-6 bg-gray-50 border-b border-gray-100">
                            <h2 className="text-xl font-bold text-gray-900">
                                {editItem ? 'Edit' : 'Tambah'} {view.charAt(0).toUpperCase() + view.slice(1)}
                            </h2>
                        </div>
                        <form onSubmit={handleSave} className="p-8 space-y-5 overflow-y-auto max-h-[70vh]">
                            {view === 'staff' && (
                                <>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-700">Nama Staff</label>
                                        <input name="name" defaultValue={editItem?.name} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all" required />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-700">Email</label>
                                        <input name="email" defaultValue={editItem?.email} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all" required />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-700">Gender</label>
                                        <select name="gender" defaultValue={editItem?.gender} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all">
                                            <option value="Putra">Putra</option>
                                            <option value="Putri">Putri</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-700">Link Foto GDrive</label>
                                        <div className="flex gap-2 items-center">
                                            <input id="staff_photo_url" name="photo_url" defaultValue={editItem?.photo_url} className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="https://drive.google.com/..." />
                                            <label className={`px-4 py-2.5 rounded-lg font-semibold text-sm cursor-pointer transition-colors ${isUploading ? 'bg-gray-200 text-gray-500' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}`}>
                                                {isUploading ? 'Mengunggah...' : 'Upload Foto'}
                                                <input type="file" className="hidden" accept="image/*" disabled={isUploading} onChange={async (e) => {
                                                    const file = e.target.files?.[0];
                                                    if (!file) return;
                                                    setIsUploading(true);
                                                    try {
                                                        const url = await uploadToGDrive(file);
                                                        const input = document.getElementById('staff_photo_url') as HTMLInputElement;
                                                        if (input) input.value = url;
                                                    } catch(err:any) {
                                                        alert("Gagal mengunggah: " + err.message);
                                                    } finally {
                                                        setIsUploading(false);
                                                    }
                                                }} />
                                            </label>
                                        </div>
                                    </div>
                                </>
                            )}
                            {view === 'siswa' && (
                                <>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-700">Nama Siswa</label>
                                        <input name="name" defaultValue={editItem?.name} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all" required />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-700">Kelas</label>
                                        <input name="kelas" defaultValue={editItem?.kelas} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all" required />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-700">Kelompok (Gunakan koma jika lebih dari satu)</label>
                                        <input id="siswa-kelompok-input" name="kelompok" defaultValue={editItem?.kelompok} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="misal: Kelompok A1, Tahfidz" required />
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            <span className="text-xs text-gray-400 w-full mb-1">Gunakan kelompok yang sudah ada:</span>
                                            {Array.from(new Set(siswas.flatMap(s => s.kelompok.split(',').map(g => g.trim())))).filter(g => g).sort().map(group => (
                                                <button
                                                    key={group}
                                                    type="button"
                                                    onClick={() => {
                                                        const el = document.getElementById('siswa-kelompok-input') as HTMLInputElement;
                                                        if (!el) return;
                                                        const current = el.value.split(',').map(v => v.trim()).filter(v => v);
                                                        if (!current.includes(group)) {
                                                            current.push(group);
                                                            el.value = current.join(', ');
                                                        }
                                                    }}
                                                    className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-xs hover:bg-blue-100 transition-colors"
                                                >
                                                    + {group}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-700">Gender</label>
                                        <select name="gender" defaultValue={editItem?.gender} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all">
                                            <option value="Putra">Putra</option>
                                            <option value="Putri">Putri</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-700">Link Foto GDrive</label>
                                        <div className="flex gap-2 items-center">
                                            <input id="siswa_photo_url" name="photo_url" defaultValue={editItem?.photo_url} className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="https://drive.google.com/..." />
                                            <label className={`px-4 py-2.5 rounded-lg font-semibold text-sm cursor-pointer transition-colors ${isUploading ? 'bg-gray-200 text-gray-500' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}`}>
                                                {isUploading ? 'Mengunggah...' : 'Upload Foto'}
                                                <input type="file" className="hidden" accept="image/*" disabled={isUploading} onChange={async (e) => {
                                                    const file = e.target.files?.[0];
                                                    if (!file) return;
                                                    setIsUploading(true);
                                                    try {
                                                        const url = await uploadToGDrive(file);
                                                        const input = document.getElementById('siswa_photo_url') as HTMLInputElement;
                                                        if (input) input.value = url;
                                                    } catch(err:any) {
                                                        alert("Gagal mengunggah: " + err.message);
                                                    } finally {
                                                        setIsUploading(false);
                                                    }
                                                }} />
                                            </label>
                                        </div>
                                    </div>
                                </>
                            )}
                            {view === 'kegiatan' && (
                                <>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-700">Nama Kegiatan</label>
                                        <input name="name" defaultValue={editItem?.name} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all" required />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-700">Gender</label>
                                        <select name="gender" defaultValue={editItem?.gender} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all">
                                            <option value="Putra">Putra</option>
                                            <option value="Putri">Putri</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-700">Tipe Kegiatan</label>
                                        <select id="tipe-select" name="tipe" defaultValue={editItem?.tipe || 'Rutin'} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all" onChange={(e) => {
                                            const hariPekanDiv = document.getElementById('hari-pekan-fields');
                                            if (hariPekanDiv) hariPekanDiv.style.display = e.target.value === 'Rutin' ? 'block' : 'none';
                                        }}>
                                            <option value="Rutin">Rutin</option>
                                            <option value="Insidental">Insidental</option>
                                        </select>
                                    </div>
                                    <div id="hari-pekan-fields" style={{ display: (editItem?.tipe || 'Rutin') === 'Rutin' ? 'block' : 'none' }} className="space-y-5">
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-gray-700">Hari Pelaksanaan</label>
                                            <div className="grid grid-cols-2 gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                                {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'].map((day, i) => (
                                                    <label key={day} className="flex items-center gap-2 text-sm text-gray-600">
                                                        <input type="checkbox" name="hari_check" value={i+1} defaultChecked={editItem?.hari?.split(',').includes(String(i+1))} />
                                                        {day}
                                                    </label>
                                                ))}
                                                <input type="hidden" name="hari" value="" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-gray-700">Pekan Pelaksanaan</label>
                                            <div className="flex flex-wrap gap-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                                {[1,2,3,4,5].map(w => (
                                                    <label key={w} className="flex items-center gap-2 text-sm text-gray-600">
                                                        <input type="checkbox" name="pekan_check" value={w} defaultChecked={editItem?.pekan?.split(',').includes(String(w))} />
                                                        P{w}
                                                    </label>
                                                ))}
                                                <input type="hidden" name="pekan" value="" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-700">Pilih Penanggung Jawab (Staff)</label>
                                        <div className="max-h-40 overflow-y-auto p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-1">
                                            {staffs.map(s => (
                                                <label key={s.id} className="flex items-center gap-2 text-sm text-gray-600 hover:bg-white p-1 rounded transition-colors">
                                                    <input type="checkbox" name="staff_check" value={s.id} defaultChecked={editItem?.target_staff_ids?.includes(s.id)} />
                                                    {s.name}
                                                </label>
                                            ))}
                                            <input type="hidden" name="target_staff_ids" value="" />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-700">Pilih Target Kelompok</label>
                                        <div className="max-h-40 overflow-y-auto p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-1">
                                            {/* Ambil semua kelompok unik dari data siswa */}
                                            {Array.from(new Set(siswas.flatMap(s => s.kelompok.split(',').map(g => g.trim())))).filter(g => g).sort().map(group => (
                                                <label key={group} className="flex items-center gap-2 text-sm text-gray-600 hover:bg-white p-1 rounded transition-colors">
                                                    <input type="checkbox" name="kelompok_check" value={group} defaultChecked={editItem?.target_kelompok?.includes(group)} />
                                                    {group}
                                                </label>
                                            ))}
                                            <input type="hidden" name="target_kelompok" value="" />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-700">SOP (Pisahkan dengan koma)</label>
                                        <textarea name="sops" defaultValue={editItem?.sops?.join(', ')} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all" rows={2} required />
                                    </div>
                                </>
                            )}
                            
                            <div className="flex gap-4 pt-4 sticky bottom-0 bg-white border-t border-gray-100 mt-auto">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-3 bg-white border border-gray-200 text-gray-600 rounded-xl font-semibold hover:bg-gray-50 transition-all">Batal</button>
                                <button type="submit" className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all">Simpan</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {isBulkModalOpen && (
                <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl overflow-hidden animate-in fade-in zoom-in duration-200 h-[90vh] flex flex-col">
                        <div className="px-8 py-6 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-900">Upload Massal {view.charAt(0).toUpperCase() + view.slice(1)} (Paste)</h2>
                            <button onClick={() => setIsBulkModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-3xl font-light">&times;</button>
                        </div>
                        <div className="p-8 overflow-y-auto flex-1 flex flex-col gap-6">
                            <div className="bg-blue-50 text-blue-800 p-4 rounded-lg text-sm border border-blue-100">
                                <strong>Cara Penggunaan:</strong> Copy data baris dari Excel/Google Sheets dan Paste ke area di bawah ini.
                                <ul className="list-disc ml-5 mt-2 text-blue-700">
                                    {view === 'staff' && <li><strong>Staff:</strong> Nama, Email, Gender (Putra/Putri), Link Foto</li>}
                                    {view === 'siswa' && <li><strong>Siswa:</strong> Nama, Kelas, Kelompok (pisahkan koma untuk banyak kelompok), Gender (Putra/Putri), Link Foto</li>}
                                    {view === 'kegiatan' && <li><strong>Kegiatan:</strong> Nama, Gender, SOP, Staff IDs, Kelompok, Tipe (Rutin/Insidental), Hari (1-7), Pekan (1-5)</li>}
                                </ul>
                            </div>
                            <div className="space-y-4">
                                <label className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Paste Data di Sini:</label>
                                <textarea 
                                    value={bulkData}
                                    onChange={(e) => parsePastedData(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition-all font-mono text-sm h-32" 
                                    placeholder="Paste data dari Excel di sini..." 
                                />
                            </div>

                            {parsedData.length > 0 && (
                                <div className="space-y-4 flex-1 flex flex-col min-h-[300px]">
                                    <label className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Preview Data (Verifikasi):</label>
                                    <div className="flex-1 bg-white border border-gray-200 rounded-xl overflow-hidden shadow-inner ag-theme-alpine">
                                        <AgGridReact
                                            rowData={parsedData}
                                            columnDefs={colDefs}
                                            animateRows={true}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="p-8 bg-gray-50 border-t border-gray-100 flex gap-4">
                            <button type="button" onClick={() => setIsBulkModalOpen(false)} className="flex-1 px-4 py-3 bg-white border border-gray-200 text-gray-600 rounded-xl font-semibold hover:bg-gray-50 transition-all">Batal</button>
                            <button 
                                onClick={handleBulkSave}
                                disabled={parsedData.length === 0}
                                className={`flex-1 px-4 py-3 rounded-xl font-semibold shadow-lg transition-all ${parsedData.length > 0 ? 'bg-purple-600 text-white hover:bg-purple-700 shadow-purple-200' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                            >
                                Simpan {parsedData.length} Data Massal
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

