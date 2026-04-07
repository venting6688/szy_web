// src/api/hospital.js
import { get } from '@/utils/request';

// 获取院区
export const getHospitalBranches = (params) => {
  return get('/api/getHospitalBranchesByCode', params);
};
