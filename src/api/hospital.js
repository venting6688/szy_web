// src/api/hospital.js
import { get } from '@/utils/request';

// 获取院区
export async function getHospitalBranchesApi(params) {
  const res = await get('/mobile/api/getHospitalBranchesByCode', params);
  console.log(res);
  if (res.code !== 200) {
    throw new Error(res.message || '获取院区失败');
  } else {
    return res?.rows?.[0]?.branches || [];
  }
}
