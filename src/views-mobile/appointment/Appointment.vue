<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import dayjs from 'dayjs';
import downIcon from '@/assets/image/down.png';
import rightIcon from '@/assets/image/right.png';
import Dialog from '@/views/appointment/Dialog.vue';
import { useAppointmentData } from '@/composables/useAppointmentData';
import defaultAvatar from '@/assets/image/default_avatar.png';

const route = useRoute();

const {
  type,
  currentDept,
  dates,
  currentDate,
  onlyAvailable,
  loading,
  format,
  displayDoctors,
  firstDeptList,
  secondDeptMap,
  openDept,
  onClickDept,
  currentSecondDept,
  onClickSecondDept,
  isAvailable,
  hospitalOptions,
  hospitalId,
  onChangeHospital,
  onClickDate,
  dialogRef,
  bookEmit,
  weekDayMap,
  loadDoctors,
  loadWeekDoctors,
  getFirstDepts,
  noticeDialogRef,
  openNoticeDialogOnce,
  openNoticeDialog,
  subLoading,
} = useAppointmentData();

// [FIXED] 兼容 mobile 路由路径，避免 `/mobile/appointment-today` 被识别为普通预约页
const mobileType = computed(() => {
  return route.path.includes('appointment-today') ? 'appointment-today' : type;
});

// 移动端附加状态：筛选面板、下拉刷新、上拉渐进加载
const pageRef = ref(null);
const showHospitalSheet = ref(false);
const showDeptSheet = ref(false);
const pullDistance = ref(0);
const isRefreshing = ref(false);
const pullStartY = ref(0);
const isPulling = ref(false);
const doctorVisibleCount = ref(6);
const loadMoreRef = ref(null);

let io = null;

const renderedDoctors = computed(() => {
  return displayDoctors.value.slice(0, doctorVisibleCount.value);
});

const canLoadMore = computed(() => {
  return renderedDoctors.value.length < displayDoctors.value.length;
});

const currentHospitalLabel = computed(() => {
  return hospitalOptions.value.find((item) => item.value === hospitalId.value)?.label || '请选择院区';
});

const currentDeptLabel = computed(() => {
  if (!currentSecondDept.value) return '请选择科室';
  const allSecondDepts = Object.values(secondDeptMap.value).flat();
  const target = allSecondDepts.find((item) => item.CLGRPRowId === currentSecondDept.value);
  return target?.CLGRPDesc || '请选择科室';
});

const currentSecondDeptList = computed(() => {
  return secondDeptMap.value[currentDept.value] || [];
});

// [FIXED] 参照 DoctorCard，根据医生 code 生成头像地址并支持加载失败回退
const imgSrcMap = ref({});

watch(
  () => displayDoctors.value,
  (list) => {
    list.forEach((doc) => {
      if (doc && doc.code) {
        imgSrcMap.value[doc.code] = `https://szyyy.sdzydfy.com/img/${doc.code}.jpg`;
      }
    });
  },
  { immediate: true, deep: true },
);

function getDoctorImgSrc(doc) {
  if (!doc || !doc.code) return defaultAvatar;
  return imgSrcMap.value[doc.code] || `https://szyyy.sdzyyyf.com/img/${doc.code}.jpg`;
}

function onDoctorImgError(e) {
  e.target.src = defaultAvatar;
}

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

function getScrollContainer() {
  return pageRef.value?.closest('.mobile-main') || pageRef.value?.parentElement;
}

function resetVisibleDoctors() {
  doctorVisibleCount.value = 6;
}

function increaseVisibleDoctors() {
  if (!canLoadMore.value) return;
  doctorVisibleCount.value += 6;
}

async function refreshPageData() {
  if (isRefreshing.value) return;
  isRefreshing.value = true;
  try {
    if (!currentSecondDept.value) {
      await getFirstDepts();
    } else {
      await loadDoctors();
      if (mobileType.value === 'appointment') {
        await loadWeekDoctors();
      }
    }
  } finally {
    pullDistance.value = 0;
    isRefreshing.value = false;
  }
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
    refreshPageData();
    return;
  }
  pullDistance.value = 0;
}

function onOpenHospitalSheet() {
  showHospitalSheet.value = true;
}

async function onOpenDeptSheet() {
  if (!firstDeptList.value.length) {
    await getFirstDepts();
  }
  showDeptSheet.value = true;
}

function onCloseSheets() {
  showHospitalSheet.value = false;
  showDeptSheet.value = false;
}

