// src/api/hospital.js
import MessagePlugin from 'tdesign-vue-next';
import { get } from '@/utils/request';

// 获取院区
export async function getHospitalBranchesApi(params) {
  const { code, msg, rows } = await get('/mobile/api/getHospitalBranchesByCode', params);
  console.log(rows);
  if (code !== 200) {
    MessagePlugin.error(msg || '获取院区失败');
    throw new Error(msg || '获取院区失败');
  } else {
    return rows?.[0]?.branches || [];
  }
}
