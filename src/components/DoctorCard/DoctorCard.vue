<script setup>
import { defineProps } from 'vue';

const props = defineProps({
  doctor: Object,
});

const ellipsisState = ref({
  row: 3,
  // expandable: true,
  // collapsible: true,
  tooltipProps: {
    content: props.doctor.desc,
    placement: 'top',
    theme: 'light',
  },
});

// 处理动态图片路径的方法
const getImageUrl = (path) => {
  // 检查路径是否以 '@/' 开头，如果是，则使用 new URL 进行解析
  if (path && path.startsWith('@/')) {
    // Vite 推荐的动态导入静态资源的方式
    // 注意：这里的 '../../' 是因为 @/assets 实际上是相对于 src 目录的，
    // 而当前组件在 src/components/DoctorCard，所以需要向上两级到 src，再向下到 assets
    return new URL(path.replace('@/', '../../'), import.meta.url).href;
  }
  return path; // 如果不是 '@/' 开头的路径，直接返回（例如，完整的URL）
};

const emit = defineEmits(['book']);

// import { getScheduleDetailApi } from '@/api/schedule';
// async function getScheduleDetail() {
//   const res = await getScheduleDetailApi({
//     scheduleItemCode: props.doctor.scheduleItemCode,
//     deptCode: props.doctor.deptCode,
//   });
//   console.log('获取号源', res);
// }
// watch(() => props.doctor, getScheduleDetail, { immediate: true });
</script>

<template>
  <div class="doctor-card">
    <!-- 上半部分 -->
    <div class="card-top">
      <img
        :src="`https://szyyy.sdzydfy.com/img/${doctor.code}.jpg`"
        class="avatar"
      />
      <div class="info">
        <div class="name-row">
          <span class="name">{{ doctor.name }}</span>
          <span class="title">{{ doctor.doctorType }}</span>
        </div>
        <t-typography-paragraph :ellipsis="ellipsisState">{{ doctor.desc }}</t-typography-paragraph>
      </div>

      <div class="price">￥{{ doctor.price }}</div>
    </div>

    <!-- 下半部分 -->
    <div class="card-bottom">
      <div
        class="time-row"
        v-for="item in doctor.schedule"
        :key="item.period"
      >
        <div class="left">
          <span class="date">{{ doctor.date }}</span>
          <span class="period">{{ item.period }}</span>
          <span
            class="remain"
            :class="item.left > 0 ? 'green' : 'gray'"
          >
            剩余 {{ item.left }}
          </span>
        </div>

        <t-button
          v-if="item.left > 0"
          size="small"
          class="btn-book"
          @click="emit('book', doctor, item.period)"
        >
          预约
        </t-button>
      </div>
    </div>
  </div>
</template>
<style scoped lang="less">
.doctor-card {
  background: @bg-white;
  border: 1px solid @border-color;
  border-radius: @radius-base;
  padding: @space-lg;
  box-shadow: @shadow-card;
  height: 100%;
}

/* 上半部分 */
.card-top {
  display: flex;
  position: relative;
  /* 头像 */
  .avatar {
    flex: 0 0 auto;
    width: 96px;
    height: 120px;
    border-radius: @radius-small;
    margin-right: @space-md;
  }
}

/* 信息 */
.name {
  font-size: @font-medium;
  color: @text-primary;
  font-weight: 600;
}

.title {
  font-size: @font-base;
  color: @text-secondary;
}

.desc {
  font-size: @font-base;
  color: @text-regular;
  width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 价格 */
.price {
  position: absolute;
  right: 0;
  top: 0;
  font-size: @font-medium;
  color: @warning-color;
}

/* 下半部分 */
.card-bottom {
  margin-top: @space-md;
  border-top: 1px solid @border-light;
  padding-top: @space-sm;
}

.time-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: @space-sm;
}

.remain {
  &.gray {
    color: @text-secondary;
  }

  &.green {
    color: @success-color;
    font-weight: 500;
  }
}

/* 按钮 */
.btn-wait {
  width: 72px;
  height: 28px;
  background: @warning-color-fade;
  color: @warning-color;
  border-radius: 29px;
  border: 0;
}

.btn-book {
  width: 72px;
  height: 28px;
  background: @primary-color-fade;
  color: @primary-color;
  border-radius: 29px;
  border: 0;
}
</style>
