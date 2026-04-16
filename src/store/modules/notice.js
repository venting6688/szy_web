import { defineStore } from 'pinia';

export const useNoticeStore = defineStore('notice', {
  state: () => ({
    // 是否已经通知过
    isNotified: false,
  }),
  actions: {
    // 设置是否通知过
    setIsNotified(notified) {
      this.isNotified = notified;
    },
  },
});
