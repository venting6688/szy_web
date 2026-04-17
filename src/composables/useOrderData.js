import { ref, reactive, computed, watch, onMounted } from 'vue';
import { MessagePlugin } from 'tdesign-vue-next';

import { getAppointmentsApi, cancelAppointmentApi } from '@/api/order';
import dayjs from 'dayjs';

export function useOrderData() {
  const orderList = ref([]);

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
    console.log('取消预约', order);
    loading.value = true;
    MessagePlugin.loading('取消预约中...', 1000);
    const { ResultCode } = await cancelAppointmentApi({
      transactionId: order.SeqCode,
      orderNo: order.OrderCode,
    });
    if (ResultCode == '0') {
      setTimeout(() => {
        getOrderList();
      }, 1000);
    }
  }

  const loading = ref(false);

  onMounted(() => {
    console.log('Component mounted!');
    getOrderList();
  });

  return {
    orderList,
    loading,
    cancelEmit,
    getOrderList,
  };
}
