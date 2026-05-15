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
let isFirstRoute = true;
router.beforeEach((to, from, next) => {
  NProgress.start();
  const token = getToken();
  const isMobileDevice = isMobile();
  const firstEnter = isFirstRoute;
  isFirstRoute = false;
  if (isMobileDevice && !to.path.startsWith('/h5')) {
    if (to.path === '/schedule') return next('/h5/schedule');
    if (to.path === '/login') return next('/h5/login');
    if (to.path === '/register') return next('/h5/register');
    if (to.path === '/forget-password') return next('/h5/forget-password');
    if (to.path === '/appointment-today') return next('/h5/appointment-today');
    if (to.path === '/appointment') return next('/h5/appointment');
    if (to.path === '/order') return next('/h5/order');
    if (to.path === '/profile-user') return next('/h5/profile');
    return next('/h5/appointment');
  }

  if (!isMobileDevice && to.path.startsWith('/h5')) {
    return next('/');
  }
  const whiteList = ['/login', '/register', '/h5/login', '/h5/register', '/forget-password', '/h5/forget-password'];
  // 3. 登录判断
  if (token) {
    if (whiteList.includes(to.path)) {
      return next(isMobileDevice ? '/h5/appointment-today' : '/appointment-today');
    }
    return next();
  } else {
    if (whiteList.includes(to.path)) {
      return next();
    }
    // 未登录跳转登录页
    if (!firstEnter) {
      MessagePlugin.warning('请先登录');
    }
    // MessagePlugin.warning('请先登录');
    return next(isMobileDevice ? '/h5/login' : '/login');
  }
});

router.afterEach(() => {
  NProgress.done();
});

export default router;
