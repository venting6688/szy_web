import { defineStore } from 'pinia';
import { getToken, setToken, removeToken } from '@/utils/index';

const defaultUserInfo = {
  birthday: '',
  gender: '',
  nation: '',
  city: null,
  isVerified: '',
  patientId: '',
  idCard: '',
  phonenumber: '',
  province: null,
  email: null,
  idType: '',
  address: '',
  nickName: '',
  avatar: null,
  accessToken: '',
  userId: -1,
  xcxOpenId: null,
  realName: '',
  profileId: -1,
  district: null,
  userUuid: '',
};

export const useUserStore = defineStore('user', {
  state: () => {
    let storedUserInfo = null;
    const stored = localStorage.getItem('userInfo');
    if (stored) {
      try {
        storedUserInfo = JSON.parse(stored);
      } catch (e) {
        storedUserInfo = null;
      }
    }

    return {
      token: getToken() || '',
      userInfo: storedUserInfo || { ...defaultUserInfo },
    };
  },
  actions: {
    setLogin(token, userInfo) {
      this.token = token;
      this.userInfo = userInfo;
      setToken(token);
      localStorage.setItem('userInfo', JSON.stringify(userInfo));
    },
    setUserInfo(userInfo) {
      // 就地合并：保持 userInfo 的引用不变，避免已持有该对象的组件（如 PCLayout）拿不到更新
      Object.assign(this.userInfo, userInfo);
      localStorage.setItem('userInfo', JSON.stringify(this.userInfo));
    },
    logout() {
      this.token = '';
      this.userInfo = { ...defaultUserInfo };
      removeToken();
      localStorage.removeItem('userInfo');
    },
  },
});
