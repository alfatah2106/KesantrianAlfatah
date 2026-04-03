import { AppData, FormKegiatanData, FormSupervisiData } from '../types';

const STORAGE_KEY = 'kesantrian_alfatah_data';

export const getLocalData = (): AppData => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (data) {
    return JSON.parse(data);
  }
  return { kegiatanRecords: [], supervisiRecords: [] };
};

export const saveLocalData = (data: AppData) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const addKegiatanRecord = (record: FormKegiatanData) => {
  const data = getLocalData();
  data.kegiatanRecords.push(record);
  saveLocalData(data);
};

export const addSupervisiRecord = (record: FormSupervisiData) => {
  const data = getLocalData();
  data.supervisiRecords.push(record);
  saveLocalData(data);
};

export const clearLocalData = () => {
  localStorage.removeItem(STORAGE_KEY);
};
