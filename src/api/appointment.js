// src/api/appointment.js
import { post } from '@/utils/request';

// 预约挂号
export const createAppointment = (data) => {
  return post('/api/dh/appoint/register', data);
};
