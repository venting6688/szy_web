import AuthLayout from '@/views/auth/Layout.vue';
const routes = [
  // { path: '/auth/login', component: () => import('@/views/auth/Login.vue') },
  // { path: '/auth/register', component: () => import('@/views/auth/Register.vue') },
  {
    path: '/auth',
    component: AuthLayout,
    children: [
      {
        path: '/login',
        component: () => import('@/views/auth/Login.vue'),
      },
      {
        path: '/register',
        component: () => import('@/views/auth/Register.vue'),
      },
      {
        path: '/forget-password',
        component: () => import('@/views/auth/ForgetPassword.vue'),
      },
    ],
  },
  {
    path: '/mobile-auth',
    component: () => import('@/views-mobile/auth/Layout.vue'),
    children: [
      {
        path: '/mobile/login',
        component: () => import('@/views-mobile/auth/Login.vue'),
      },
      {
        path: '/mobile/register',
        component: () => import('@/views-mobile/auth/Register.vue'),
      },
      {
        path: '/mobile/forget-password',
        component: () => import('@/views-mobile/auth/ForgetPassword.vue'),
      },
    ],
  },
  {
    path: '/',
    component: () => import('@/layout/PCLayout.vue'),
    redirect: '/appointment-today',
    children: [
      { path: '/appointment', component: () => import('@/views/appointment/Appointment.vue') },
      { path: '/appointment-today', component: () => import('@/views/appointment/Appointment.vue') },
      { path: '/order', component: () => import('@/views/order/Order.vue') },
      { path: '/profile', component: () => import('@/views/profile/Profile.vue') },
    ],
  },
  {
    path: '/mobile',
    component: () => import('@/layout/MobileLayout.vue'),
    redirect: '/mobile/appointment-today',
    children: [
      // [OLD] 旧逻辑：移动端直接复用 PC 视图
      // { path: '/mobile/appointment-today', component: () => import('@/views/appointment/Appointment.vue') },
      // { path: '/mobile/appointment', component: () => import('@/views/appointment/Appointment.vue') },
      // { path: '/mobile/order', component: () => import('@/views/order/Order.vue') },
      // { path: '/mobile/profile', component: () => import('@/views/profile/Profile.vue') },
      // [FIXED] 新逻辑：移动端路由指向 views-mobile 分层页面
      { path: '/mobile/appointment-today', component: () => import('@/views-mobile/appointment/Appointment.vue') },
      { path: '/mobile/appointment', component: () => import('@/views-mobile/appointment/Appointment.vue') },
      { path: '/mobile/order', component: () => import('@/views-mobile/order/Order.vue') },
      { path: '/mobile/profile', component: () => import('@/views-mobile/profile/Profile.vue') },
    ],
  },
];
export default routes;
// export default [
//   {
//     path: '/',
//     name: 'home',
//     component: () => import('@/views/HomeView.vue'),
//   },
//   {
//     path: '/pinia',
//     name: 'pinia',
//     component: () => import('@/views/PiniaView.vue'),
//   },
// ];
