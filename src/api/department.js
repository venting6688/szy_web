// src/api/department.js
import { get } from '@/utils/request';

// 大科室
export const getFirstDepts = (params) => {
  return get('/api/dh/newFirstDepts', params);
};

// 二级科室
export const getSecondDepts = (params) => {
  return get('/api/dh/newDepts', params);
};
