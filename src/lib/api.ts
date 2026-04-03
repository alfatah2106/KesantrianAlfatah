const API_BASE_URL = 'http://localhost:5000/api';
const GDRIVE_UPLOAD_URL = 'https://script.google.com/macros/s/AKfycbxmgRjZ72MYOyeb-c64j4NdNO2GzwwZBj62posHP65uzG7GyCeltRuBvJaT3iosqC_1yg/exec';

export const uploadToGDrive = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = async () => {
            try {
                const base64Data = (reader.result as string).split(',')[1];
                // Panggil Proxy Backend kita sendiri untuk menghindari masalah CORS
                const response = await fetch(`${API_BASE_URL}/upload-photo`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        filename: file.name,
                        contentType: file.type,
                        base64: base64Data
                    })
                });
                const result = await response.json();
                if (result.success) {
                    resolve(result.url);
                } else {
                    reject(new Error(result.error || 'Upload failed'));
                }
            } catch (err) {
                reject(err);
            }
        };
        reader.onerror = error => reject(error);
    });
};


export const fetchStaff = async () => {
    const res = await fetch(`${API_BASE_URL}/staff`);
    return res.json();
};

export const fetchSiswa = async () => {
    const res = await fetch(`${API_BASE_URL}/siswa`);
    return res.json();
};

export const fetchKegiatan = async () => {
    const res = await fetch(`${API_BASE_URL}/kegiatan`);
    return res.json();
};

// CRUD for Master Data
export const saveStaff = async (staff: any) => {
    const method = staff.id_exists ? 'PUT' : 'POST'; // Simplified logic, usually checked by existence
    const url = staff.id_exists ? `${API_BASE_URL}/staff/${staff.id}` : `${API_BASE_URL}/staff`;
    const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(staff),
    });
    return res.json();
};

export const addStaff = async (staff: any) => {
    const res = await fetch(`${API_BASE_URL}/staff`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(staff),
    });
    return res.json();
};

export const updateStaff = async (id: string, staff: any) => {
    const res = await fetch(`${API_BASE_URL}/staff/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(staff),
    });
    return res.json();
};

export const deleteStaff = async (id: string) => {
    const res = await fetch(`${API_BASE_URL}/staff/${id}`, {
        method: 'DELETE',
    });
    return res.json();
};

// Similar for Siswa and Kegiatan
export const addSiswa = async (siswa: any) => {
    const res = await fetch(`${API_BASE_URL}/siswa`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(siswa),
    });
    return res.json();
};

export const updateSiswa = async (id: string, siswa: any) => {
    const res = await fetch(`${API_BASE_URL}/siswa/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(siswa),
    });
    return res.json();
};

export const deleteSiswa = async (id: string) => {
    const res = await fetch(`${API_BASE_URL}/siswa/${id}`, {
        method: 'DELETE',
    });
    return res.json();
};

export const addKegiatan = async (keg: any) => {
    const res = await fetch(`${API_BASE_URL}/kegiatan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(keg),
    });
    return res.json();
};

export const updateKegiatan = async (id: string, keg: any) => {
    const res = await fetch(`${API_BASE_URL}/kegiatan/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(keg),
    });
    return res.json();
};

export const deleteKegiatan = async (id: string) => {
    const res = await fetch(`${API_BASE_URL}/kegiatan/${id}`, {
        method: 'DELETE',
    });
    return res.json();
};

// Form submission utilities
export const submitFormKegiatan = async (data: any) => {
    const res = await fetch(`${API_BASE_URL}/records/kegiatan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    return res.json();
};

export const submitFormSupervisi = async (data: any) => {
    const res = await fetch(`${API_BASE_URL}/records/supervisi`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    return res.json();
};
