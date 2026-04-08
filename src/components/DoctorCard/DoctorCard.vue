<script setup>
import { defineProps } from 'vue';

const props = defineProps({
  doctor: Object,
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
</script>

<template>
  <div class="doctor-card">
    <!-- 上半部分 -->
    <div class="card-top">
      <img
        :src="getImageUrl(doctor.avatar)"
        class="avatar"
      />

      <div class="info">
        <div class="name-row">
          <span class="name">{{ doctor.name }}</span>
          <span class="title">{{ doctor.title }}</span>
        </div>

        <div class="desc">
          {{ doctor.desc }}
        </div>
      </div>

      <div class="price">￥{{ doctor.price }}</div>
    </div>

    <!-- 下半部分 -->
    <div class="card-bottom">
      <!-- 上午 -->
      <div class="time-row">
        <div class="left">
          <span class="date">{{ doctor.date }}</span>
          <span class="period">上午</span>
          <span class="remain gray">剩余 {{ doctor.am }}</span>
        </div>

        <t-button
          size="small"
          class="btn-wait"
          v-if="doctor.am === 0"
          @click="emit('book', doctor)"
        >
          +候补
        </t-button>
      </div>

      <!-- 下午 -->
      <div class="time-row">
        <div class="left">
          <span class="date">{{ doctor.date }}</span>
          <span class="period">下午</span>
          <span
            class="remain"
            :class="doctor.pm > 0 ? 'green' : 'gray'"
          >
            剩余 {{ doctor.pm }}
          </span>
        </div>

        <t-button
          size="small"
          class="btn-book"
          :disabled="doctor.pm === 0"
          @click="emit('book', doctor)"
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
}

/* 上半部分 */
.card-top {
  display: flex;
  position: relative;
}

/* 头像 */
.avatar {
  width: 80px;
  height: 80px;
  border-radius: @radius-small;
  margin-right: @space-md;
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
  background: fade(@warning-color, 15%);
  color: @warning-color;
  border-radius: @radius-small;
}

.btn-book {
  background: @success-color;
  color: #fff;
  border-radius: @radius-small;
}
</style>
