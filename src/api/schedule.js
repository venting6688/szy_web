import { get } from '@/utils/request';

// 医生排班
export async function getSchedulesApi(params) {
  const { doctorCode, deptCode, startDate, endDate } = params;
  console.log('医生排班', params);
  const res = await get('/mobile/api/dh/schedules', {
    doctorCode: doctorCode || '',
    deptCode,
    startDate,
    endDate,
  });
  if (res.code !== 200) {
    throw new Error(res.message || '获取排班失败');
  } else {
    return res.data?.Schedules || [];
  }
}

// 获取号源
export async function getScheduleDetailApi({ scheduleItemCode, deptCode }) {
  const res = await get('/mobile/api/dh/scheduleDetail', {
    scheduleItemCode,
    deptCode,
  });
  if (res.code !== 200) {
    throw new Error(res.message || '获取号源失败');
  } else {
    return res.data?.Schedules || {};
  }
}
