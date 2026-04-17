import { ref, watch, computed, onMounted } from 'vue';
import dayjs from 'dayjs';
import { useRoute } from 'vue-router';
import { MessagePlugin } from 'tdesign-vue-next';
import { getFirstDeptsApi, getSecondDeptsApi } from '@/api/department';
import { getSchedulesApi } from '@/api/schedule';
import { useHospitalStore } from '@/store/modules/hospital';
import { useNoticeStore } from '@/store/modules/notice';

export function useAppointmentData() {
  const route = useRoute();
  const type = computed(() => (route.path.includes('appointment-today') ? 'appointment-today' : 'appointment'));

  const currentDept = ref(-1);
  const dates = Array.from({ length: 7 }, (_, i) => dayjs().add(i, 'day').format('YYYY-MM-DD'));
  const currentDate = ref(dates[0]);
  const onlyAvailable = ref(false);
  const doctors = ref([]);
  const loading = ref(false);
  const availableDateList = ref([]);

  const firstDeptList = ref([]);
  const secondDeptMap = ref({});
  const openDept = ref(null);
  const currentSecondDept = ref(null);
  const dialogRef = ref(null);

  const hospitalStore = useHospitalStore();
  const hospitalOptions = computed(() => hospitalStore.list);
  const hospitalId = ref(null);

  const displayDoctors = computed(() => {
    if (!onlyAvailable.value) return doctors.value;
    return doctors.value.filter((doctor) => doctor.schedule.some((item) => item.left > 0));
  });

  const format = (date) => dayjs(date).format('MM月DD日');

  function transformSchedule(list, deptCode) {
    const map = new Map();
    list.forEach((item) => {
      const code = item.DocCode;
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

  async function loadDoctors() {
    const schedules = await getSchedulesApi({
      deptCode: currentSecondDept.value,
      doctorCode: null,
      startDate: currentDate.value,
      endDate: currentDate.value,
    });
    doctors.value = transformSchedule(schedules, currentSecondDept.value);
    loading.value = false;
  }

  function buildDateAvailability(scheduleList, startDate, endDate) {
    const map = {};
    scheduleList.forEach((item) => {
      const date = item.ServiceDate;
      const left = Number(item.AvailableLeftNum || 0);
      if (!map[date]) {
        map[date] = 0;
      }
      map[date] += left;
    });

    const result = [];
    let current = dayjs(startDate);
    const end = dayjs(endDate);
    while (current.isBefore(end) || current.isSame(end)) {
      const dateStr = current.format('YYYY-MM-DD');
      const total = map[dateStr] || 0;
      result.push({
        date: dateStr,
        hasAvailable: total > 0,
        total,
      });
      current = current.add(1, 'day');
    }
    return result;
  }

  let requestId = 0;
  async function loadWeekDoctors() {
    const currentId = ++requestId;
    availableDateList.value = [];

    const todaySchedule = await getSchedulesApi({
      deptCode: currentSecondDept.value,
      doctorCode: null,
      startDate: dates[0],
      endDate: dates[0],
    });
    if (currentId !== requestId) return;

    const schedules = await getSchedulesApi({
      deptCode: currentSecondDept.value,
      doctorCode: null,
      startDate: dates[1],
      endDate: dates[dates.length - 1],
    });
    if (currentId !== requestId) return;

    availableDateList.value = [
      buildDateAvailability(todaySchedule, dates[0], dates[0])[0],
      ...buildDateAvailability(schedules, dates[1], dates[dates.length - 1]),
    ];
  }

  function isAvailable(date) {
    return availableDateList.value.find((item) => item.date === date)?.hasAvailable;
  }

  async function onClickDept(item) {
    const id = item.CliSerGroupID;
    if (openDept.value === id) {
      openDept.value = null;
      return;
    }

    openDept.value = id;
    currentDept.value = id;
    if (secondDeptMap.value[id]) return;

    const data = await getSecondDeptsApi({
      departmentGroupCode: id,
      startDate: currentDate.value,
      endDate: currentDate.value,
    });
    secondDeptMap.value[id] = Array.isArray(data) ? data : [data];
  }

  async function getFirstDepts() {
    const list = await getFirstDeptsApi({
      startDate: currentDate.value,
      endDate: currentDate.value,
    });
    firstDeptList.value = list;
    if (list && list.length > 0) {
      await onClickDept(list[0]);
    }
  }

  async function onClickSecondDept(child) {
    loading.value = true;
    currentSecondDept.value = child.CLGRPRowId;
    availableDateList.value = [];
    loadDoctors();
    loadWeekDoctors();
  }

  function initData() {
    doctors.value = [];
    currentSecondDept.value = null;
    firstDeptList.value = [];
    availableDateList.value = [];
    openDept.value = null;
    currentDept.value = -1;
  }

  function onChangeHospital() {
    hospitalStore.setHospital(hospitalId.value);
    initData();
    getFirstDepts();
  }

  function onClickDate(date) {
    if (!currentSecondDept.value) {
      MessagePlugin.warning('请先选择二级科室');
      return;
    }
    currentDate.value = date;
    loadDoctors();
  }

  function bookEmit(doctor, period) {
    dialogRef.value.book(doctor, period);
  }

  function openNoticeDialog() {
    const noticeStore = useNoticeStore();
    if (noticeStore.isNotified) return;
    noticeStore.setIsNotified(true);
    dialogRef.value.openNotice();
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

  watch(
    hospitalOptions,
    (newVal) => {
      if (newVal.length === 0) return;
      hospitalId.value = newVal[0].value;
      onChangeHospital();
    },
    { immediate: true },
  );

  onMounted(() => {
    openNoticeDialog();
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
  };
}
