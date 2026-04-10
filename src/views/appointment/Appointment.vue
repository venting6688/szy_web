<script setup>
import { ref, watch, computed } from 'vue';
import dayjs from 'dayjs';
import { useRouter } from 'vue-router';
import DoctorCard from '@/components/DoctorCard/DoctorCard.vue';
import { getFirstDeptsApi, getSecondDeptsApi } from '@/api/department';
import { getSchedulesApi, getScheduleDetailApi } from '@/api/schedule';
import { createAppointmentApi } from '@/api/appointment';
import { AddIcon, CloudUploadIcon, SearchIcon, CloudDownloadIcon, DiscountIcon } from 'tdesign-icons-vue-next';
import downIcon from '@/assets/image/down.png';
import rightIcon from '@/assets/image/right.png';
import Dialog from '@/views/appointment/Dialog.vue';

const router = useRouter();
const type = 'appointment';

const currentDept = ref(-1);

const dates = Array.from({ length: 7 }, (_, i) => dayjs().add(i, 'day').format('YYYY-MM-DD'));

const currentDate = ref(dates[0]);

const onlyAvailable = ref(false);

const doctors = ref([]);
const loading = ref(false);
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
    startDate: currentDate.value,
    endDate: currentDate.value,
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
    startDate: currentDate.value,
    endDate: currentDate.value,
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
  console.log('子科室', child);
  loading.value = true;
  currentSecondDept.value = child.CLGRPRowId;

  loadDoctors();
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
  console.log('医生排班', doctors.value);
  loading.value = false;
}
//#endregion

// #region 院区
// 院区
import { useHospitalStore } from '@/store/modules/hospital';
import { MessagePlugin } from 'tdesign-vue-next';
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
  console.log('预约医生txt：', doctor, period);
  dialogRef.value.book(doctor, period);
}
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
            size="large"
          >
            <t-option
              v-for="item in hospitalOptions"
              :key="item.value"
              :value="item.value"
              :label="item.label"
            />
          </t-select>

          <t-input
            input-class="search-input"
            placeholder="搜索科室"
            v-model="searchDept"
            size="large"
          >
            <template #suffix>
              <t-button theme="primary"
                >搜索<template #icon><search-icon /></template
              ></t-button>
            </template>
          </t-input>
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
            @click="onClickDate(d)"
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
            <t-loading
              v-if="loading"
              :delay="50"
              size="small"
            ></t-loading>
            加载中...
          </div>

          <!-- 空状态 -->
          <div
            v-else-if="!doctors.length"
            class="empty"
          >
            <t-empty
              description="该日期暂无医生排班"
              title="暂无数据"
            >
            </t-empty>
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
              @book="bookEmit"
            />
          </div>
        </div>
      </div>
    </div>
    <!-- 预约弹窗 -->
    <Dialog ref="dialogRef" />
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
      background: @primary-color-fade;
    }
  }

  /* 一级 */
  .level-1 {
    font-weight: 500;
    &.active {
      background: @primary-color;
      color: #fff;
      font-weight: 500;
    }
  }

  /* 二级 */
  .level-2 {
    padding-left: 36px;
    font-size: @font-base;
    color: @text-regular;

    &:hover {
      color: @primary-color;
    }
    &.active {
      background: @primary-color-fade;
      color: @primary-color;
      font-weight: 500;
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
  .search-input {
    width: 56px;
    button {
      border-radius: 8px;
    }
  }
}

/* ================= 日期 ================= */
.date-bar {
  display: flex;
  gap: @space-md;
  margin-bottom: @space-lg;
  justify-content: space-between;

  .date-item {
    width: 13%;
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
      .sub {
        color: inherit;
      }
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
  .loading,
  .empty {
    width: 100%;
    text-align: center;
    margin-top: 100px;
  }
}
</style>
