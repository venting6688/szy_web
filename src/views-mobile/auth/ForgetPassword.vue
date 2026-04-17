<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { forgetPasswordApi, sendYunMsgApi } from '@/api/user';
import { useUserStore } from '@/store/modules/user';
import { isEmptyObject } from '@/utils/index/common';

const userStore = useUserStore();
const router = useRouter();
const form = ref({
  idType: '',
  idCard: '',
  realName: '',
  birthday: '',
  gender: '',
  phone: '',
  verificationCode: '',
  newPassword: '',
  confirmPassword: '',
});

const forgetPasswordFormRef = ref(null);
const forgetPasswordFormRules = ref({
  idCard: [{ required: true, message: '请输入证件号' }],
  phone: [
    { required: true, message: '请输入手机号' },
    {
      validator: (val) => /^1[3-9]\d{9}$/.test(val),
      message: '请输入正确的11位手机号码',
    },
  ],
  verificationCode: [{ required: true, message: '请输入验证码' }],
  newPassword: [{ required: true, message: '请输入新密码' }],
  confirmPassword: [{ required: true, message: '请确认新密码' }],
});
async function onClickForgetPassword() {
  const isValid = await forgetPasswordFormRef.value.validate();
  console.log(isValid);
  if (isValid !== true && !isEmptyObject(isValid)) {
    throw new Error('忘记密码表单验证失败:', isValid);
  }
  const formData = {
    ...form.value,
  };

  const res = await forgetPasswordApi(formData);
  // [OLD] router.push('/login');
  // [FIXED] 移动端重置成功后跳转移动端登录
  router.push('/mobile/login');
  console.log(res);
}
const countdown = ref(0); // 倒计时秒数
let timer = null; // 定时器实例

// 验证码
async function onClickGetVerificationCode() {
  console.log(form.value.phone);

  if (countdown.value > 0) return; // 防止重复点击

  console.log('获取验证码');
  const res = await sendYunMsgApi({
    type: 'kopebe',
    phone: form.value.phone,
  });
  console.log(res);

  // 开始倒计时
  countdown.value = 60;
  timer = setInterval(() => {
    if (countdown.value > 0) {
      countdown.value--;
    } else {
      clearInterval(timer);
      timer = null;
    }
  }, 1000);
}

onMounted(async () => {});

const btnDisabled = computed(() => {
  return !form.value.phone || countdown.value > 0;
});

// [FIXED] 移动端触控体验：下拉刷新（清空表单）
const pageRef = ref(null);
const pullDistance = ref(0);
const pullStartY = ref(0);
const isPulling = ref(false);
const isRefreshing = ref(false);

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
  return pageRef.value;
}

// [FIXED] 统一读取真实滚动位置：优先可滚动容器，兜底文档滚动，避免误判顶部导致回滚被拦截
function getCurrentScrollTop() {
  const scrollContainer = getScrollContainer();
  const containerScrollTop = scrollContainer?.scrollTop || 0;
  const docScrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
  const isContainerScrollable = !!scrollContainer && scrollContainer.scrollHeight > scrollContainer.clientHeight + 1;
  return isContainerScrollable ? containerScrollTop : Math.max(containerScrollTop, docScrollTop);
}

function resetForm() {
  form.value.idCard = '';
  form.value.phone = '';
  form.value.verificationCode = '';
  form.value.newPassword = '';
  form.value.confirmPassword = '';
}

async function refreshPageData() {
  if (isRefreshing.value) return;
  isRefreshing.value = true;
  try {
    resetForm();
  } finally {
    pullDistance.value = 0;
    isRefreshing.value = false;
  }
}

