<script setup>
import { useRoute, useRouter } from 'vue-router';
import { useUserStore } from '@/store/modules/user';
import FooterMobile from '@/components/Footer/FooterMobile.vue';

const userStore = useUserStore();
const route = useRoute();
const router = useRouter();

//#region 导航图标
import today from '@/assets/image/today.png';
import todayActive from '@/assets/image/today_active.png';

import appointment from '@/assets/image/appointment.png';
import appointmentActive from '@/assets/image/appointment_active.png';

import order from '@/assets/image/order.png';
import orderActive from '@/assets/image/order_active.png';

import profile from '@/assets/image/profile.png';
import profileActive from '@/assets/image/profile_active.png';

const navList = [
  {
    name: '当日挂号',
    path: '/h5/appointment-today',
    icon: today,
    activeIcon: todayActive,
  },
  {
    name: '预约挂号',
    path: '/h5/appointment',
    icon: appointment,
    activeIcon: appointmentActive,
  },
  {
    name: '预约记录',
    path: '/h5/order',
    icon: order,
    activeIcon: orderActive,
  },
  {
    name: '个人中心',
    path: '/h5/profile',
    icon: profile,
    activeIcon: profileActive,
  },
];
//#endregion

const go = (path) => {
  if (route.path === path) return;
  router.push(path);
};

const isActive = (path) => {
  return route.path === path;
};

const getIcon = (item) => {
  return isActive(item.path) ? item.activeIcon : item.icon;
};

// 退出登录
function onClickLogout() {
  try {
    userStore.logout();
    router.push('/h5/login');
  } catch (error) {
    console.error('退出登录失败:', error);
  }
}
</script>

<template>
  <div class="mobile-layout">
    <!-- 顶部栏 -->
    <div class="mobile-topbar">
      <div class="topbar-content">
        <div class="title">山东省中医院</div>
        <div class="user-info">
          <span>{{ userStore.userInfo.realName }}</span>
          <t-button
            size="small"
            theme="warning"
            @click="onClickLogout"
            class="logout-btn"
          >
            退出
          </t-button>
        </div>
      </div>
    </div>

    <!-- 主体内容 -->
    <div class="mobile-main">
      <router-view :key="route.path" />
    </div>

    <!-- 底部导航 -->
    <div class="mobile-nav">
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

    <!-- 移动端页脚 -->
    <FooterMobile />
  </div>
</template>

<style scoped lang="less">
.mobile-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: @bg-page;
}

/* ================= 顶部栏 ================= */
.mobile-topbar {
  background: @primary-color;
  color: #fff;
  flex-shrink: 0;
  position: sticky;
  top: 0;
  z-index: 100;

  .topbar-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: @space-md @space-lg;

    .title {
      font-size: @font-large;
      font-weight: 600;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: @space-sm;
      font-size: @font-base;
    }
  }
}

/* ================= 主体内容 ================= */
.mobile-main {
  flex: 1;
  overflow-y: auto;
}

/* ================= 底部导航 ================= */
.mobile-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: @bg-white;
  border-top: 1px solid @border-color;
  display: flex;
  justify-content: space-around;
  height: 60px;
  z-index: 100;

  .nav-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    cursor: pointer;
    transition: all 0.2s;

    .nav-icon {
      width: 24px;
      height: 24px;
      object-fit: contain;
    }

    span {
      font-size: 12px;
      color: @text-regular;
    }

    &.active {
      span {
        color: @primary-color;
        font-weight: 500;
      }
    }
  }
}

/* ================= 通用优化 ================= */
:deep(.t-button--theme-warning) {
  background: @warning-color;
  border-color: @warning-color;
}

.logout-btn {
  width: 50px;
  height: 24px;
  border-radius: 12px;
  font-size: 12px;
}
</style>
