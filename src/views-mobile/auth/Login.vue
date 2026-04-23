<script setup>
import { useLoginLogic } from '@/composables/useLoginLogic';

const { loginFormRef, form, loginFormRules, onClickLogin, goRegister, onClickForgetPassword } = useLoginLogic({
  successPath: '/h5/appointment-today',
});

function handleRegister() {
  goRegister('/h5/register');
}

function handleForgetPassword() {
  onClickForgetPassword('/h5/forget-password');
}
</script>

<template>
  <div
    ref="pageRef"
    class="mobile-login-page"
  >
    <section class="login-card">
      <header class="card-header">
        <h1 class="title">登录</h1>
        <!-- <p class="subtitle">欢迎使用山东省中医院线上服务</p> -->
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
            @click="handleRegister"
          >
            立即注册
          </button>
        </span>
        <button
          type="button"
          class="link"
          @click="handleForgetPassword"
        >
          忘记密码？
        </button>
      </div>
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
        @click="handleRegister"
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
  padding-bottom: calc(0px + env(safe-area-inset-bottom));
  padding-left: 0;
  height: 100%;
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
