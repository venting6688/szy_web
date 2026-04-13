// src/api/appointment.js
import { post } from '@/utils/request';
import { MessagePlugin } from 'tdesign-vue-next';
import { useUserStore } from '@/store/modules/user';
import { useHospitalStore } from '@/store/modules/hospital';
const userStore = useUserStore();
const hospitalStore = useHospitalStore();

// 预约挂号
export async function createAppointmentApi({ ScheduleItemCode, PayFee, StartTime, EndTime }) {
  console.log('预约挂号', ScheduleItemCode, PayFee, StartTime, EndTime);
  const { code, msg, data } = await post(
    '/mobile/api/dh/appoint/register',
    {
      ScheduleItemCode,
      PayFee,
      StartTime,
      EndTime,
      MobileNo: userStore.userInfo.phonenumber,
      IDCardNo: userStore.userInfo.idCard,
      CardNo: userStore.userInfo.idCard,
      CardType: '04' || userStore.userInfo.idType, // 暂时写死04，否则有未知错误
      TelePhoneNo: userStore.userInfo.phonenumber,
      PatientName: userStore.userInfo.realName,
      Gender: userStore.userInfo.gender,
      Address:
        userStore.userInfo.province +
        userStore.userInfo.city +
        userStore.userInfo.district +
        userStore.userInfo.address,
      AppRegMethodCode: 'WEB',

      TradeCode: 1000,
      ExtUserID: 'app001',
      ExtOrgCode: 'WECHAT',
    },
    {
      hospitalId: hospitalStore.current,
    },
  );
  if (code !== 200) {
    MessagePlugin.error(msg || '预约挂号失败');
    throw new Error(msg || '预约挂号失败');
  } else {
    return data;
  }
}
