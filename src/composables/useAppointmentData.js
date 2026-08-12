import { ref, watch, computed, onMounted } from 'vue';
import dayjs from 'dayjs';
import { useRoute, useRouter } from 'vue-router';
import { getFirstDeptsApi, getSecondDeptsApi } from '@/api/department';
import { getSchedulesApi } from '@/api/schedule';
import { useHospitalStore } from '@/store/modules/hospital';
import { MessagePlugin } from 'tdesign-vue-next';
import { useNoticeStore } from '@/store/modules/notice';
import downIcon from '@/assets/image/down.png';
import rightIcon from '@/assets/image/right.png';
// 缓存一级科室和二级科室，因为使用了composables，所以不需要使用Pinia了，直接使用Map缓存在本模块中即可
// 是按院区存储的，Map 有多少条取决于访问过多少个院区
const firstDeptCache = new Map();
const secondDeptCache = new Map();

export function useAppointmentData() {
  const route = useRoute();
  const router = useRouter();

  // const type = route.path === '/appointment-today' ? 'appointment-today' : 'appointment';
  // const type = route.path.split('/')[1];
  const type = route.path.includes('schedule')
    ? 'schedule'
    : route.path.includes('appointment-today')
      ? 'appointment-today'
      : 'appointment';
  const subLoading = ref(false);

  const currentDept = ref(-1);

  const dates = Array.from({ length: 7 }, (_, i) => dayjs().add(i, 'day').format('YYYY-MM-DD'));

  const currentDate = ref(dates[0]);

  const onlyAvailable = ref(false);

  const doctors = ref([]);
  const loading = ref(false);
  const format = (d) => dayjs(d).format('M月D日');

  const displayDoctors = computed(() => {
    if (!onlyAvailable.value) return doctors.value;
    return doctors.value.filter((d) => d.schedule.some((s) => s.left > 0));
  });

  //#region 科室
  const firstDeptList = ref([]);
  const secondDeptMap = ref({}); // 存子科室
  const openDept = ref(null); // 当前展开的一级科室

  async function getFirstDepts() {
    const cacheKey = hospitalStore.current;
    let arr = firstDeptCache.get(cacheKey);
    if (!firstDeptCache.has(cacheKey)) {
      arr = await getFirstDeptsApi({
        startDate: currentDate.value,
        endDate: currentDate.value,
      });
      firstDeptCache.set(cacheKey, arr);
    }
    firstDeptList.value = arr;

    // 默认选中第一个一级科室并展开
    if (arr && arr.length > 0) {
      await onClickDept(arr[0]);
      // 默认选中第一个二级科室
      const firstDeptId = arr[0].CliSerGroupID;
      nextTick(async () => {
        const secondDepts = secondDeptMap.value[firstDeptId];
        if (secondDepts && secondDepts.length > 0) {
          await onClickSecondDept(secondDepts[0]);
        }
      });
    }
  }

  // 点击一级科室
  async function onClickDept(item) {
    const id = item.CliSerGroupID;
    const cacheKey = `${hospitalStore.current}:${id}`;

    // const loadingInstance = await LoadingPlugin({
    //   text: '加载中...',
    //   fullscreen: true,
    // });

    // 切换展开状态
    if (openDept.value === id) {
      openDept.value = null;
      return;
    }

    openDept.value = id;
    currentDept.value = id;

    // 如果已经加载过，就不再请求
    if (secondDeptMap.value[id]) return;
    if (secondDeptCache.has(cacheKey)) {
      secondDeptMap.value[id] = secondDeptCache.get(cacheKey);
      return;
    }
    subLoading.value = true;
    const data = await getSecondDeptsApi({
      departmentGroupCode: id,
      startDate: currentDate.value,
      endDate: currentDate.value,
    });
    const secondDepts = Array.isArray(data) ? data : [data];
    secondDeptMap.value[id] = secondDepts;
    secondDeptCache.set(cacheKey, secondDepts);
    nextTick(() => {
      subLoading.value = false;
    });
    // loadingInstance.hide();
  }

  function transformSchedule(list, deptCode) {
    const map = new Map();

    list.forEach((item) => {
      const code = item.DocCode;
      // 初始化医生
      if (!map.has(code)) {
        map.set(code, {
          code,
          deptCode,
          date: currentDate.value,
          name: item.DoctorName,
          price: item.RegFee,
          desc: item.DocIntruduction,
          deptName: item.DepartmentName,
          doctorType: item.DoctorSessType,
          scheduleItemCode: [],
          schedule: [],
        });
      }
      const doctor = map.get(code);
      doctor.schedule.push({
        period: item.SessionName,
        total: Number(item.AvailableTotalNum),
        left: Number(item.AvailableLeftNum),
        scheduleItemCode: item.ScheduleItemCode,
      });
    });
    return Array.from(map.values());
  }

  const currentSecondDept = ref(null);

  // 点击子科室
  async function onClickSecondDept(child) {
    loading.value = true;
    currentSecondDept.value = child.CLGRPRowId;

    availableDateList.value = [];
    loadDoctors();
    loadWeekDoctors();
  }

  // 加载医生排班
  async function loadDoctors() {
    const schedules = await getSchedulesApi({
      deptCode: currentSecondDept.value,
      doctorCode: null,
      startDate: currentDate.value,
      endDate: currentDate.value,
    });
    doctors.value = transformSchedule(schedules, currentSecondDept.value);
    // 如果是当天
    // if (dayjs(currentDate.value).isSame(dayjs(), 'day')) {
    //   availableDateList.value[0] = buildDateAvailability(schedules, currentDate.value, currentDate.value)[0];
    // }
    loading.value = false;
  }

  const availableDateList = ref([]);
  const weekLoading = ref(false);

  // 构建日期可用号源
  function buildDateAvailability(scheduleList, startDate, endDate) {
    const map = {};

    // 1️⃣ 按日期累加 AvailableLeftNum
    scheduleList.forEach((item) => {
      const date = item.ServiceDate;
      const left = Number(item.AvailableLeftNum || 0);

      if (!map[date]) {
        map[date] = 0;
      }

      map[date] += left;
    });

    // 2️⃣ 生成完整日期区间
    const result = [];
    let current = dayjs(startDate);
    const end = dayjs(endDate);

    while (current.isBefore(end) || current.isSame(end)) {
      const dateStr = current.format('YYYY-MM-DD');

      const total = map[dateStr] || 0;

      result.push({
        date: dateStr,
        hasAvailable: total > 0,
        total, // 可选：总余号
      });

      current = current.add(1, 'day');
    }

    return result;
  }

  // 加载一周的医生排班
  let requestId = 0;

  async function loadWeekDoctors() {
    const currentId = ++requestId;
    weekLoading.value = true;

    availableDateList.value = [];
    try {
      const schedules = await getSchedulesApi({
        deptCode: currentSecondDept.value,
        doctorCode: null,
        startDate: dates[0],
        endDate: dates[dates.length - 1],
      });

      // ⭐ 如果不是最新请求，直接丢弃，用于解决连续点击多个科室导致的并发请求问题
      if (currentId !== requestId) return;

      availableDateList.value = buildDateAvailability(schedules, dates[0], dates[dates.length - 1]);
    } finally {
      if (currentId === requestId) {
        weekLoading.value = false;
      }
    }
  }

  function isAvailable(date) {
    // 使用dayjs判断是否为当前日期
    // if (dayjs(date).isSame(dayjs(), 'day')) {
    //   return false;
    // }
    return availableDateList.value.find((item) => item.date === date)?.hasAvailable;
  }
  // #//#endregion

  function initData() {
    doctors.value = [];
    currentSecondDept.value = null;
    firstDeptList.value = [];
    secondDeptMap.value = {};
    availableDateList.value = [];
    weekLoading.value = false;
    openDept.value = null;
    currentDept.value = -1;
  }

  // #region 院区
  const hospitalStore = useHospitalStore();
  // 院区列表
  const hospitalOptions = computed(() => hospitalStore.list);
  // 当前院区
  const hospitalId = ref(null);
  // 切换院区
  function onChangeHospital() {
    hospitalStore.setHospital(hospitalId.value);
    initData();
    getFirstDepts();
  }
  // 如果监听到院区列表不为空了，初始化院区为第一个院区
  watch(
    hospitalOptions,
    (newVal) => {
      if (newVal.length === 0) return;
      hospitalId.value = hospitalStore.current || newVal[0].value;
      onChangeHospital();
    },
    { immediate: true },
  );
  // #endregion

  // 选择日期
  function onClickDate(date) {
    if (!currentSecondDept.value) {
      MessagePlugin.warning('请先选择二级科室');
      return;
    }
    currentDate.value = date;
    loadDoctors();
  }

  // 弹窗
  const dialogRef = ref(null);
  function bookEmit(doctor, period) {
    dialogRef.value.book(doctor, period);
  }
  // 通知弹窗
  const noticeDialogRef = ref(null);
  // 打开通知弹窗
  function openNoticeDialogOnce() {
    const noticeStore = useNoticeStore();
    if (noticeStore.isNotified) return;
    noticeStore.setIsNotified(true);
    noticeDialogRef.value.openNotice();
  }
  function openNoticeDialog() {
    noticeDialogRef.value.openNotice();
  }

  const weekDayMap = {
    0: '周日',
    1: '周一',
    2: '周二',
    3: '周三',
    4: '周四',
    5: '周五',
    6: '周六',
    7: '周日',
  };

  onMounted(() => {
    if (type === 'schedule') return;
    openNoticeDialogOnce();
  });

  return {
    type,
    currentDept,
    dates,
    currentDate,
    onlyAvailable,
    doctors,
    loading,
    format,
    displayDoctors,
    firstDeptList,
    secondDeptMap,
    openDept,
    onClickDept,
    currentSecondDept,
    onClickSecondDept,
    availableDateList,
    weekLoading,
    isAvailable,
    hospitalOptions,
    hospitalId,
    onChangeHospital,
    onClickDate,
    dialogRef,
    bookEmit,
    weekDayMap,
    loadDoctors,
    loadWeekDoctors,
    getFirstDepts,
    downIcon,
    rightIcon,
    noticeDialogRef,
    openNoticeDialog,
    subLoading,
  };
}
