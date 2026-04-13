<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue';
import { MessagePlugin } from 'tdesign-vue-next';

import { getAppointmentsApi, cancelAppointmentApi } from '@/api/order';
import OrderCard from '@/components/OrderCard/OrderCard.vue';

const orderList = ref([]);

// 获取订单列表
async function getOrderList() {
  const res = await getAppointmentsApi({
    // patientNo: '0010060062',
    startDate: '2026-04-13',
    endDate: '2026-04-13',
  });
  orderList.value = res || [];
}

async function cancelEmit(order) {
  console.log('取消预约', order);
  const res = await cancelAppointmentApi({
    transactionId: order.SeqCode,
    orderNo: order.OrderCode,
  });
  if (res) {
    MessagePlugin.success('取消预约成功');
    getOrderList();
  }
}

onMounted(() => {
  console.log('Component mounted!');
  getOrderList();
});
</script>

<template>
  <div>
    <div class="order-header">
      <div class="title">订单管理</div>
      <div class="info">
        <span>如需修改个人信息，请修改后点击提交按钮</span>
      </div>
    </div>
    <div v-if="orderList.length">
      <OrderCard
        v-for="item in orderList"
        :key="item.OrderCode"
        :order="item"
        @cancel="cancelEmit"
      />
    </div>
    <!-- 空状态 -->
    <div
      v-if="!orderList.length"
      class="empty"
    >
      <t-empty
        description="未查询到预约信息"
        title="暂无数据"
      >
      </t-empty>
    </div>
  </div>
</template>

<style scoped lang="less">
.order-header {
  margin: 20px 0;
  .title {
    font-size: 24px;
    font-weight: bold;
  }
  .info {
    font-size: 14px;
    color: #999999;
  }
}
.empty {
  margin-top: 120px;
}
</style>
