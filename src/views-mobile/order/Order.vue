<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useOrderData } from '@/composables/useOrderData';

const { orderList, loading, cancelEmit, getOrderList } = useOrderData();

const pageRef = ref(null);
const pullDistance = ref(0);
const pullStartY = ref(0);
const isPulling = ref(false);
const isRefreshing = ref(false);
const visibleCount = ref(8);
const loadMoreRef = ref(null);

let io = null;

const statusMap = {
  normal: '已预约',
  cancel: '已取消',
  finished: '已完成',
};

const renderedOrders = computed(() => {
  return orderList.value.slice(0, visibleCount.value);
});

const cancellableCount = computed(() => {
  return orderList.value.filter((item) => item.AllowRefundFlag === 'Y' && item.OrderStatus === 'normal').length;
});

const canLoadMore = computed(() => {
  return renderedOrders.value.length < orderList.value.length;
});

const pullHint = computed(() => {
  if (isRefreshing.value) return '刷新中...';
  return pullDistance.value > 64 ? '松开立即刷新' : '下拉刷新';
});

const pullIndicatorStyle = computed(() => {
  return {
    transform: `translate3d(0, ${Math.max(pullDistance.value - 48, -48)}px, 0)`,
    opacity: pullDistance.value > 0 || isRefreshing.value ? 1 : 0,
  };
});

function canCancel(order) {
  return order.AllowRefundFlag === 'Y' && order.OrderStatus === 'normal';
}

function getScrollContainer() {
  return pageRef.value?.closest('.mobile-main') || pageRef.value?.parentElement;
}

function resetVisibleOrders() {
  visibleCount.value = 8;
}

function increaseVisibleOrders() {
  if (!canLoadMore.value) return;
  visibleCount.value += 8;
}

async function refreshList() {
  if (isRefreshing.value) return;
  isRefreshing.value = true;
  try {
    await getOrderList();
    resetVisibleOrders();
  } finally {
    pullDistance.value = 0;
    isRefreshing.value = false;
  }
}

async function onClickCancel(order) {
  await cancelEmit(order);
}

function onTouchStart(event) {
  const scrollContainer = getScrollContainer();
  if (!scrollContainer || scrollContainer.scrollTop > 0) {
    isPulling.value = false;
    return;
  }
  pullStartY.value = event.touches[0].clientY;
  isPulling.value = true;
}

function onTouchMove(event) {
  if (!isPulling.value || isRefreshing.value) return;
  const delta = event.touches[0].clientY - pullStartY.value;
  if (delta <= 0) {
    pullDistance.value = 0;
    return;
  }
  pullDistance.value = Math.min(delta * 0.45, 88);
  if (pullDistance.value > 0) {
    event.preventDefault();
  }
}

function onTouchEnd() {
  if (!isPulling.value) return;
  isPulling.value = false;
  if (pullDistance.value >= 64) {
    refreshList();
    return;
  }
  pullDistance.value = 0;
}

function setupLoadMoreObserver() {
  if (io) {
    io.disconnect();
    io = null;
  }
  const target = loadMoreRef.value;
  const root = getScrollContainer();
  if (!target || !root) return;
  io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          increaseVisibleOrders();
        }
      });
    },
    {
      root,
      rootMargin: '0px 0px 120px 0px',
      threshold: 0.1,
    },
  );
  io.observe(target);
}

watch(
  () => orderList.value,
  async () => {
    resetVisibleOrders();
    await nextTick();
    setupLoadMoreObserver();
  },
  { deep: true },
);

onMounted(async () => {
  await nextTick();
  setupLoadMoreObserver();
});

onBeforeUnmount(() => {
  if (io) io.disconnect();
});
</script>

<template>
  <div
    ref="pageRef"
    class="mobile-order-page"
    @touchstart="onTouchStart"
    @touchmove="onTouchMove"
    @touchend="onTouchEnd"
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

    <section class="hero-card">
      <div class="hero-title">预约记录</div>
      <div class="hero-subtitle">查看历史预约并支持可退单据取消</div>
      <div class="hero-stats">
        <span class="stat-pill">总计 {{ orderList.length }} 条</span>
        <span class="stat-pill cancelable">可取消 {{ cancellableCount }} 条</span>
      </div>
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
          v-for="item in renderedOrders"
          :key="item.OrderCode"
          class="order-card"
        >
          <div class="card-header">
            <div class="patient">{{ item.OrderApptUser || '-' }}</div>
            <span
              class="status"
              :class="item.OrderStatus || 'normal'"
            >
              {{ statusMap[item.OrderStatus] || '未知状态' }}
            </span>
          </div>

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

        <div
          v-if="canLoadMore"
          ref="loadMoreRef"
          class="load-more-anchor"
        >
          上拉加载更多记录
        </div>
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

.list-panel {
  padding: clamp(14px, 4vw, 18px);
  background: @bg-white;
  border-radius: clamp(16px, 4vw, 20px);
  box-shadow: @shadow-card;
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
  border: 1px solid @border-light;
  border-radius: clamp(14px, 3.5vw, 18px);
  box-shadow: 0 8px 18px rgb(0 0 0 / 4%);
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

.load-more-anchor {
  padding: 8px 0 4px;
  font-size: 12px;
  color: @text-secondary;
  text-align: center;
}

@media (orientation: landscape) {
  .order-list {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
