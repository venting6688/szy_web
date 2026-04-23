<template>
  <div class="order-card">
    <!-- 顶部 -->
    <!-- <div class="header">
      <div class="hospital">{{ order.HospitalName }}</div>
      <div
        class="status"
        :class="order.OrderStatus"
      >
        {{ statusMap[order.OrderStatus] || '未知状态' }}
      </div>
    </div> -->

    <!-- 主体 -->
    <div class="content">
      <div class="row">
        <span class="label">预约就诊人姓名：</span>
        <span>{{ order.OrderApptUser }}</span>
      </div>
      <div class="row">
        <span class="label">预约科室：</span>
        <span>{{ order.Department }}</span>
      </div>

      <div class="row">
        <span class="label">预约医生：</span>
        <span>{{ order.Doctor }}</span>
      </div>

      <div class="row">
        <span class="label">预约时间：</span>
        <span> {{ order.OrderApptDate }} {{ order.SessionName }} （{{ order.AdmitRange }}） </span>
      </div>

      <!-- <div class="row">
        <span class="label">预约地点：</span>
        <span>{{ order.AdmitAddress }}</span>
      </div>

      <div class="row">
        <span class="label">挂号费：</span>
        <span>{{ order.RegFee }} 元</span>
      </div> -->
    </div>

    <!-- 底部操作 -->
    <div class="right-actions">
      <button
        v-if="canCancel"
        class="cancel-btn"
        @click="handleCancel"
      >
        取消预约
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  order: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['cancel']);

// 状态映射
const statusMap = {
  normal: '已预约',
  cancel: '已取消',
  finished: '已完成',
};

// 是否可取消
const canCancel = computed(() => {
  return props.order.AllowRefundFlag === 'Y' && props.order.OrderStatus === 'normal';
});

// 取消事件
const handleCancel = () => {
  emit('cancel', props.order);
};
</script>

<style scoped lang="less">
.order-card {
  display: flex;
  background: #fff;
  padding: 16px;
  margin-bottom: 12px;
  width: 1200px;
  height: 150px;
  background: #ffffff;
  border-radius: 14px;
  box-shadow: 0px 4px 8px 0px rgba(0, 0, 0, 0.05);
  justify-content: space-between;
  align-items: center;

  .header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 10px;
  }

  .hospital {
    font-weight: bold;
  }

  .status {
    font-size: 12px;
  }

  .status.normal {
    color: #1890ff;
  }
  .status.cancel {
    color: #999;
  }
  .status.finished {
    color: #52c41a;
  }

  .row {
    margin: 10px 0;
    font-size: 14px;
    .label {
      width: 120px;
      display: inline-block;
      color: #999999;
    }
  }

  .right-actions {
    margin-top: 10px;
    text-align: right;
    .cancel-btn {
      cursor: pointer;
      width: 98px;
      height: 32px;
      padding: 4px 10px;
      border: none;
      background: @warning-color;
      color: #fff;
      border-radius: 24px;
    }
  }
}
</style>
