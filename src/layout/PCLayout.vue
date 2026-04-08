<script setup>
import { useRoute, useRouter } from 'vue-router';

//#region 导航图标
import home from '@/assets/image/home.png';
import homeActive from '@/assets/image/home_active.png';

import appointment from '@/assets/image/appointment.png';
import appointmentActive from '@/assets/image/appointment_active.png';

import order from '@/assets/image/order.png';
import orderActive from '@/assets/image/order_active.png';

import profile from '@/assets/image/profile.png';
import profileActive from '@/assets/image/profile_active.png';

const navList = [
  {
    name: '首页',
    path: '/home',
    icon: home,
    activeIcon: homeActive,
  },
  {
    name: '预约挂号',
    path: '/appointment',
    icon: appointment,
    activeIcon: appointmentActive,
  },
  {
    name: '预约记录',
    path: '/order',
    icon: order,
    activeIcon: orderActive,
  },
  {
    name: '个人中心',
    path: '/profile',
    icon: profile,
    activeIcon: profileActive,
  },
];
//#endregion

const route = useRoute();
const router = useRouter();

const go = (path) => {
  if (route.path === path) return;
  if (path === '/home') {
    window.open('https://www.sdzydfy.com/', '_blank');
  } else {
    router.push(path);
  }
};
const isActive = (path) => {
  return route.path.startsWith(path);
};
// 获取当前图标
const getIcon = (item) => {
  return isActive(item.path) ? item.activeIcon : item.icon;
};
</script>
<template>
  <div class="layout">
    <!-- 顶部栏 -->
    <div class="topbar">
      <div class="container flex justify-between items-center">
        <div class="logo">互联网医院</div>
        <div class="user flex items-center gap-3">
          <span>欧阳朵朵</span>
          <t-button
            size="small"
            theme="warning"
            >退出</t-button
          >
        </div>
      </div>
    </div>

    <!-- Banner -->
    <div class="banner">
      <img src="@/assets/image/banner.png" />
    </div>

    <!-- 导航 -->
    <div class="nav">
      <div class="container flex justify-around">
        <div
          v-for="item in navList"
          :key="item.path"
          class="nav-item"
          :class="{ active: isActive(item.path) }"
          @click="go(item.path)"
        >
          <img
            :src="getIcon(item)"
            class="nav-icon"
          />

          <span>{{ item.name }}</span>
        </div>
      </div>
    </div>

    <!-- 主体 -->
    <div class="main container">
      <router-view />
    </div>
  </div>
</template>

<style scoped lang="less">
.layout {
  background: @bg-page;
  min-height: 100vh;
}

/* ================= 顶部栏 ================= */
.topbar {
  height: 60px;
  background: @primary-color;
  color: #fff;

  .logo {
    font-size: @font-medium;
    font-weight: 600;
  }

  .user {
    font-size: @font-base;
  }
}

/* ================= Banner ================= */
.banner {
  height: 220px;
  overflow: hidden;
  background: @bg-white;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

/* ================= 导航 ================= */
.nav {
  background: @bg-white;
  height: 70px;
  border-bottom: 1px solid @border-color;

  .nav-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: @space-xs;
    cursor: pointer;

    .nav-icon {
      width: 24px;
      height: 24px;
      object-fit: contain;
      transition: all 0.2s;
    }

    span {
      font-size: @font-small;
      color: @text-regular;
    }

    &:hover span {
      color: @primary-color;
    }

    &.active {
      span {
        color: @primary-color;
        font-weight: 500;
      }
    }
  }
}

/* ================= 主体 ================= */
.main {
  padding: @space-xl 0;
}

/* ================= 容器 ================= */
.container {
  width: 1200px;
  margin: 0 auto;
}

/* ================= 通用优化 ================= */

/* 让按钮更贴合设计 */
:deep(.t-button--theme-warning) {
  background: @warning-color;
  border-color: @warning-color;
}
</style>
