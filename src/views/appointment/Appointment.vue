<script setup>
import { ref, watch, computed } from 'vue';
import dayjs from 'dayjs';
import { useRouter } from 'vue-router';
import DoctorCard from '@/components/DoctorCard/DoctorCard.vue';
import { getFirstDeptsApi, getSecondDeptsApi } from '@/api/department';
import { getSchedulesApi, getScheduleDetailApi } from '@/api/schedule';
import downIcon from '@/assets/image/down.png';
import rightIcon from '@/assets/image/right.png';

const router = useRouter();
const type = 'appointment';

const handleBook = (doctor) => {
  console.log('预约医生：', doctor);
  // TODO：跳转挂号确认页
  router.push({
    path: '/appointment/confirm',
    query: {
      doctorId: doctor.id,
      date: currentDate.value,
    },
  });
};

const currentDept = ref(-1);

const dates = Array.from({ length: 7 }, (_, i) => dayjs().add(i, 'day').format('YYYY-MM-DD'));

const currentDate = ref(dates[0]);

const onlyAvailable = ref(false);

const doctors = ref([]);
const format = (d) => dayjs(d).format('MM月DD日');

const displayDoctors = computed(() => {
  if (!onlyAvailable.value) return doctors.value;
  return doctors.value.filter((d) => d.schedule.some((s) => s.left > 0));
});
//#region 科室
const firstDeptList = ref([]);
const secondDeptMap = ref({}); // 存子科室
const openDept = ref(null); // 当前展开的一级科室
async function getFirstDepts() {
  const arr = await getFirstDeptsApi({
    startDate: '2026-04-09',
    endDate: '2026-04-09',
  });
  console.log('大科室', arr);
  firstDeptList.value = arr;
}
// 点击一级科室
async function onClickDept(item) {
  const id = item.CliSerGroupID;

  // 切换展开状态
  if (openDept.value === id) {
    openDept.value = null;
    return;
  }

  openDept.value = id;
  currentDept.value = id;

  // 如果已经加载过，就不再请求
  if (secondDeptMap.value[id]) return;

  const data = await getSecondDeptsApi({
    departmentGroupCode: id,
    startDate: '2026-04-09',
    endDate: '2026-04-09',
  });
  if (Array.isArray(data)) {
    secondDeptMap.value[id] = data;
  } else {
    secondDeptMap.value[id] = [data];
  }
  console.log('子科室', secondDeptMap.value[id]);
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
        name: item.DoctorName,
        price: item.RegFee,
        desc: item.DocIntruduction,
        doctorType: item.DoctorSessType,
        scheduleItemCode: item.ScheduleItemCode,
        schedule: [],
      });
    }
    const doctor = map.get(code);
    doctor.schedule.push({
      period: item.SessionName,
      total: Number(item.AvailableTotalNum),
      left: Number(item.AvailableLeftNum),
    });
  });
  return Array.from(map.values());
}

const currentSecondDept = ref(null);
// 点击子科室
async function onClickSecondDept(child) {
  console.log('子科室', child);
  currentSecondDept.value = child.DeptCode;
  // 加载医生排班
  const schedules = await getSchedulesApi({
    deptCode: child.CLGRPRowId,
    doctorCode: null,
    startDate: '2026-04-09',
    endDate: '2026-04-09',
  });
  doctors.value = transformSchedule(schedules, child.CLGRPRowId);
  console.log('医生排班', doctors.value);
}
//#endregion

