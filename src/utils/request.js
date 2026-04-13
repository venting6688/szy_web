import axios from 'axios';
import router from '@/router';
import { getToken, removeToken } from '@/utils/index/auth';
// 如果你用 TDesign
import { MessagePlugin } from 'tdesign-vue-next';

import { useHospitalStore } from '@/store/modules/hospital';

// 创建请求实例
const instance = axios.create({
  baseURL: import.meta.env.VITE_GLOB_DOMAIN_URL, // 不使用代理
  // baseURL: '/http', // 使用代理
  timeout: 10000,
  withCredentials: false,
});
const whiteList = [
  '/mobile/miniProgramLogin',
  '/mobile/api/sendYunMsg',
  '/mobile/webRegister',
  '/mobile/api/getHospitalBranchesByCode',
];

// ================== 请求拦截 ==================
instance.interceptors.request.use(
  async (config) => {
    const token = getToken();

    // ✔ 自动携带 token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // 如果是白名单中的API，不添加hospitalId
    if (whiteList.includes(config.url)) {
      return config;
    }

    const hospitalStore = useHospitalStore();

    // 如果当前院区为空且不是白名单接口，则等待初始化完成
    if (!hospitalStore.current) {
      try {
        await hospitalStore.fetchHospitalList();
      } catch (error) {
        console.error('等待医院列表初始化失败:', error);
      }
    }

    if (config.method === 'get') {
      config.params = {
        hospitalId: hospitalStore.current,
        ...config.params,
      };
    }

    if (config.method === 'post') {
      config.data = {
        hospitalId: hospitalStore.current,
        ...config.data,
      };
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// ================== 响应拦截 ==================
instance.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    const { response } = error;

    // ✔ token 失效 / 未登录
    if (response?.status === 401) {
      removeToken();

      MessagePlugin.warning('登录已过期，请重新登录');

      router.replace('/login');
    }

    // ✔ 其他错误
    const message = response?.data?.message || error.message || '网络异常';

    MessagePlugin.error(message);

    return Promise.reject(error);
  },
);

// ================== 请求方法封装 ==================

export function post(url, data = {}, params = {}) {
  return instance({
    method: 'post',
    url,
    data,
    params,
  });
}

export function get(url, params = {}) {
  return instance({
    method: 'get',
    url,
    params,
  });
}

export function put(url, data = {}, params = {}) {
  return instance({
    method: 'put',
    url,
    data,
    params,
  });
}

export function _delete(url, params = {}) {
  return instance({
    method: 'delete',
    url,
    params,
  });
}

export default instance;
