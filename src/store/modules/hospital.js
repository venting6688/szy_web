import { defineStore } from 'pinia';
import { getHospitalBranchesApi } from '@/api/hospital';

export const useHospitalStore = defineStore('hospital', {
  state: () => ({
    list: [], // 院区列表
    current: null, // 当前院区
  }),

  actions: {
    async fetchHospitalList() {
      if (this.list.length) return; // ⭐ 防止重复请求

      try {
        // 调用API获取院区列表
        const branches = await getHospitalBranchesApi({
          code: '1237000049557358X0',
        });

        // 转换结构
        this.list = branches.map((item) => ({
          label: item.branchName,
          value: item.branchCode,
        }));

        // 默认选中第一个
        this.current = this.list[0]?.value;
      } catch (e) {
        console.error('获取院区失败', e);
      }
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