function onSelectHospital(item) {
  hospitalId.value = item.value;
  onChangeHospital();
  showHospitalSheet.value = false;
}

async function onSelectSecondDept(child) {
  await onClickSecondDept(child);
  showDeptSheet.value = false;
  resetVisibleDoctors();
  await nextTick();
  setupLoadMoreObserver();
}

function onScrollToNextChunk() {
  increaseVisibleDoctors();
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
          onScrollToNextChunk();
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
  () => displayDoctors.value,
  async () => {
    resetVisibleDoctors();
    await nextTick();
    setupLoadMoreObserver();
  },
  { deep: true },
);

watch(
  () => currentDate.value,
  async () => {
    resetVisibleDoctors();
    await nextTick();
    setupLoadMoreObserver();
  },
);

onMounted(async () => {
  await nextTick();
  setupLoadMoreObserver();
});

onBeforeUnmount(() => {
  if (io) {
    io.disconnect();
  }
});
</script>

<template>
  <div
    ref="pageRef"
    class="mobile-appointment-page"
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
      <div class="hero-main">
        <div class="hero-title">预约挂号</div>
        <div class="hero-subtitle">请选择院区与科室后查看坐诊医生</div>
      </div>
      <div class="hero-badge">
        {{ mobileType === 'appointment-today' ? '当日挂号' : '预约挂号' }}
      </div>
    </section> -->

    <section class="filter-section">
      <button
        class="filter-trigger"
        type="button"
        @click="onOpenHospitalSheet"
      >
        <span class="filter-label">院区</span>
        <span class="filter-value">{{ currentHospitalLabel }}</span>
        <img
          class="filter-icon"
          :src="downIcon"
        />
      </button>
      <button
        class="filter-trigger"
        type="button"
        @click="onOpenDeptSheet"
      >
        <span class="filter-label">科室</span>
        <span class="filter-value">{{ currentDeptLabel }}</span>
        <img
          class="filter-icon"
          :src="downIcon"
        />
      </button>
    </section>

    <section
      v-if="mobileType === 'appointment'"
      class="date-section"
    >
      <div class="section-title">可预约日期</div>
      <div class="date-scroll">
        <button
          v-for="d in dates"
          :key="d"
          class="date-chip"
          :class="{ active: currentDate === d }"
          type="button"
          @click="onClickDate(d)"
        >
          <span class="week">{{ dayjs(d).isSame(dayjs(), 'day') ? '今天' : weekDayMap[dayjs(d).day()] }}</span>
          <span class="day">{{ format(d) }}</span>
          <span
            class="status"
            :class="{ unavailable: !isAvailable(d) }"
          >
            {{ isAvailable(d) ? '有号' : '无号' }}
          </span>
        </button>
      </div>
    </section>

    <section class="doctor-panel">
      <div class="panel-header">
        <div>
          <div class="panel-title">{{ format(currentDate) }} 坐诊医生</div>
          <div class="panel-subtitle">
            {{ currentDeptLabel }}
          </div>
        </div>
        <label class="switch-box">
          <span>只看有号</span>
          <t-switch
            v-model="onlyAvailable"
            size="small"
          />
        </label>
      </div>

      <div
        v-if="!currentSecondDept"
        class="state-block"
      >
        <t-empty
          description="请先选择二级科室"
          title="等待选择"
        />
      </div>

      <div
        v-else-if="loading"
        class="state-block"
      >
        <t-loading
          :delay="50"
          size="small"
        ></t-loading>
        <span>加载中...</span>
      </div>

      <div
        v-else-if="!displayDoctors.length"
        class="state-block"
      >
        <t-empty
          description="该日期暂无医生排班"
          title="暂无数据"
        />
      </div>

      <div
        v-else
        class="doctor-list"
      >
        <article
          v-for="doc in renderedDoctors"
          :key="doc.code"
          class="doctor-card"
        >
          <div class="flex-box">
            <div class="left">
              <!-- [OLD]
              <img
                :src="imgSrc"
                class="avatar"
                @error="onImgError"
              />
              -->
              <!-- [FIXED] 参照 DoctorCard，根据医生 code 动态生成头像地址并支持加载失败回退 -->
              <img
                :src="getDoctorImgSrc(doc)"
                class="avatar"
                @error="onDoctorImgError"
              />
            </div>
            <div class="right">
              <div class="doctor-head">
                <div class="doctor-meta">
                  <div class="name-row">
                    <span class="name">{{ doc.name }}</span>
                    <span class="title-tag">{{ doc.doctorType }}</span>
                  </div>
                  <div class="dept-row">{{ doc.deptName }}</div>
                </div>
                <div class="price">￥{{ doc.price }}</div>
              </div>

              <div class="doctor-desc">{{ doc.desc || '暂无医生介绍' }}</div>
            </div>
          </div>

          <div class="schedule-group">
            <div
              v-for="item in doc.schedule"
              :key="`${doc.code}-${item.period}`"
              class="schedule-card"
            >
              <div class="schedule-info">
                <div class="schedule-period">{{ item.period }}</div>
                <div class="schedule-date">{{ doc.date }}</div>
              </div>
              <div
                class="remain"
                :class="item.left > 0 ? 'primary-color' : 'gray'"
              >
                剩余 {{ item.left }}
              </div>
              <div class="schedule-action">
                <t-button
                  v-if="item.left > 0"
                  class="btn-book"
                  size="small"
                  @click="bookEmit(doc, item.period)"
                >
                  预约
                </t-button>
                <div
                  v-else
                  class="btn-disabled"
                >
                  已约满
                </div>
              </div>
            </div>
          </div>
        </article>

        <div
          v-if="canLoadMore"
          ref="loadMoreRef"
          class="load-more-anchor"
        >
          上拉加载更多医生
        </div>
      </div>
    </section>

    <Teleport to="body">
      <transition name="mask-fade">
        <div
          v-if="showHospitalSheet || showDeptSheet"
          class="sheet-mask"
          @click="onCloseSheets"
        ></div>
      </transition>

      <transition name="sheet-rise">
        <div
          v-if="showHospitalSheet"
          class="sheet-panel"
        >
          <div class="sheet-header">
            <span>选择院区</span>
            <button
              class="sheet-close"
              type="button"
              @click="showHospitalSheet = false"
            >
              关闭
            </button>
          </div>
          <div class="sheet-list">
            <button
              v-for="item in hospitalOptions"
              :key="item.value"
              class="sheet-item"
              :class="{ active: hospitalId === item.value }"
              type="button"
              @click="onSelectHospital(item)"
            >
              {{ item.label }}
            </button>
          </div>
        </div>
      </transition>

      <transition name="sheet-rise">
        <div
          v-if="showDeptSheet"
          class="sheet-panel dept-sheet"
        >
          <div class="sheet-header">
            <span>选择科室</span>
            <button
              class="sheet-close"
              type="button"
              @click="showDeptSheet = false"
            >
              关闭
            </button>
          </div>

          <div class="dept-grid">
            <div class="dept-group-list">
              <button
                v-for="item in firstDeptList"
                :key="item.CliSerGroupID"
                class="dept-group-item"
                :class="{ active: currentDept === item.CliSerGroupID }"
                type="button"
                @click="onClickDept(item)"
              >
                <span>{{ item.CliSerGroupName }}</span>
                <img
                  class="dept-arrow"
                  :src="openDept === item.CliSerGroupID ? downIcon : rightIcon"
                />
              </button>
            </div>

            <div
              class="dept-sub-list"
              v-loading="true"
            >
              <t-loading :loading="false">
                <button
                  v-for="child in currentSecondDeptList"
                  :key="child.CLGRPRowId"
                  class="dept-sub-item"
                  :class="{ active: currentSecondDept === child.CLGRPRowId }"
                  type="button"
                  @click="onSelectSecondDept(child)"
                >
                  {{ child.CLGRPDesc }}
                </button>
                <!-- loading -->
                <div></div>
                <div
                  v-if="!currentSecondDeptList.length"
                  class="dept-empty"
                >
                  暂无子科室
                </div>
              </t-loading>
            </div>
          </div>
        </div>
      </transition>
    </Teleport>

    <Dialog
      ref="dialogRef"
      @open="openNoticeDialog"
    />
    <Dialog ref="noticeDialogRef" />
  </div>
