<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useOrderData } from '@/composables/useOrderData';

const { orderList, loading, cancelEmit, getOrderList, hospitalOptions, hospitalId, onChangeHospital } = useOrderData();

function canCancel(order) {
  return order.AllowRefundFlag === 'Y' && order.OrderStatus === 'normal';
}

async function onClickCancel(order) {
  await cancelEmit(order);
}
</script>

<template>
  <div
    ref="pageRef"
    class="mobile-order-page"
  >
    <!-- <div
      class="pull-indicator"
      :style="pullIndicatorStyle"
    >
      <t-loading
        v-if="isRefreshing"
        size="small"
      />
      <span>{{ pullHint }}</span>
    </div> -->

    <!-- <section class="hero-card">
      <div class="hero-title">预约记录</div>
      <div class="hero-subtitle">查看历史预约并支持可退单据取消</div>
      <div class="hero-stats">
        <span class="stat-pill">总计 {{ orderList.length }} 条</span>
        <span class="stat-pill cancelable">可取消 {{ cancellableCount }} 条</span>
      </div>
    </section> -->

    <section
      v-if="hospitalOptions.length"
      class="filter-bar"
    >
      <div class="filter-label">当前院区</div>
      <t-select
        v-model="hospitalId"
        size="large"
        placeholder="请选择院区"
        @change="onChangeHospital"
        class="filter-select"
      >
        <t-option
          v-for="item in hospitalOptions"
          :key="item.value"
          :value="item.value"
          :label="item.label"
        />
      </t-select>
    </section>

    <section class="list-panel">
      <div
        v-if="loading"
        class="state-block"
      >
        <t-loading
          :delay="50"
          size="small"
        ></t-loading>
        <span>加载中...</span>
      </div>

      <div
        v-else-if="!orderList.length"
        class="state-block"
      >
        <t-empty
          description="未查询到预约信息"
          title="暂无数据"
        >
        </t-empty>
      </div>

      <div
        v-else
        class="order-list"
      >
        <!-- 与 PC 差异：多行信息卡统一改为移动端单列流式卡片 -->
        <article
          v-for="item in orderList"
          :key="item.OrderCode"
          class="order-card"
        >
          <div class="card-grid">
            <div class="row">
              <span class="label">就诊人姓名</span>
              <span class="value">{{ item.OrderApptUser || '-' }}</span>
            </div>
            <div class="row">
              <span class="label">预约科室</span>
              <span class="value">{{ item.Department || '-' }}</span>
            </div>
            <div class="row">
              <span class="label">预约医生</span>
              <span class="value">{{ item.Doctor || '-' }}</span>
            </div>
            <div class="row">
              <span class="label">预约时间</span>
              <span class="value">{{ item.OrderApptDate }} {{ item.SessionName }}（{{ item.AdmitRange }}）</span>
            </div>
          </div>

          <div class="card-actions">
            <button
              v-if="canCancel(item)"
              type="button"
              class="btn-cancel"
              @click="onClickCancel(item)"
            >
              取消预约
            </button>
            <span
              v-else
              class="btn-disabled"
            >
              不可取消
            </span>
          </div>
        </article>
      </div>
    </section>
  </div>
</template>

<style scoped lang="less">
.mobile-order-page {
  min-height: 100%;
  padding: clamp(12px, 3.5vw, 18px);
  padding-bottom: calc(clamp(20px, 6vw, 28px) + env(safe-area-inset-bottom));
  overscroll-behavior-y: contain;
  touch-action: manipulation;
  background: linear-gradient(180deg, rgb(32 133 126 / 8%) 0, rgb(32 133 126 / 0%) 160px), @bg-page;
}

.pull-indicator {
  position: sticky;
  top: 0;
  z-index: 5;
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: center;
  height: 40px;
  font-size: 12px;
  color: @text-regular;
  transform: translate3d(0, -48px, 0);
  transition:
    transform 0.2s ease,
    opacity 0.2s ease;
  will-change: transform;
}

.hero-card {
  padding: clamp(14px, 4vw, 18px);
  margin-bottom: clamp(12px, 4vw, 18px);
  color: #fff;
  background: linear-gradient(135deg, #20857e 0%, #36a095 100%);
  border-radius: clamp(14px, 4vw, 18px);
  box-shadow: 0 10px 24px rgb(32 133 126 / 18%);
  transform: translateZ(0);
}

.hero-title {
  font-size: clamp(20px, 5vw, 24px);
  font-weight: 700;
}

.hero-subtitle {
  margin-top: 6px;
  font-size: clamp(12px, 3.2vw, 14px);
  opacity: 0.9;
}

.hero-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.filter-bar {
  margin-bottom: clamp(12px, 4vw, 18px);
  padding: 12px;
  background: @bg-white;
  border-radius: clamp(14px, 4vw, 18px);
  box-shadow: @shadow-card;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;

  .filter-label {
    font-size: 15px;
    color: @text-secondary;
    width: 30%;
  }
}

.stat-pill {
  padding: 4px 10px;
  font-size: 12px;
  background: rgb(255 255 255 / 14%);
  border: 1px solid rgb(255 255 255 / 32%);
  border-radius: 999px;

  &.cancelable {
    background: rgb(255 244 225 / 26%);
  }
}

.state-block {
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: center;
  justify-content: center;
  min-height: 240px;
  color: @text-secondary;
}

.order-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.order-card {
  padding: clamp(14px, 3.8vw, 18px);
  background: linear-gradient(180deg, #fff 0%, #fcfdfd 100%);
  border: 1.5px solid @border-light;
  border-radius: clamp(14px, 3.5vw, 18px);
  box-shadow: 0 8px 18px rgb(0 0 0 / 10%);
  transform: translateZ(0);
}

.card-header {
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: space-between;
}

.patient {
  font-size: clamp(16px, 4.2vw, 18px);
  font-weight: 700;
  color: @text-primary;
}

.status {
  padding: 4px 10px;
  font-size: 12px;
  border: 1px solid @border-color;
  border-radius: 999px;

  &.normal {
    color: @primary-color;
    background: @primary-color-fade;
    border-color: rgb(32 133 126 / 24%);
  }

  &.cancel {
    color: @text-secondary;
    background: #f5f6f8;
  }

  &.finished {
    color: @success-color;
    background: rgb(0 168 112 / 10%);
    border-color: rgb(0 168 112 / 22%);
  }
}

.card-grid {
  margin-top: 10px;
}

.row {
  display: grid;
  grid-template-columns: 76px 1fr;
  gap: 10px;
  margin-top: 8px;
  font-size: 13px;
}

.label {
  color: @text-secondary;
}

.value {
  line-height: 1.5;
  color: @text-primary;

  &.code {
    word-break: break-all;
  }
}

.card-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 14px;
}

.btn-cancel {
  min-width: 88px;
  height: 34px;
  padding: 0 14px;
  font-size: 12px;
  color: #fff;
  background: @warning-color;
  border: 0;
  border-radius: 999px;
  transform: translateZ(0);

  &:active {
    transform: scale(0.96) translateZ(0);
  }
}

.btn-disabled {
  min-width: 88px;
  height: 34px;
  padding: 0 14px;
  font-size: 12px;
  line-height: 34px;
  color: @text-secondary;
  text-align: center;
  background: #f2f3f5;
  border-radius: 999px;
}

@media (orientation: landscape) {
  .order-list {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
