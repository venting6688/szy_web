import { createRouter, createWebHistory } from 'vue-router';
import { MessagePlugin } from 'tdesign-vue-next';
import NProgress from 'nprogress';
import { getToken } from '@/utils/index';
import { isMobile } from '@/utils/index';

const files = import.meta.glob('./modules/*.js', {
  eager: true,
});

// 路由暂存
const routeModuleList = [];

// 遍历路由模块
Object.keys(files).forEach((key) => {
  const module = files[key].default || {};
  const moduleList = Array.isArray(module) ? [...module] : [module];
  routeModuleList.push(...moduleList);
});

// 存放动态路由
const asyncRouterList = [...routeModuleList];

// 存放固定路由
const defaultRouterList = [];

const routes = [...defaultRouterList, ...asyncRouterList];

const router = createRouter({
  history: createWebHistory(import.meta.env.VITE_BASE_URL),
  routes,
  scrollBehavior() {
    return {
      el: '#app',
      top: 0,
      behavior: 'smooth',
    };
  },
});

router.beforeEach((to, from, next) => {
  NProgress.start();
  const token = getToken();
  const isMobileDevice = isMobile();

  // 1. 设备重定向
  if (isMobileDevice && !to.path.startsWith('/mobile')) {
    return next('/mobile/home');
  }

  if (!isMobileDevice && to.path.startsWith('/mobile')) {
    return next('/');
  }

  // 2. 白名单
  const whiteList = ['/login', '/register', '/mobile/login', '/mobile/register'];

  // 3. 登录判断
  if (token) {
    if (whiteList.includes(to.path)) {
      return next(isMobileDevice ? '/mobile/appointment' : '/appointment');
    }
    return next();
  } else {
    if (whiteList.includes(to.path)) {
      return next();
    }
    // 未登录跳转登录页
    MessagePlugin.warning('请先登录');
    return next(isMobileDevice ? '/mobile/login' : '/login');
  }
});

router.afterEach(() => {
  NProgress.done();
});

export default router;
