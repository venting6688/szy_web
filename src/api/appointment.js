// src/api/appointment.js
import { post } from '@/utils/request';
import MessagePlugin from 'tdesign-vue-next';

// 预约挂号
export async function createAppointmentApi(params) {
  const { code, msg, data } = await post('/mobile/api/dh/appoint/register', params);
  if (code !== 200) {
    MessagePlugin.error(msg || '预约挂号失败');
    throw new Error(msg || '预约挂号失败');
  } else {
    return data;
  }
}
