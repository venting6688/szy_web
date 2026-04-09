// src/api/department.js
import { get, post } from '@/utils/request';

// 大科室
export async function getFirstDeptsApi(params = {}) {
  const { startDate, endDate, ...rest } = params;

  const res = await get('/mobile/api/dh/newFirstDepts', {
    startDate,
    endDate,
    ...rest,
  });
  if (res.code !== 200) {
    throw new Error(res.message || '获取大科室失败');
  } else {
    return res.data?.ResultData?.CliSerGroups || [];
  }
}

// 子科室
export async function getSecondDeptsApi(params = {}) {
  const { startDate, endDate, departmentGroupCode, ...rest } = params;

  const res = await get('/mobile/api/dh/newDepts', {
    startDate,
    endDate,
    departmentGroupCode,
    ...rest,
  });
  if (res.code !== 200) {
    throw new Error(res.message || '获取子科室失败');
  } else {
    return res.data?.ResultData?.ClinicGroups || [];
  }
}
