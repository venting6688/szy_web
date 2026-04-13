// src/api/order.js
import { get, post } from '@/utils/request';
import { useUserStore } from '@/store/modules/user';
import { MessagePlugin } from 'tdesign-vue-next';
import { useHospitalStore } from '@/store/modules/hospital';

const userStore = useUserStore();
const hospitalStore = useHospitalStore();

// 查询预约 / 挂号记录
// hospitalId=SZYQFSYQ&patientNo=0010060062&orderStatus=normal&queryDateFlag=AdmDate&queryUserType=OWN&startDate=2026-04-07&endDate=2026-04-14&cardNo=&idCardNo=&orderCode=&extOrgCode=&clientType=WEB&credTypeCode=1&cardType=04
export async function getAppointmentsApi({ startDate, endDate }) {
  const { data, mag, code } = await get('/mobile/api/dh/appointments', {
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
  if (code !== 200) {
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
