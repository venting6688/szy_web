import { defineStore } from 'pinia';
import { getToken, setToken, removeToken } from '@/utils/index';

export const useUserStore = defineStore('user', {
  state: () => ({
    token: getToken() || '',
    userInfo: {
      username: '',
      email: '',
    },
  }),
  actions: {
    setLogin(token, userInfo) {
      this.token = token;
      this.userInfo = userInfo;
      setToken(token);
    },

    logout() {
      this.token = '';
      this.userInfo = null;
      removeToken();
    },
  },
});