// #region 院区
// 院区
import { useHospitalStore } from '@/store/modules/hospital';
const hospitalStore = useHospitalStore();
// 院区列表
const hospitalOptions = computed(() => hospitalStore.list);
// 当前院区
const hospitalId = ref(null);
// 切换院区
function onChangeHospital() {
  hospitalStore.setHospital(hospitalId.value);
  getFirstDepts();
}
// 如果监听到院区列表不为空了，初始化院区为第一个院区
watch(
  hospitalOptions,
  (newVal) => {
    if (newVal.length === 0) return;
    hospitalId.value = newVal[0].value;
    onChangeHospital();
  },
  { immediate: true },
);
// #endregion
</script>
<template>
  <div class="page">
    <!-- 面包屑 -->
    <div class="breadcrumb">首页 > 预约诊疗 > <span>预约挂号</span></div>

    <div class="content">
      <!-- 左侧科室 -->
      <div class="left">
        <div class="dept-title">预约挂号</div>

        <div
          v-for="item in firstDeptList"
          :key="item.CliSerGroupID"
          class="dept-group"
        >
          <!-- 一级 -->
          <div
            class="dept-item level-1"
            :class="{ active: currentDept === item.CliSerGroupID }"
            @click="onClickDept(item)"
          >
            <!-- 图标 -->
            <img
              class="icon"
              :src="openDept === item.CliSerGroupID ? downIcon : rightIcon"
            />

            {{ item.CliSerGroupName }}
          </div>

          <!-- 二级 -->
          <div
            v-if="openDept === item.CliSerGroupID"
            class="dept-children"
          >
            <div
              v-for="child in secondDeptMap[item.CliSerGroupID] || []"
              :key="child.CLGRPRowId"
              class="dept-item level-2"
              :class="{ active: currentSecondDept === child.CLGRPRowId }"
              @click="onClickSecondDept(child)"
            >
              {{ child.CLGRPDesc }}
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧 -->
      <div class="right">
        <!-- 搜索区域 -->
        <div class="search-bar">
          <t-select
            v-model="hospitalId"
            @change="onChangeHospital"
          >
            <t-option
              v-for="item in hospitalOptions"
              :key="item.value"
              :value="item.value"
              :label="item.label"
            />
          </t-select>

          <t-input
            placeholder="搜索科室"
            style="width: 240px"
          />

          <t-button theme="primary">搜索</t-button>
        </div>

        <!-- 日期 -->
        <div
          v-if="type === 'appointment'"
          class="date-bar"
        >
          <div
            v-for="d in dates"
            :key="d"
            class="date-item"
            :class="{ active: currentDate === d }"
            @click="currentDate = d"
          >
            <div>{{ format(d) }}</div>
            <div class="sub">有号</div>
          </div>
        </div>

        <!-- 标题 -->
        <div class="title flex justify-between">
          <span>{{ format(currentDate) }} 坐诊医生</span>
          <t-switch
            v-model="onlyAvailable"
            label="只看有号"
          />
        </div>

        <!-- 医生列表 -->
        <div class="doctor-list">
          <!-- loading -->
          <div
            v-if="loading"
            class="loading"
          >
            加载中...
          </div>

          <!-- 空状态 -->
          <div
            v-else-if="!doctors.length"
            class="empty"
          >
            暂无医生
          </div>

          <!-- 正常列表 -->
          <div
            v-else
            class="doctor-list-item"
            v-for="doc in displayDoctors"
            :key="doc.code"
          >
            <DoctorCard
              :doctor="doc"
              @book="handleBook"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped lang="less">
.page {
  background: @bg-page;
  padding: @space-xl;
}

/* ================= 面包屑 ================= */
.breadcrumb {
  color: @text-secondary;
  margin-bottom: @space-lg;
  font-size: @font-base;
}

/* ================= 主体 ================= */
.content {
  display: flex;
}

/* ================= 左侧科室 ================= */
.left {
  width: 260px;
  border-right: 1px solid @border-color;
  background: @bg-white;

  .dept-title {
    font-size: 24px;
    font-weight: 600;
    color: @text-primary;
    padding: @space-md;
  }

  .dept-group {
    border-bottom: 1px solid @border-light;
  }

  .dept-item {
    display: flex;
    align-items: center;
    gap: @space-sm;
    padding: @space-md;
    cursor: pointer;
    font-size: @font-base;
    color: @text-regular;
    transition: all 0.2s;

    .icon {
      width: 12px;
      height: 12px;
    }

    &:hover {
      background: fade(@primary-color, 8%);
    }

    &.active {
      background: @primary-color;
      color: #fff;
      font-weight: 500;
    }
  }

  /* 一级 */
  .level-1 {
    font-weight: 500;
  }

  /* 二级 */
  .level-2 {
    padding-left: 36px;
    font-size: @font-base;
    color: @text-regular;

    &:hover {
      color: @primary-color;
    }
  }

  .dept-children {
    background: #fafafa;
  }
}

/* ================= 右侧 ================= */
.right {
  width: calc(100% - 260px);
  flex: 1;
  padding-left: @space-xl;
}

/* ================= 搜索区域 ================= */
.search-bar {
  display: flex;
  gap: @space-md;
  margin-bottom: @space-lg;
}

/* ================= 日期 ================= */
.date-bar {
  display: flex;
  gap: @space-md;
  margin-bottom: @space-lg;

  .date-item {
    border: 1px solid @border-color;
    padding: @space-sm @space-md;
    cursor: pointer;
    border-radius: @radius-small;
    text-align: center;
    min-width: 80px;
    transition: all 0.2s;

    &:hover {
      border-color: @primary-color;
    }

    &.active {
      background: @primary-color;
      color: #fff;
      border-color: @primary-color;
    }

    .sub {
      font-size: @font-small;
      color: @success-color;
      margin-top: @space-xs;
    }
  }
}

/* ================= 标题 ================= */
.title {
  margin-bottom: @space-md;
  font-size: @font-medium;
  color: @text-primary;
  font-weight: 500;
}

/* ================= 医生列表 ================= */
.doctor-list {
  width: 920px;
  display: flex;
  flex-wrap: wrap;
  gap: 18px;
  margin: 0 auto;
  .doctor-list-item {
    width: 448px;
  }
}
</style>
