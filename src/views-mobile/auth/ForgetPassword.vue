<script setup>
import { computed, ref } from 'vue';
import { useForgetPasswordLogic } from '@/composables/useForgetPasswordLogic';

const {
  form,
  forgetPasswordFormRef,
  forgetPasswordFormRules,
  countdown,
  btnDisabled,
  onClickGetVerificationCode,
  onClickForgetPassword,
  goLogin,
} = useForgetPasswordLogic({
  loginPath: '/h5/login',
});

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
</script>

<template>
  <div
    ref="pageRef"
    class="mobile-forget-page"
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
    </section>
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
  /* [FIXED] 为底部固定按钮留出空间 */
  padding-bottom: calc(0px + env(safe-area-inset-bottom));
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
