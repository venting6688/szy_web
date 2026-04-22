import { get } from '@/utils/request';
import { MessagePlugin } from 'tdesign-vue-next';
import { useHospitalStore } from '@/store/modules/hospital';

const hospitalStore = useHospitalStore();

// 医生排班
export async function getSchedulesApi(params) {
  const { doctorCode, deptCode, startDate, endDate } = params;
  console.log('医生排班', params);
  const { code, msg, data } = await get('/mobile/api/dh/schedules', {
    doctorCode: doctorCode || '',
    deptCode,
    startDate,
    endDate,
    isCBDFlag: hospitalStore.current === hospitalStore.list.find((item) => item.appointment === false).value ? 'Y' : '',
  });
  if (code !== 200) {
    MessagePlugin.error(msg || '获取排班失败');
    throw new Error(msg || '获取排班失败');
  } else {
    return data?.Schedules || [];
  }
}

// 获取号源
export async function getScheduleDetailApi({ scheduleItemCode, deptCode }) {
  const { code, msg, data } = await get('/mobile/api/dh/scheduleDetail', {
    scheduleItemCode,
    deptCode,
  });
  if (code !== 200) {
    MessagePlugin.error(msg || '获取号源失败');
    throw new Error(msg || '获取号源失败');
  } else {
    return data?.TimeRanges || [];
  }
}
