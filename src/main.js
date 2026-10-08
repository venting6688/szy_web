import { createApp } from 'vue';

import App from './App.vue';
import router from './router';
import store from './store';

import '@/style/tailwind.css';
import '@/assets/main.css';
import '@/style/index.less';

// 引入组件库全局样式资源
import 'tdesign-vue-next/es/style/index.css';

// 禁用 F12、右键菜单、开发者工具与查看源代码快捷键，静默拦截（仅防普通用户，非安全边界）
const DEVTOOLS_KEYS = ['I', 'J', 'C'];
document.addEventListener(
  'keydown',
  (e) => {
    const key = typeof e.key === 'string' ? e.key.toUpperCase() : '';
    const withCtrl = e.ctrlKey || e.metaKey;
    const isF12 = e.key === 'F12' || e.keyCode === 123;
    const isDevtools = withCtrl && e.shiftKey && DEVTOOLS_KEYS.includes(key);
    const isViewSource = withCtrl && !e.shiftKey && !e.altKey && key === 'U';
    if (isF12 || isDevtools || isViewSource) {
      e.preventDefault();
      e.returnValue = false;
    }
  },
  true,
);
document.addEventListener('contextmenu', (e) => e.preventDefault());

createApp(App).use(router).use(store).mount('#app');
