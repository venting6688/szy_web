// src/api/appointment.js
import { post } from '@/utils/request';
import { MessagePlugin } from 'tdesign-vue-next';
import { useUserStore } from '@/store/modules/user';
import { useHospitalStore } from '@/store/modules/hospital';
import router from '@/router';
const userStore = useUserStore();
const hospitalStore = useHospitalStore();

// 预约挂号
export async function createAppointmentApi({
  ScheduleItemCode,
  PayFee,
  StartTime,
  EndTime,
  RegisterDate,
  doctorName,
  departmentName,
}) {
  const { code, msg, data } = await post(
    '/mobile/api/dh/appoint/register',
    {
      ScheduleItemCode,
      PayFee,
      StartTime,
      EndTime,
      MobileNo: userStore.userInfo.phonenumber,
      IDCardNo: userStore.userInfo.idCard,
      CardNo: userStore.userInfo.his_patient_card,
      CardType: userStore.userInfo.his_patient_card_type,
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
      registerDate: RegisterDate,
    },
    {
      hospitalId: hospitalStore.current,
    },
  );
  if (code === 401) {
    MessagePlugin.error('登录过期，请重新登录');
    userStore.logout();
    router.push('/login');
    throw new Error(msg + '登录过期，请重新登录');
  }
  if (code !== 200) {
    MessagePlugin.error(msg || '预约挂号失败');
    throw new Error(msg || '预约挂号失败');
  } else {
    MessagePlugin.success({
      content: '预约挂号成功：' + departmentName + '-' + doctorName,
      duration: 5000,
    });
    return data;
  }
}
