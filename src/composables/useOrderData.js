import { ref, onMounted } from 'vue';
import dayjs from 'dayjs';
import { MessagePlugin } from 'tdesign-vue-next';
import { getAppointmentsApi, cancelAppointmentApi } from '@/api/order';

export function useOrderData() {
  const orderList = ref([]);
  const loading = ref(false);

  async function getOrderList() {
    const res = await getAppointmentsApi({
      startDate: dayjs().format('YYYY-MM-DD'),
      endDate: dayjs().add(7, 'day').format('YYYY-MM-DD'),
    });
    orderList.value = res || [];
    loading.value = false;
  }

  async function cancelEmit(order) {
    loading.value = true;
    MessagePlugin.loading('取消预约中...', 1000);
    const { ResultCode } = await cancelAppointmentApi({
      transactionId: order.SeqCode,
      orderNo: order.OrderCode,
    });
    if (ResultCode === '0') {
      setTimeout(() => {
        getOrderList();
      }, 1000);
      return;
    }
    loading.value = false;
  }

  onMounted(() => {
    getOrderList();
  });

  return {
    orderList,
    loading,
    cancelEmit,
    getOrderList,
  };
}
