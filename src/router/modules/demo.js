const routes = [
  { path: '/auth/login', component: () => import('@/views/auth/Login.vue') },
  { path: '/auth/register', component: () => import('@/views/auth/Register.vue') },
  {
    path: '/',
    component: () => import('@/layout/PCLayout.vue'),
    children: [
      { path: '', component: () => import('@/views/home/Home.vue') },
      // { path: 'department', component: () => import('@/views/department/DepartmentList.vue') },
      // { path: 'doctor', component: () => import('@/views/doctor/DoctorList.vue') },
      { path: 'registration', component: () => import('@/views/registration/Registration.vue') },
      // { path: 'appointment', component: () => import('@/views/appointment/List.vue') },
      { path: 'profile', component: () => import('@/views/profile/Profile.vue') },
    ],
  },
  // {
  //   path: '/',
  //   component: () => import('@/layout/MobileLayout.vue'),
  //   children: [
  //     { path: '', component: () => import('@/views/home/Home.vue') },
  //     { path: 'department', component: () => import('@/views/department/DepartmentList.vue') },
  //     { path: 'doctor', component: () => import('@/views/doctor/DoctorList.vue') },
  //     { path: 'registration', component: () => import('@/views/registration/Registration.vue') },
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
