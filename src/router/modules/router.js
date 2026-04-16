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
      { path: '/mobile/appointment-today', component: () => import('@/views/appointment/Appointment.vue') },
      { path: '/mobile/appointment', component: () => import('@/views/appointment/Appointment.vue') },
      { path: '/mobile/order', component: () => import('@/views/order/Order.vue') },
      { path: '/mobile/profile', component: () => import('@/views/profile/Profile.vue') },
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