function onTouchStart(event) {
  const scrollContainer = getScrollContainer();
  // [OLD] if (!scrollContainer || scrollContainer.scrollTop > 0) {
  // [FIXED] 使用真实滚动位置判断是否在顶部，避免底部回滚手势被误拦截
  if (!scrollContainer || getCurrentScrollTop() > 0) {
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
  // [OLD] if (pullDistance.value > 0) {
  // [FIXED] 仅在可取消事件中阻止默认行为，避免浏览器滚动链路被锁死
  if (pullDistance.value > 0 && event.cancelable) {
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

function goLogin() {
  // [OLD] router.push('/login');
  // [FIXED] 移动端返回登录
  router.push('/mobile/login');
}

onBeforeUnmount(() => {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
});
</script>

<template>
  <div
    ref="pageRef"
    class="mobile-forget-page"
    @touchstart="onTouchStart"
    @touchmove="onTouchMove"
    @touchend="onTouchEnd"
  >
    <section class="forget-card">
      <header class="card-header">
        <h1 class="title">忘记密码</h1>
      </header>

      <div class="form-container">
        <t-form
          ref="forgetPasswordFormRef"
          :data="form"
          :rules="forgetPasswordFormRules"
          layout="vertical"
          label-align="top"
        >
          <t-form-item
            label="证件号码"
            name="idCard"
          >
            <t-input
              v-model="form.idCard"
              placeholder="请输入证件号码"
            />
          </t-form-item>
          <t-form-item
            label="手机号码"
            name="phone"
          >
            <t-input
              v-model="form.phone"
              placeholder="请输入手机号码"
            />
          </t-form-item>
          <t-form-item
            label="验证码"
            name="verificationCode"
          >
            <t-input
              v-model="form.verificationCode"
              placeholder="请输入验证码"
            >
              <template #suffix>
                <t-button
                  class="get-verification-code-btn"
                  :class="{ disabled: btnDisabled }"
                  shape="round"
                  theme="primary"
                  size="small"
                  @click="!btnDisabled && onClickGetVerificationCode()"
                >
                  {{ countdown > 0 ? `${countdown}s 后重发` : '获取动态码' }}
                </t-button>
              </template>
            </t-input>
          </t-form-item>
          <t-form-item
            label="新密码"
            name="newPassword"
          >
            <t-input
              v-model="form.newPassword"
              type="password"
              placeholder="请输入新密码"
            />
          </t-form-item>
          <t-form-item
            label="确认密码"
            name="confirmPassword"
          >
            <t-input
              v-model="form.confirmPassword"
              type="password"
              placeholder="请确认密码"
            />
          </t-form-item>
        </t-form>
      </div>
      <!-- [OLD]
      <t-button
        class="btn primary"
        block
        shape="round"
        @click="onClickForgetPassword"
      >
        重置密码
      </t-button>
      <t-button
        class="btn"
        block
        variant="outline"
        shape="round"
        @click="goLogin"
      >
        返回登录
      </t-button>
      -->
    </section>
    <!-- [FIXED] 底部固定操作区 -->
    <div class="fixed-actions">
      <t-button
        class="btn primary"
        block
        shape="round"
        @click="onClickForgetPassword"
      >
        重置密码
      </t-button>
      <t-button
        class="btn"
        block
        variant="outline"
        shape="round"
        @click="goLogin"
      >
        返回登录
      </t-button>
    </div>
  </div>
</template>

<style scoped lang="less">
.mobile-forget-page {
  min-height: 100%;
  padding: clamp(12px, 3.5vw, 18px);
  padding-top: clamp(18px, 5vw, 28px);
  padding-bottom: calc(clamp(20px, 6vw, 28px) + env(safe-area-inset-bottom));
  overflow-y: auto;
  overscroll-behavior-y: contain;
  touch-action: manipulation;
  /* [FIXED] iOS 惯性滚动兼容 */
  -webkit-overflow-scrolling: touch;
  background:
    radial-gradient(circle at 20% 0%, rgb(32 133 126 / 14%) 0, transparent 45%),
    linear-gradient(180deg, rgb(32 133 126 / 8%) 0, rgb(32 133 126 / 0%) 180px), @bg-page;
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

/* 与 PC 差异：固定宽度卡片改为移动端自适应单列卡片 */
.forget-card {
  width: min(100%, 480px);
  padding: clamp(16px, 4.5vw, 22px);
  margin: 0 auto;
  background: @bg-white;
  border-radius: clamp(16px, 4vw, 20px);
  transform: translateZ(0);
}

.card-header {
  margin-bottom: clamp(14px, 4vw, 20px);
}

.title {
  margin: 0;
  font-size: clamp(24px, 6vw, 30px);
  font-weight: 700;
  color: @primary-color;
  text-align: center;
}

.subtitle {
  margin: 8px 0 0;
  font-size: 13px;
  color: @text-secondary;
  text-align: center;
}

.form-container {
  :deep(.t-form__label) {
    margin-bottom: 6px;
    font-size: 13px;
    color: @text-regular;
  }

  :deep(.t-input) {
    border-radius: 12px;
  }

  :deep(.t-form__item) {
    margin-bottom: 12px;
  }

  .get-verification-code-btn {
    color: @primary-color;
    background-color: #fff;
    border-color: @primary-color;

    &.disabled {
      color: #999;
      cursor: not-allowed;
      background-color: #f5f5f5;
      border-color: #999;
    }
  }
}

.btn {
  height: 44px;
  margin-bottom: 10px;
  font-size: 14px;
  border-radius: 999px;
  transform: translateZ(0);

  &:active {
    transform: scale(0.98) translateZ(0);
  }

  &.primary {
    color: #fff;
    background: @primary-color;
  }
}

@media (orientation: landscape) {
  .mobile-forget-page {
    min-height: 100%;
  }
}

/* [FIXED] 清理多余 padding/外层壳：内容贴合屏幕边缘，仅保留安全区 */
.mobile-forget-page {
  padding-top: env(safe-area-inset-top);
  padding-right: 0;
  /* [OLD] padding-bottom: env(safe-area-inset-bottom); */
  /* [FIXED] 为底部固定按钮留出空间 */
  padding-bottom: calc(110px + env(safe-area-inset-bottom));
  padding-left: 0;
  background-color: #fff;
}

/* [FIXED] 底部固定操作区样式 */
.fixed-actions {
  position: fixed;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 100;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  padding-bottom: calc(16px + env(safe-area-inset-bottom));
  background: @bg-white;
  box-shadow: 0 -4px 12px rgb(0 0 0 / 6%);
}

.btn {
  margin-bottom: 0;
}
</style>
