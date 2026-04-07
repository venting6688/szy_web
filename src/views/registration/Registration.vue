<template>
  <div class="registration flex bg-white rounded-lg overflow-hidden">
    <!-- 左侧科室 -->
    <div class="dept w-60 border-r">
      <div
        v-for="item in deptList"
        :key="item.id"
        class="dept-item"
        :class="{ active: currentDept === item.id }"
        @click="selectDept(item.id)"
      >
        {{ item.name }}
      </div>
    </div>

    <!-- 右侧内容 -->
    <div class="flex-1 p-4">
      <!-- 日期选择（预约挂号才显示） -->
      <div v-if="type === 'appointment'" class="date-bar mb-4 flex gap-2">
        <div
          v-for="date in dateList"
          :key="date"
          class="date-item"
          :class="{ active: currentDate === date }"
          @click="currentDate = date"
        >
          {{ formatDate(date) }}
        </div>
      </div>

      <!-- 筛选 -->
      <div class="mb-4 flex justify-end">
        <t-switch v-model="onlyAvailable" label="只看有号" />
      </div>

      <!-- 医生列表 -->
      <div class="grid grid-cols-2 gap-4">
        <div v-for="doc in filteredDoctors" :key="doc.id" class="doctor-card">
          <img :src="doc.avatar" class="avatar" />

          <div class="flex-1">
            <div class="name">{{ doc.name }}</div>
            <div class="title">{{ doc.title }}</div>
          </div>

          <div class="price">￥{{ doc.price }}</div>

          <t-button size="small" theme="primary" :disabled="!doc.available"> 挂号 </t-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import dayjs from 'dayjs';

// 页面类型：appointment | today
const type = ref('appointment');

// 科室
const deptList = ref([
  { id: 1, name: '内科' },
  { id: 2, name: '外科' },
  { id: 3, name: '骨科' },
]);

const currentDept = ref(1);

// 日期
const dateList = ref(Array.from({ length: 7 }, (_, i) => dayjs().add(i, 'day').format('YYYY-MM-DD')));

const currentDate = ref(dateList.value[0]);

// 筛选
const onlyAvailable = ref(false);

// 医生（假数据）
const doctorList = ref([
  {
    id: 1,
    name: '张医生',
    title: '主任医师',
    price: 28,
    available: true,
    avatar: 'https://via.placeholder.com/40',
  },
  {
    id: 2,
    name: '李医生',
    title: '副主任医师',
    price: 20,
    available: false,
    avatar: 'https://via.placeholder.com/40',
  },
]);

// 筛选医生
const filteredDoctors = computed(() => {
  if (!onlyAvailable.value) return doctorList.value;
  return doctorList.value.filter((d) => d.available);
});

// 方法
const selectDept = (id) => {
  currentDept.value = id;
};

const formatDate = (date) => {
  return dayjs(date).format('MM-DD');
};
</script>

<style lang="less" scoped>
.dept-item {
  padding: 12px;
  cursor: pointer;

  &.active {
    background: #e6f4ff;
    color: #1677ff;
  }
}

.date-item {
  padding: 6px 12px;
  border: 1px solid #ddd;
  cursor: pointer;

  &.active {
    background: #1677ff;
    color: #fff;
  }
}

.doctor-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border: 1px solid #eee;
  border-radius: 6px;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}
</style>
