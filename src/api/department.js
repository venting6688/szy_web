// src/api/department.js
import { get, post } from '@/utils/request';
import { MessagePlugin } from 'tdesign-vue-next';
// 大科室
export async function getFirstDeptsApi(params = {}) {
  const { startDate, endDate, ...rest } = params;

  const { code, msg, data } = await get('/mobile/api/dh/newFirstDepts', {
    startDate,
    endDate,
    ...rest,
  });
  if (code !== 200) {
    MessagePlugin.error(msg || '获取一级科室失败');
    throw new Error(msg || '获取一级科室失败');
  } else {
    return data?.ResultData?.CliSerGroups || [];
  }
}

// 子科室
export async function getSecondDeptsApi(params = {}) {
  const { startDate, endDate, departmentGroupCode, ...rest } = params;

  const { code, msg, data } = await get('/mobile/api/dh/newDepts', {
    startDate,
    endDate,
    departmentGroupCode,
    ...rest,
  });
  if (code !== 200) {
    MessagePlugin.error(msg || '获取二级科室失败');
    throw new Error(msg || '获取二级科室失败');
  } else {
    return data?.ResultData?.ClinicGroups || [];
  }
}
