import { defineStore } from 'pinia';
import { getHospitalBranchesApi } from '@/api/hospital';

export const useHospitalStore = defineStore('hospital', {
  state: () => ({
    list: [], // 院区列表
    current: null, // 当前院区，即各个接口所需的hospitalId
    initPromise: null, // 存储初始化Promise
  }),

  actions: {
    async fetchHospitalList() {
      if (this.list.length) return Promise.resolve(); // ⭐ 如果已经有数据，直接返回
      if (this.initPromise) return this.initPromise; // ⭐ 如果正在请求中，返回正在进行的Promise

      this.initPromise = (async () => {
        try {
          // 调用API获取院区列表
          const branches = await getHospitalBranchesApi({
            code: import.meta.env.VITE_HOSPITAL_CODE || '1237000049557358X0',
          });

          // 转换结构
          this.list = branches.map((item) => ({
            label: item.branchName,
            value: item.branchCode,
          }));

          // 默认选中第一个
          if (this.list.length > 0) {
            this.current = this.list[0].value;
          }
        } catch (e) {
          console.error('获取院区失败', e);
          this.initPromise = null; // 失败后清除Promise，允许重试
          throw e;
        }
      })();

      return this.initPromise;
    },

    // 设置当前院区
    setHospital(code) {
      const hospital = this.list.find((item) => item.value === code);
      if (!hospital) {
        console.warn(`院区${code}不存在`);
        return;
      }
      this.current = hospital.value;
    },
  },
});
