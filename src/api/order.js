// src/api/order.js
import { get, post } from '@/utils/request';
import { useUserStore } from '@/store/modules/user';
import { MessagePlugin } from 'tdesign-vue-next';
import { useHospitalStore } from '@/store/modules/hospital';

const userStore = useUserStore();
const hospitalStore = useHospitalStore();

// 查询预约 / 挂号记录
export async function getAppointmentsApi({ startDate, endDate }) {
  const { data, msg, code } = await get('/mobile/api/dh/appointments', {
    patientNo: userStore.userInfo.patientId || '',
    orderStatus: 'normal',
    queryDateFlag: 'AdmDate',
    queryUserType: 'OWN',
    startDate,
    endDate,
    cardNo: userStore.userInfo.idCard || '',
    idCardNo: userStore.userInfo.idCard || '',
    orderCode: '',
    extOrgCode: '',
    clientType: 'WEB',
    credTypeCode: 1,
    cardType: '04',
  });
  if (code === 500) {
    MessagePlugin.warning('暂未查询到您的预约记录');
  } else if (code !== 200) {
    MessagePlugin.error(msg || '获取预约记录失败');
    throw new Error(msg || '获取预约记录失败');
  } else {
    return data.Orders || [];
  }
}

// 取消预约 / 挂号 mobile/api/dh/appoint/cancel
// transactionId   orderNo
export async function cancelAppointmentApi({ transactionId, orderNo }) {
  const { data, msg, code } = await post(
    '/mobile/api/dh/appoint/cancel',
    {
      transactionId,
      orderNo,
    },
    {
      hospitalId: hospitalStore.current || '',
    },
  );
  if (code !== 200) {
    MessagePlugin.error(msg || '取消预约失败');
    throw new Error(msg || '取消预约失败');
  } else {
    return data || {};
  }
}
