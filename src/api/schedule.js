import { get } from '@/utils/request';
import { MessagePlugin } from 'tdesign-vue-next';
import { useHospitalStore } from '@/store/modules/hospital';
import { useUserStore } from '@/store/modules/user';
import router from '@/router';

const hospitalStore = useHospitalStore();
const userStore = useUserStore();

// 医生排班
export async function getSchedulesApi(params, isRealtime) {
  const { doctorCode, deptCode, startDate, endDate } = params;
  // isRealtime 为 true 时走实时排班接口，其余情况保持原有排班接口
  const url = isRealtime ? '/mobile/api/dh/realtimeSchedules' : '/mobile/api/dh/newSchedules';
  const { code, msg, data } = await get(url, {
    doctorCode: doctorCode || '',
    deptCode,
    startDate,
    endDate,
    isCBDFlag:
      hospitalStore.current === hospitalStore.list.find((item) => item.appointment === false)?.value ? 'Y' : '',
  });
  if (code !== 200) {
    MessagePlugin.error(msg || '获取排班失败');
    throw new Error(msg || '获取排班失败');
  } else {
    return data?.Schedules || [];
  }
}

// 号源数量查询（日期条「有号/无号」判断，hospitalId 由请求拦截器统一注入）
export async function getSchedulesHasNumberApi(params) {
  const { deptCode, startDate, endDate } = params;
  const { code, msg, data } = await get('/mobile/api/dh/schedules/hasNumber', {
    deptId: deptCode,
    startDate,
    endDate,
    isCBDFlag:
      hospitalStore.current === hospitalStore.list.find((item) => item.appointment === false)?.value ? 'Y' : '',
  });
  if (code !== 200) {
    MessagePlugin.error(msg || '获取号源失败');
    throw new Error(msg || '获取号源失败');
  } else {
    return data || [];
  }
}

// 获取号源
export async function getScheduleDetailApi({ scheduleItemCode, deptCode }) {
  const { code, msg, data } = await get('/mobile/api/dh/scheduleDetail', {
    scheduleItemCode,
    deptCode,
  });
  if (code === 401) {
    MessagePlugin.error('登录过期，请重新登录');
    userStore.logout();
    router.push('/login');
    throw new Error(msg + '登录过期，请重新登录');
  }
  if (code !== 200) {
    MessagePlugin.error(msg || '获取号源失败');
    throw new Error(msg || '获取号源失败');
  } else {
    return data?.TimeRanges || [];
  }
}
