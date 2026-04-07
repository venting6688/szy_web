// src/api/order.js
import { get } from '@/utils/request';

// 查询预约 / 挂号记录
export const getAppointments = (params) => {
  return get('/api/dh/appointments', params);
};
