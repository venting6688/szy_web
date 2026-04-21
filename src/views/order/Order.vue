<script setup lang="ts">
import OrderCard from '@/components/OrderCard/OrderCard.vue';
import { useOrderData } from '@/composables/useOrderData';

const { orderList, loading, hospitalOptions, cancelEmit, hospitalId, onChangeHospital } = useOrderData();
</script>

<template>
  <div class="order-container">
    <div class="order-header">
      <div class="title">预约记录</div>

      <t-select
        v-model="hospitalId"
        @change="onChangeHospital"
        size="large"
        style="width: 500px"
      >
        <t-option
          v-for="item in hospitalOptions"
          :key="item.value"
          :value="item.value"
          :label="item.label"
        />
      </t-select>
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
      v-else
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
    display: flex;
    align-items: center;
    justify-content: space-between;
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
