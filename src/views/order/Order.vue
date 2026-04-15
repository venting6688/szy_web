<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue';
import { MessagePlugin } from 'tdesign-vue-next';

import { getAppointmentsApi, cancelAppointmentApi } from '@/api/order';
import OrderCard from '@/components/OrderCard/OrderCard.vue';
import dayjs from 'dayjs';

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
</script>

<template>
  <div class="order-container">
    <div class="order-header">
      <div class="title">预约记录</div>
      <div class="info">
        <span>如需修改个人信息，请修改后点击提交按钮</span>
      </div>
    </div>
    <div
      v-if="loading"
      class="loading"
    >
      <t-loading
        v-if="loading"
        :delay="50"
        size="small"
      ></t-loading>
      加载中...
    </div>
    <div v-else-if="orderList.length">
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
.order-container {
  padding: 20px;
  .order-header {
    margin-bottom: 20px;
    .title {
      font-size: 24px;
      font-weight: 800;
      line-height: 30px;
    }
    .info {
      line-height: 34px;
      font-size: @font-base;
      font-weight: 400;
      color: @text-regular;
    }
  }
  .empty {
    margin-top: 120px;
  }
  .loading {
    width: 100%;
    text-align: center;
    margin-top: 100px;
  }
}
</style>