</template>

<style scoped lang="less">
.mobile-appointment-page {
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
  display: flex;
  gap: clamp(10px, 3vw, 16px);
  align-items: flex-start;
  justify-content: space-between;
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
  line-height: 1.2;
}

.hero-subtitle {
  margin-top: 6px;
  font-size: clamp(12px, 3.2vw, 14px);
  line-height: 1.5;
  opacity: 0.9;
}

.hero-badge {
  flex-shrink: 0;
  padding: 6px 10px;
  font-size: 12px;
  background: rgb(255 255 255 / 14%);
  border: 1px solid rgb(255 255 255 / 28%);
  border-radius: 999px;
}

.filter-section {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: clamp(10px, 3vw, 14px);
  margin-bottom: clamp(12px, 4vw, 18px);
}

.filter-trigger {
  display: flex;
  gap: 8px;
  align-items: center;
  min-width: 0;
  padding: clamp(12px, 3.6vw, 16px);
  text-align: left;
  background: @bg-white;
  border: 0;
  border-radius: clamp(12px, 3.5vw, 16px);
  box-shadow: @shadow-card;
  transform: translateZ(0);
}

.filter-label {
  flex-shrink: 0;
  font-size: 14px;
  color: @text-secondary;
}

.filter-value {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: clamp(14px, 3.4vw, 15px);
  font-weight: 500;
  color: @text-primary;
  white-space: nowrap;
}

