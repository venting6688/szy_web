import { ref, reactive, computed, watch, onMounted } from 'vue';
import { MessagePlugin } from 'tdesign-vue-next';

import { getAppointmentsApi, cancelAppointmentApi } from '@/api/order';
import dayjs from 'dayjs';
import { useHospitalStore } from '@/store/modules/hospital';
const hospitalStore = useHospitalStore();

export function useOrderData() {
  onMounted(() => {
    // getOrderList();
  });
  const loading = ref(false);

  const orderList = ref([]);
  const hospitalId = ref('');
  // 院区列表
  const hospitalOptions = computed(() => hospitalStore.list.filter((item) => item.appointment === true));
  // 切换院区
  function onChangeHospital() {
    loading.value = true;
    hospitalStore.setHospital(hospitalId.value);
    getOrderList();
  }
  // 如果监听到院区列表不为空了，初始化院区为第一个院区
  watch(
    hospitalOptions,
    (newVal) => {
      if (newVal.length === 0) return;
      const isCBD = hospitalStore.current === hospitalStore.list.find((item) => item.appointment === false)?.value;
      hospitalId.value = (isCBD ? import.meta.env.VITE_HOSPITAL_ID : hospitalStore.current) || newVal[0].value;
      onChangeHospital();
    },
    { immediate: true },
  );
  // 获取订单列表
  async function getOrderList() {
    const res = await getAppointmentsApi({
      // patientNo: '0010060062',
      startDate: dayjs().format('YYYY-MM-DD'),
      endDate: dayjs().add(7, 'day').format('YYYY-MM-DD'),
    });
    orderList.value = res || [];
    loading.value = false;
  }

  async function cancelEmit(order) {
    // 确认取消预约
    const confirmInstance = await DialogPlugin.confirm({
      header: '确认取消预约',
      body: '确认取消预约吗？',
      // className: 't-dialog-new-class1 t-dialog-new-class2',
      // style: 'color: rgba(0, 0, 0, 0.6)',
      onConfirm: async () => {
        loading.value = true;
        MessagePlugin.loading('取消预约中...', 1000);
        const { ResultCode } = await cancelAppointmentApi({
          transactionId: order.SeqCode,
          orderNo: order.OrderCode,
        });
        if (ResultCode == '0') {
          confirmInstance.hide();
          setTimeout(() => {
            getOrderList();
            loading.value = false;
          }, 1000);
        }
      },
    });
  }

  return {
    orderList,
    loading,
    hospitalId,
    hospitalOptions,
    // 切换院区
    onChangeHospital,
    // 取消预约
    cancelEmit,
    getOrderList,
  };
}
