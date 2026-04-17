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

const imgSrc = ref('');

import defaultAvatar from '@/assets/image/default_avatar.png';
watch(
  () => props.doctor,
  (val) => {
    console.log('val', val);
    // if (!val) return;

    imgSrc.value = `https://szyyy.sdzydfy.com/img/${val.code}.jpg`;
  },
  { immediate: true },
);

// 图片加载失败
const onImgError = (e) => {
  imgSrc.value = defaultAvatar;
};

const emit = defineEmits(['book']);
</script>

<template>
  <div class="doctor-card">
    <!-- 上半部分 -->
    <div class="card-top">
      <img
        :src="imgSrc"
        class="avatar"
        @error="onImgError"
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
          <div>
            <span>剩余</span>
            <span
              class="remain"
              :class="item.left > 0 ? 'primary-color' : 'gray'"
            >
              {{ item.left }}
            </span>
          </div>
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
    object-fit: cover;
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
  margin-left: @space-sm;
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
  font-size: @font-large;
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
  .left {
    display: flex;
    align-items: center;
    width: 60%;
    justify-content: space-between;
  }
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
