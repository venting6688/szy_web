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
    path: '/h5-auth',
    component: () => import('@/views-mobile/auth/Layout.vue'),
    children: [
      {
        path: '/h5/login',
        component: () => import('@/views-mobile/auth/Login.vue'),
      },
      {
        path: '/h5/register',
        component: () => import('@/views-mobile/auth/Register.vue'),
      },
      {
        path: '/h5/forget-password',
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
      { path: '/profile-user', component: () => import('@/views/profile/Profile.vue') },
    ],
  },
  {
    path: '/h5',
    component: () => import('@/layout/MobileLayout.vue'),
    redirect: '/h5/appointment-today',
    children: [
      { path: '/h5/appointment-today', component: () => import('@/views-mobile/appointment/Appointment.vue') },
      { path: '/h5/appointment', component: () => import('@/views-mobile/appointment/Appointment.vue') },
      { path: '/h5/order', component: () => import('@/views-mobile/order/Order.vue') },
      { path: '/h5/profile', component: () => import('@/views-mobile/profile/Profile.vue') },
    ],
  },
];
export default routes;
