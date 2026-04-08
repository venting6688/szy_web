// src/api/department.js
import { get } from '@/utils/request';

// 大科室
export const getFirstDepts = (params = {}) => {
  const { hospitalId, startDate, endDate, ...rest } = params;

  return get('/api/dh/newFirstDepts', {
    hospitalId,
    startDate,
    endDate,
    ...rest,
  });
};

// 子科室
export const getSecondDepts = (params = {}) => {
  const { hospitalId, deptId, ...rest } = params;

  return get('/api/dh/newSecondDepts', {
    hospitalId,
    deptId,
    ...rest,
  });
};