.filter-icon {
  flex-shrink: 0;
  width: 12px;
  height: 12px;
}

.date-section {
  margin-bottom: clamp(12px, 4vw, 18px);
}

.section-title {
  margin-bottom: 10px;
  font-size: 15px;
  font-weight: 600;
  color: @text-primary;
}

/* 与 PC 差异：横向日期条改为移动端可滑动 chip，避免多列挤压 */
.date-scroll {
  display: flex;
  gap: 10px;
  padding-bottom: 4px;
  overflow-x: auto;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;

  &::-webkit-scrollbar {
    display: none;
  }
}

.date-chip {
  display: flex;
  flex: 0 0 auto;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: clamp(72px, 18vw, 84px);
  min-height: 78px;
  color: @text-primary;
  background: @bg-white;
  border: 1px solid @border-color;
  border-radius: 14px;
  box-shadow: @shadow-card;
  transform: translateZ(0);

  &.active {
    color: #fff;
    background: @primary-color;
    border-color: @primary-color;

    .status,
    .week,
    .day {
      color: inherit;
    }
  }
}

.week {
  font-size: 12px;
  color: @text-regular;
}

.day {
  margin: 4px 0;
  font-size: 14px;
  font-weight: 600;
}

.status {
  font-size: 11px;
  color: @success-color;

  &.unavailable {
    color: @text-secondary;
  }
}

.doctor-panel {
  padding: clamp(14px, 4vw, 18px);
  background: @bg-white;
  border-radius: clamp(16px, 4vw, 20px);
  box-shadow: @shadow-card;
}

.panel-header {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 14px;
}

.panel-title {
  font-size: clamp(16px, 4vw, 18px);
  font-weight: 700;
  color: @text-primary;
}

.panel-subtitle {
  margin-top: 4px;
  font-size: 12px;
  color: @text-secondary;
}

