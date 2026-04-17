<script setup>
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { MessagePlugin } from 'tdesign-vue-next';
import { isEmptyObject } from '@/utils/index/common';
import { useUserStore } from '@/store/modules/user';
import { loginApi } from '@/api/user';

const userStore = useUserStore();
const router = useRouter();

const loginFormRef = ref(null);

const form = ref({
  username: '',
  password: '',
});

// 登录表单验证规则
const loginFormRules = ref({
  username: [{ required: true, message: '请输入身份证号' }],
  password: [{ required: true, message: '请输入密码' }],
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
  form.value.username = '';
  form.value.password = '';
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

async function onClickLogin() {
  const isValid = await loginFormRef.value.validate();
  console.log(isValid);
  if (isValid !== true && !isEmptyObject(isValid)) {
    throw new Error('登录表单验证失败:', isValid);
  }
  try {
    const data = await loginApi(form.value);
    userStore.setLogin(data.accessToken, data);
    // [OLD] router.push('/appointment-today');
    // [FIXED] 移动端登录成功后跳转移动端首页
    router.push('/mobile/appointment-today');
  } catch (error) {
    MessagePlugin.error(error.message || '登录失败，请稍后再试');
  }
}

function goRegister() {
  // [OLD] router.push('/register');
  // [FIXED] 跳转移动端注册页
  router.push('/mobile/register');
}

function onClickForgetPassword() {
  // [OLD] router.push('/forget-password');
  // [FIXED] 跳转移动端忘记密码页
  router.push('/mobile/forget-password');
}
</script>

<template>
  <div
    ref="pageRef"
    class="mobile-login-page"
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

    <section class="login-card">
      <header class="card-header">
        <h1 class="title">登录</h1>
        <p class="subtitle">欢迎使用山东省中医院线上服务</p>
      </header>

      <div class="form-container">
        <t-form
          ref="loginFormRef"
          :data="form"
          :rules="loginFormRules"
          layout="vertical"
          label-align="top"
        >
          <t-form-item
            label="账号"
            name="username"
          >
            <t-input
              v-model="form.username"
              placeholder="请输入身份证号"
              size="large"
            />
          </t-form-item>

          <t-form-item
            label="密码"
            name="password"
          >
            <t-input
              v-model="form.password"
              type="password"
              placeholder="请输入密码"
              size="large"
            />
          </t-form-item>
        </t-form>
      </div>

      <div class="extra">
        <span>
          还没有账户？
          <button
            type="button"
            class="link"
            @click="goRegister"
          >
            立即注册
          </button>
        </span>
        <button
          type="button"
          class="link"
          @click="onClickForgetPassword"
        >
          忘记密码？
        </button>
      </div>

      <!-- [OLD]
      <t-button
        class="btn primary"
        block
        shape="round"
        @click="onClickLogin"
      >
        登录
      </t-button>

      <t-button
        class="btn"
        block
        variant="outline"
        shape="round"
        @click="goRegister"
      >
        注册
      </t-button>
      -->
    </section>
    <!-- [FIXED] 底部固定操作区 -->
    <div class="fixed-actions">
      <t-button
        class="btn primary"
        block
        shape="round"
        @click="onClickLogin"
      >
        登录
      </t-button>

      <t-button
        class="btn"
        block
        variant="outline"
        shape="round"
        @click="goRegister"
      >
        注册
      </t-button>
    </div>
  </div>
</template>

<style scoped lang="less">
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

/* 与 PC 差异：固定宽度表单卡改为自适应单列卡片 */
.login-card {
  width: min(100%, 480px);
  height: 100%;
  margin: 0 auto;
  background: @bg-white;
  border-radius: clamp(16px, 4vw, 20px);
  box-shadow: 0 12px 28px rgb(0 0 0 / 8%);
  transform: translateZ(0);
  width: 100%;
  max-width: none;
  margin: 0;

  padding: clamp(16px, 4.5vw, 22px);
  padding-top: 10vh;
  box-shadow: none;
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
}

.extra {
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: space-between;
  margin: 8px 0 14px;
  font-size: 13px;
  color: @text-secondary;
}

.link {
  padding: 0;
  font-size: 13px;
  color: @warning-color;
  background: transparent;
  border: 0;
  transform: translateZ(0);

  &:active {
    opacity: 0.72;
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

/* [FIXED] 清理多余 padding/外层壳：内容贴合屏幕边缘，仅保留安全区 */
.mobile-login-page {
  padding-top: env(safe-area-inset-top);
  padding-right: 0;
  /* [OLD] padding-bottom: env(safe-area-inset-bottom); */
  /* [FIXED] 为底部固定按钮留出空间 */
  padding-bottom: calc(110px + env(safe-area-inset-bottom));
  padding-left: 0;
  height: 100%;
  /* [FIXED] iOS 惯性滚动兼容 */
  -webkit-overflow-scrolling: touch;
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
</style>
