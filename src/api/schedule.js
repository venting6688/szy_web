// src/api/schedule.js
import { get } from '@/utils/request';

// 医生排班
export const getSchedules = (params) => {
  return get('/api/dh/schedules', params);
};

// 获取号源
export const getScheduleDetail = (params) => {
  return get('/api/dh/scheduleDetail', params);
};
