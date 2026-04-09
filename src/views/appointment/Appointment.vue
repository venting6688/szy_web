<script setup>
import { ref, watch, computed } from 'vue';
import dayjs from 'dayjs';
import { useRouter } from 'vue-router';
import DoctorCard from '@/components/DoctorCard/DoctorCard.vue';
import { getFirstDeptsApi, getSecondDeptsApi } from '@/api/department';

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
// 点击科室
async function onClickDept(item) {
  currentDept.value = item.CliSerGroupID;
  // 点击科室后，获取子科室
  const arr = await getSecondDeptsApi({
    departmentGroupCode: item.CliSerGroupID,
    startDate: currentDate.value,
    endDate: currentDate.value,
  });
  console.log('子科室', arr);
}

const dates = Array.from({ length: 7 }, (_, i) => dayjs().add(i, 'day').format('YYYY-MM-DD'));

const currentDate = ref(dates[0]);

const onlyAvailable = ref(false);

const doctors = ref([
  {
    id: 1,
    name: '郭友强',
    price: 28,
    am: 0,
    pm: 20,
    avatar: '@/assets/image/order.png',
  },
  {
    id: 2,
    name: '王芳',
    price: 28,
    am: 0,
    pm: 20,
    avatar: '@/assets/image/order.png',
  },
  {
    id: 3,
    name: '王芳',
    price: 28,
    am: 0,
    pm: 20,
    avatar: '@/assets/image/order.png',
  },
]);
const format = (d) => dayjs(d).format('MM月DD日');

const displayDoctors = computed(() => {
  if (!onlyAvailable.value) return doctors.value;
  return doctors.value.filter((d) => d.am > 0 || d.pm > 0);
});
//#region 科室
const firstDeptList = ref([]);
async function getFirstDepts() {
  const arr = await getFirstDeptsApi({
    startDate: currentDate.value,
    endDate: currentDate.value,
  });
  console.log('大科室', arr);
  firstDeptList.value = arr;
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
        <div class="dept-title">科室分类</div>

        <div
          v-for="item in firstDeptList"
          :key="item.CliSerGroupID"
          class="dept-item"
          :class="{ active: currentDept === item.CliSerGroupID }"
          @click="onClickDept(item)"
        >
          {{ item.CliSerGroupName }}
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
          <div
            class="doctor-list-item"
            v-for="doc in displayDoctors"
            :key="doc.id"
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
  background: @bg-white;
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
  width: 240px;
  border-right: 1px solid @border-color;

  .dept-title {
    font-size: @font-medium;
    font-weight: 600;
    color: @text-primary;
    padding: @space-md;
  }

  .dept-item {
    padding: @space-md;
    cursor: pointer;
    font-size: @font-base;
    color: @text-regular;
    transition: all 0.2s;

    &:hover {
      background: fade(@primary-color, 8%);
    }

    &.active {
      background: fade(@primary-color, 12%);
      color: @primary-color;
      font-weight: 500;
    }
  }
}

/* ================= 右侧 ================= */
.right {
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
  display: flex;
  flex-wrap: wrap;
  gap: @space-xl;
  .doctor-list-item {
    width: 48%;
  }
}
</style>