.switch-box {
  display: flex;
  flex-shrink: 0;
  gap: 8px;
  align-items: center;
  font-size: 12px;
  color: @text-regular;
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

.doctor-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* 与 PC 差异：双列医生卡改为单列流式卡片，信息优先级调整为“姓名/科室/价格/号源” */
.doctor-card {
  padding: clamp(14px, 3.8vw, 18px);
  background: linear-gradient(180deg, #fff 0%, #fcfdfd 100%);
  border: 1px solid @border-light;
  border-radius: clamp(14px, 3.5vw, 18px);
  box-shadow: 0 8px 18px rgb(0 0 0 / 4%);
  transform: translateZ(0);
  .flex-box {
    display: flex;
    gap: 12px;
    align-items: flex-start;
    justify-content: space-between;
    .left {
      flex-shrink: 0;
      .avatar {
        width: 65px;
        max-height: 85px;
        object-fit: contain;
      }
    }
  }
}

.doctor-head {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  justify-content: space-between;
}

.doctor-meta {
  flex: 1;
  min-width: 0;
}

.name-row {
  display: flex;
  gap: 8px;
  align-items: center;
  min-width: 0;
}

.name {
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: clamp(17px, 4.4vw, 20px);
  font-weight: 700;
  color: @text-primary;
  white-space: nowrap;
}

.title-tag {
  flex-shrink: 0;
  padding: 3px 8px;
  font-size: 11px;
  color: @primary-color;
  background: @primary-color-fade;
  border-radius: 999px;
}

.dept-row {
  margin-top: 6px;
  font-size: 12px;
  color: @text-secondary;
}

.price {
  flex-shrink: 0;
  font-size: clamp(18px, 4.6vw, 22px);
  font-weight: 700;
  color: @warning-color;
}

.doctor-desc {
  display: -webkit-box;
  margin-top: 10px;
  overflow: hidden;
  -webkit-line-clamp: 2;
  font-size: 13px;
  line-height: 1.6;
  color: @text-regular;
  -webkit-box-orient: vertical;
}

.schedule-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 14px;
}

/* 与 PC 差异：横向时间行重排为竖向信息卡，便于触屏点击 */
.schedule-card {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
  padding: 2px;
  background: #f8fbfb;
  border-radius: 14px;
}

.schedule-info {
  min-width: 0;
}

.schedule-period {
  font-size: 14px;
  font-weight: 600;
  color: @text-primary;
}

.schedule-date {
  margin-top: 4px;
  font-size: 12px;
  color: @text-secondary;
}

.schedule-action {
  display: flex;
  flex-shrink: 0;
  flex-direction: column;
  gap: 8px;
  align-items: flex-end;
}

.remain {
  font-size: 12px;
  font-weight: 600;

  &.green {
    color: @success-color;
  }

  &.gray {
    color: @text-secondary;
  }
}

.btn-book {
  min-width: 76px;
  height: 32px;
  color: #fff;
  background: @primary-color;
  border: 0;
  border-radius: 999px;
  transform: translateZ(0);
  font-size: 14px;
}

.btn-disabled {
  min-width: 76px;
  height: 32px;
  padding: 0 12px;
  font-size: 12px;
  line-height: 32px;
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

.sheet-mask {
  position: fixed;
  inset: 0;
  z-index: 300;
  background: rgb(0 0 0 / 38%);
  backdrop-filter: blur(2px);
}

.sheet-panel {
  position: fixed;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 301;
  max-height: min(72vh, 640px);
  padding-bottom: env(safe-area-inset-bottom);
  background: @bg-white;
  border-radius: 20px 20px 0 0;
  box-shadow: 0 -8px 24px rgb(0 0 0 / 14%);
  transform: translateZ(0);
}

.sheet-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 16px 12px;
  font-size: 18px;
  font-weight: 700;
  color: @text-primary;
  border-bottom: 1px solid @border-light;
}

.sheet-close {
  font-size: 13px;
  color: @text-secondary;
  background: transparent;
  border: 0;

  &:active {
    opacity: 0.7;
  }
}

.sheet-list {
  padding: 8px 16px 16px;
  overflow-y: auto;
}

.sheet-item {
  width: 100%;
  padding: 14px 0;
  font-size: 15px;
  color: @text-primary;
  text-align: left;
  background: transparent;
  border: 0;
  border-bottom: 1px solid @border-light;

  &:active {
    opacity: 0.7;
  }

  &.active {
    font-weight: 600;
    color: @primary-color;
  }
}

.dept-sheet {
  max-height: min(78vh, 720px);
}

/* 与 PC 差异：sidebar 树结构收纳到底部面板，通过双列 grid 保留层级信息 */
.dept-grid {
  display: grid;
  grid-template-columns: minmax(112px, 34vw) 1fr;
  min-height: 52vh;
}

.dept-group-list {
  overflow-y: auto;
  background: #f7f8fa;
}

.dept-group-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 14px 12px;
  font-size: 14px;
  color: @text-regular;
  text-align: left;
  background: transparent;
  border: 0;

  &:active {
    opacity: 0.76;
  }

  &.active {
    font-weight: 600;
    color: @primary-color;
    background: @bg-white;
  }
}

.dept-arrow {
  flex-shrink: 0;
  width: 12px;
  height: 12px;
}

.dept-sub-list {
  padding: 8px 14px 16px;
  overflow-y: auto;
}

.dept-sub-item {
  width: 100%;
  padding: 12px 14px;
  margin-bottom: 8px;
  font-size: 14px;
  color: @text-primary;
  text-align: left;
  background: #fafbfb;
  border: 1px solid @border-light;
  border-radius: 12px;

  &.active {
    font-weight: 600;
    color: @primary-color;
    background: @primary-color-fade;
    border-color: rgb(32 133 126 / 18%);
  }
}

.dept-empty {
  padding: 24px 0;
  font-size: 13px;
  color: @text-secondary;
  text-align: center;
}

.mask-fade-enter-active,
.mask-fade-leave-active {
  transition: opacity 0.2s ease;
}

.mask-fade-enter-from,
.mask-fade-leave-to {
  opacity: 0;
}

.sheet-rise-enter-active,
.sheet-rise-leave-active {
  transition: transform 0.22s ease;
}

.sheet-rise-enter-from,
.sheet-rise-leave-to {
  transform: translate3d(0, 100%, 0);
}

@media (orientation: landscape) {
  .filter-section {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .doctor-list {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .dept-grid {
    min-height: 42vh;
  }
}
</style>
