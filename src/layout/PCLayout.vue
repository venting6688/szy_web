<script setup>
import { useRoute, useRouter } from 'vue-router';
import { useUserStore } from '@/store/modules/user';
const userStore = useUserStore();
const userInfo = userStore.userInfo;

//#region 导航图标
import home from '@/assets/image/home.png';
import homeActive from '@/assets/image/home_active.png';

import today from '@/assets/image/today.png';
import todayActive from '@/assets/image/today_active.png';

import appointment from '@/assets/image/appointment.png';
import appointmentActive from '@/assets/image/appointment_active.png';

import order from '@/assets/image/order.png';
import orderActive from '@/assets/image/order_active.png';

import profile from '@/assets/image/profile.png';
import profileActive from '@/assets/image/profile_active.png';
import Footer from '@/components/Footer/Footer.vue';

const navList = [
  {
    name: '首页',
    path: '/home',
    icon: home,
    activeIcon: homeActive,
  },
  {
    name: '当日挂号',
    path: '/appointment-today',
    icon: today,
    activeIcon: todayActive,
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
    path: '/profile-user',
    icon: profile,
    activeIcon: profileActive,
  },
];
const headerTitle = ref('当日挂号');
//#endregion

const route = useRoute();
const router = useRouter();

const go = (path) => {
  if (route.path === path) return;
  if (path === '/home') {
    window.open('https://www.sdzydfy.com/', '_blank');
  } else {
    router.push(path);
    headerTitle.value = navList.find((item) => item.path === path)?.name || '';
  }
};
const isActive = (path) => {
  return route.path === path;
};
// 获取当前图标
const getIcon = (item) => {
  return isActive(item.path) ? item.activeIcon : item.icon;
};
// 退出登录
function onClickLogout() {
  try {
    userStore.logout();
    router.push('/login');
    // nextTick(() => {

    // });
  } catch (error) {
    console.error('退出登录失败:', error);
  }
}
</script>
<template>
  <div class="layout">
    <!-- 顶部栏 -->
    <div class="topbar">
      <div class="container flex justify-end items-center">
        <div class="user flex items-center gap-3">
          <span>{{ userInfo.realName }}</span>
          <t-button
            size="small"
            theme="warning"
            @click="onClickLogout"
            class="logout-btn"
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
      <!-- 面包屑 -->
      <div class="breadcrumb">
        当前位置： 首页 > 预约诊疗 > <span id="current-page">{{ headerTitle }}</span>
      </div>
      <router-view :key="route.path" />
    </div>

    <!-- 底部 -->
    <Footer />
  </div>
</template>

<style scoped lang="less">
.layout {
  background: @bg-page;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* ================= 顶部栏 ================= */
.topbar {
  height: 54px;
  background: @primary-color;
  color: #fff;
  flex-shrink: 0;

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
  background: linear-gradient(90deg, #dbe3f0 0%, #ced6e3 100%);
  flex-shrink: 0;
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

/* ================= 导航 ================= */
.nav {
  background: @bg-white;
  height: 98px;
  border-bottom: 1px solid @border-color;
  flex-shrink: 0;

  .nav-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: @space-xs;
    cursor: pointer;
    width: 240px;
    height: 98px;

    .nav-icon {
      width: 24px;
      height: 24px;
      object-fit: contain;
      transition: all 0.2s;
    }

    span {
      font-size: @font-large;
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
      border-bottom: 2px solid @primary-color;
      background: @primary-color-fade;
    }
  }
}

/* ================= 主体 ================= */
.main {
  padding: @space-xl 0;
  flex: 1;
}

/* ================= 容器 ================= */
.container {
  width: 1260px;
  height: 100%;
  margin: 0 auto;
  padding: 0px;
  .breadcrumb {
    font-size: @font-large;
    color: @text-regular;
    margin: 20px 0 0 20px;
    #current-page {
      color: @primary-color;
    }
  }
}

/* ================= 通用优化 ================= */

/* 让按钮更贴合设计 */
:deep(.t-button--theme-warning) {
  background: @warning-color;
  border-color: @warning-color;
}
.logout-btn {
  width: 61px;
  height: 26px;
  border-radius: 14px;
}
</style>
