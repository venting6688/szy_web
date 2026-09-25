import { ref, watch, computed, onMounted } from 'vue';
import dayjs from 'dayjs';
import { useRoute, useRouter } from 'vue-router';
import { getFirstDeptsApi, getSecondDeptsApi } from '@/api/department';
import { getSchedulesApi } from '@/api/schedule';
import { useHospitalStore } from '@/store/modules/hospital';
import { useNoticeStore } from '@/store/modules/notice';
// HIS-COMPAT 临时兼容（2026-09-17 ~ 2026-09-24），过期整体删除
import { getHisCompatDateState, isHisCompatScheduleBlocked } from '@/his-compat/appointmentReleaseCompat';
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

  // 放号时间配置：每天 19:50 起展示第 8 天（待放号），20:00 正式放号
  const PENDING_START_MINUTES = 19 * 60 + 50;
  const RELEASE_END_MINUTES = 20 * 60;

  // 当前时间戳，由定时器驱动，用于日期区间与放号状态自动切换（页面不刷新也会更新）
  const now = ref(Date.now());

  // #region HIS-COMPAT 临时兼容（2026-09-17 ~ 2026-09-24），过期整体删除
  // 特殊期日期规则全部由该模块产出；返回 null 表示不在特殊期，走下面原有的正常逻辑
  const hisCompat = computed(() => getHisCompatDateState(now.value, type));
  // 是否处于特殊期（供日期条样式使用，预约挂号与医生排班页均生效）
  const hisCompatActive = computed(() => !!hisCompat.value);
  // 特殊期当日挂号页不请求排班数据（HIS 此时无号源）
  const hisCompatScheduleBlocked = computed(() => isHisCompatScheduleBlocked(now.value, type));
  // #endregion

  // 是否处于待放号窗口（19:50 - 20:00）
  const isPendingPeriod = computed(() => {
    const t = dayjs(now.value);
    const minutes = t.hour() * 60 + t.minute();
    return minutes >= PENDING_START_MINUTES && minutes < RELEASE_END_MINUTES;
  });

  // 19:50 起展示第 8 天，20:00 后第 8 天转为正式放号
  const showEighthDay = computed(() => {
    const t = dayjs(now.value);
    return t.hour() * 60 + t.minute() >= PENDING_START_MINUTES;
  });

  // 日期列表：19:50 前 7 天，19:50 起 8 天（预约挂号与医生排班页均生效；跨月、跨年由 dayjs 计算）
  const dates = computed(() => {
    // HIS-COMPAT：特殊期日期条（9/25 锚定 + 每日释放），过期删除本行
    if (hisCompat.value) return hisCompat.value.dates;
    const base = dayjs(now.value);
    const length = showEighthDay.value ? 8 : 7;
    return Array.from({ length }, (_, i) => base.add(i, 'day').format('YYYY-MM-DD'));
  });

  // 待放号的第 8 天日期
  const pendingDate = computed(() => {
    // HIS-COMPAT：特殊期待放号日期由兼容模块给出，过期删除本行
    if (hisCompat.value) return hisCompat.value.pendingDate;
    return isPendingPeriod.value ? dates.value[7] : null;
  });

  // 点击待放号日期后的查看状态
  const pendingViewDate = ref(null);
  const isPendingView = computed(() => !!pendingDate.value && pendingViewDate.value === pendingDate.value);

  // 距离 20:00 放号的倒计时
  const countdownText = computed(() => {
    const target = dayjs(now.value).hour(20).minute(0).second(0).millisecond(0);
    const total = Math.max(0, target.diff(dayjs(now.value), 'second'));
    const h = String(Math.floor(total / 3600)).padStart(2, '0');
    const m = String(Math.floor((total % 3600) / 60)).padStart(2, '0');
    const s = String(total % 60).padStart(2, '0');
    return `${h}:${m}:${s}`;
  });

  // 默认选中日期条的起始日期（正常时段即今天；HIS-COMPAT 特殊期为 9/25）
  const currentDate = ref(dates.value[0]);

  const onlyAvailable = ref(false);

  const doctors = ref([]);
  const loading = ref(false);
  const format = (d) => dayjs(d).format('M月D日');
  // 年月日
  const formatToFull = (d) => dayjs(d).format('YYYY-MM-DD');

  const displayDoctors = computed(() => {
    if (!onlyAvailable.value) return doctors.value;
    return doctors.value.filter((d) => d.schedule.some((s) => s.left > 0 && s.ScheduleStatusDesc !== '停诊'));
  });

  //#region 科室
  const firstDeptList = ref([]);
  const secondDeptMap = ref({}); // 存子科室
  const openDept = ref(null); // 当前展开的一级科室

  // preferDeptId / preferSecondDeptId：日期刷新时用于保留原选中科室，在新日期不存在时回落为第一个
  async function getFirstDepts(preferDeptId, preferSecondDeptId) {
    // 缓存按“院区 + 日期”隔离，不同日期的科室可能不同
    const cacheKey = `${hospitalStore.current}:${currentDate.value}`;
    let arr = firstDeptCache.get(cacheKey);
    if (!firstDeptCache.has(cacheKey)) {
      arr = await getFirstDeptsApi({
        startDate: currentDate.value,
        endDate: currentDate.value,
      });
      firstDeptCache.set(cacheKey, arr);
    }
    firstDeptList.value = arr;

    // 默认选中第一个一级科室并展开（原一级科室仍存在时保留）
    if (arr && arr.length > 0) {
      const targetDept = arr.find((item) => item.CliSerGroupID === preferDeptId) || arr[0];
      await onClickDept(targetDept);
      // 默认选中第一个二级科室（原二级科室仍存在时保留）
      const targetDeptId = targetDept.CliSerGroupID;
      nextTick(async () => {
        const secondDepts = secondDeptMap.value[targetDeptId];
        if (secondDepts && secondDepts.length > 0) {
          const targetSecondDept =
            secondDepts.find((child) => child.CLGRPRowId === preferSecondDeptId) || secondDepts[0];
          await onClickSecondDept(targetSecondDept);
        }
      });
    }
  }

  // 点击一级科室
  async function onClickDept(item) {
    const id = item.CliSerGroupID;
    // 缓存按“院区 + 一级科室 + 日期”隔离，不同日期的二级科室可能不同
    const cacheKey = `${hospitalStore.current}:${id}:${currentDate.value}`;

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

  // 挂号费可能为 null / undefined / 空串，统一转为数字或 null
  function toPrice(value) {
    if (value === null || value === undefined || value === '') return null;
    const num = Number(value);
    return Number.isNaN(num) ? null : num;
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
          // 医生级别的价格仅为兜底（时段价格缺失时使用），
          // 实际展示以每个时段的 price 为准，见下方汇总逻辑
          price: null,
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
        // 不同时段（上午/下午/晚上）的挂号费可能不同，价格必须挂在时段上
        price: toPrice(item.RegFee),
        total: Number(item.AvailableTotalNum),
        left: Number(item.AvailableLeftNum),
        scheduleItemCode: item.ScheduleItemCode,
        ScheduleStatusDesc: item.ScheduleStatusDesc,
      });
    });

    // 汇总医生级别价格：取各时段中的最低价作为兜底价（时段自身价格优先）
    return Array.from(map.values()).map((doctor) => {
      const prices = doctor.schedule.map((item) => item.price).filter((price) => price !== null);
      if (!prices.length) return doctor;
      return { ...doctor, price: Math.min(...prices) };
    });
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
    // HIS-COMPAT：特殊期当日挂号页不请求排班数据，保持空列表；过期删除本分支
    if (hisCompatScheduleBlocked.value) {
      doctors.value = [];
      loading.value = false;
      return;
    }
    // 待放号日期不请求排班接口，转为展示倒计时
    // （HIS-COMPAT：9/17 当天日期条内只有待放号日期，默认选中即会走到这里）
    if (pendingDate.value && currentDate.value === pendingDate.value) {
      pendingViewDate.value = currentDate.value;
      loading.value = false;
      return;
    }
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
    // HIS-COMPAT：特殊期当日挂号页不请求排班数据，保持空列表；过期删除本分支
    if (hisCompatScheduleBlocked.value) {
      availableDateList.value = [];
      weekLoading.value = false;
      return;
    }
    const currentId = ++requestId;
    weekLoading.value = true;

    availableDateList.value = [];
    try {
      const schedules = await getSchedulesApi({
        deptCode: currentSecondDept.value,
        doctorCode: null,
        startDate: dates.value[0],
        endDate: dates.value[dates.value.length - 1],
      });

      // ⭐ 如果不是最新请求，直接丢弃，用于解决连续点击多个科室导致的并发请求问题
      if (currentId !== requestId) return;

      availableDateList.value = buildDateAvailability(schedules, dates.value[0], dates.value[dates.value.length - 1]);
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

  // 日期变化后整体刷新：左侧两级科室按新日期重新拉取（尽量保留原选中科室），
  // 右侧医生排班由重新选中的二级科室自动加载
  function refreshByDate(date) {
    const keepDeptId = currentDept.value;
    const keepSecondDeptId = currentSecondDept.value;
    currentDate.value = date;
    initData();
    getFirstDepts(keepDeptId, keepSecondDeptId);
  }

  // 选择日期
  function onClickDate(date) {
    // 待放号日期：只展示倒计时，不请求排班接口
    if (date === pendingDate.value) {
      pendingViewDate.value = date;
      // 左侧科室同样按待放号日期刷新
      refreshByDate(date);
      return;
    }
    pendingViewDate.value = null;
    refreshByDate(date);
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

  // #region 放号时间段定时器
  let boundaryTimer = null;
  let tickTimer = null;

  // 待放号窗口内每秒刷新，用于倒计时与 20:00 自动放号
  function startTick() {
    if (tickTimer) return;
    tickTimer = setInterval(() => {
      now.value = Date.now();
    }, 1000);
  }

  function stopTick() {
    if (!tickTimer) return;
    clearInterval(tickTimer);
    tickTimer = null;
  }

  // 在 19:50 / 20:00 / 次日 00:00 三个边界刷新时间，实现状态自动切换（无需刷新页面）
  function refreshTimers() {
    now.value = Date.now();
    clearTimeout(boundaryTimer);

    const t = dayjs(now.value);
    const boundaries = [
      t.hour(19).minute(50).second(0).millisecond(0),
      t.hour(20).minute(0).second(0).millisecond(0),
      t.add(1, 'day').startOf('day'),
    ];
    const next = boundaries.find((item) => item.valueOf() > Date.now());
    const delay = next ? next.diff(dayjs(now.value)) : 60 * 1000;
    boundaryTimer = setTimeout(refreshTimers, Math.max(delay, 0) + 200);

    // 有待放号日期展示时就要每秒刷新倒计时
    // （正常时段待放号只在 19:50-20:00 出现，条件等价；HIS-COMPAT：9/17 全天展示待放号）
    if (isPendingPeriod.value || pendingDate.value) {
      startTick();
    } else {
      stopTick();
    }
  }

  // 20:00 放号：刷新整周号源状态；若正在查看倒计时，则自动切换到第 8 天
  watch(pendingDate, (val) => {
    if (val) return;
    const releasedDate = pendingViewDate.value;
    if (releasedDate) {
      pendingViewDate.value = null;
      if (dates.value.includes(releasedDate)) {
        // 放号后左侧科室按放号日期刷新，右侧排班由重新选中的二级科室自动加载
        refreshByDate(releasedDate);
        return;
      }
    }
    if (currentSecondDept.value) loadWeekDoctors();
  });

  // 跨天保护：页面长时间停留时，日期条整体发生变化（跨过 00:00，或 HIS-COMPAT 特殊期开始/结束）
  // 后重置已不在日期区间内的选中日期
  watch(
    () => dates.value.join(),
    () => {
      if (dates.value.includes(currentDate.value)) return;
      currentDate.value = dates.value[0];
      if (currentSecondDept.value) {
        loadDoctors();
        loadWeekDoctors();
      }
    },
  );

  onMounted(() => {
    refreshTimers();
  });

  onBeforeUnmount(() => {
    clearTimeout(boundaryTimer);
    boundaryTimer = null;
    stopTick();
  });
  // #endregion

  onMounted(() => {
    if (type === 'schedule') return;
    openNoticeDialogOnce();
  });

  return {
    type,
    currentDept,
    dates,
    currentDate,
    pendingDate,
    pendingViewDate,
    isPendingView,
    countdownText,
    // HIS-COMPAT：特殊期标记，供日期条样式使用，过期整体删除
    hisCompatActive,
    onlyAvailable,
    doctors,
    loading,
    format,
    formatToFull,
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
