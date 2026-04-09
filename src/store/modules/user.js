import { defineStore } from 'pinia';
import { getToken, setToken, removeToken } from '@/utils/index';

export const useUserStore = defineStore('user', {
  state: () => ({
    token: getToken() || '',
    userInfo: {
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
    },
  }),
  actions: {
    setLogin(token, userInfo) {
      this.token = token;
      this.userInfo = userInfo;
      setToken(token);
      localStorage.setItem('userInfo', JSON.stringify(userInfo));
    },

    logout() {
      this.token = '';
      this.userInfo = {};
      removeToken();
      localStorage.removeItem('userInfo');
    },
  },
});
