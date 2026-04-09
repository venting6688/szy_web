// src/api/appointment.js
import { post } from '@/utils/request';

// 预约挂号
export async function createAppointment(data) {
  const res = await post('/mobile/api/dh/appoint/register', data);
  if (res.code !== 200) {
    throw new Error(res.message || '预约挂号失败');
  } else {
    return res.data;
  }
}
