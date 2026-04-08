import AuthLayout from '@/views/auth/Layout.vue';
const routes = [
  // { path: '/auth/login', component: () => import('@/views/auth/Login.vue') },
  // { path: '/auth/register', component: () => import('@/views/auth/Register.vue') },
  {
    path: '/',
    component: AuthLayout,
    children: [
      {
        path: '/login',
        component: () => import('@/views/auth/login.vue'),
      },
      {
        path: '/register',
        component: () => import('@/views/auth/register.vue'),
      },
    ],
  },
  {
    path: '/',
    component: () => import('@/layout/PCLayout.vue'),
    redirect: '/appointment',
    children: [
      { path: 'appointment', component: () => import('@/views/appointment/Appointment.vue') },
      { path: 'order', component: () => import('@/views/order/Order.vue') },
      { path: 'profile', component: () => import('@/views/profile/Profile.vue') },
    ],
  },
  // {
  //   path: '/',
  //   component: () => import('@/layout/MobileLayout.vue'),
  //   children: [
  //     { path: 'home', component: () => import('@/views/home/Home.vue') },
  //     { path: 'department', component: () => import('@/views/department/DepartmentList.vue') },
  //     { path: 'doctor', component: () => import('@/views/doctor/DoctorList.vue') },
  //     { path: 'appointment', component: () => import('@/views/appointment/Appointment.vue') },
  //     { path: 'appointment', component: () => import('@/views/appointment/List.vue') },
  //     { path: 'profile', component: () => import('@/views/profile/Profile.vue') },
  //   ],
  // },
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
