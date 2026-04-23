<script setup>
import { useRegisterLogic } from '@/composables/useRegisterLogic';

const {
  form,
  registerFormRef,
  registerFormRules,
  loading,
  countdown,
  btnDisabled,
  areaOptions,
  nationalityOptions,
  cardTypeOptions,
  genderOptions,
  onClickGetVerificationCode,
  goRegister,
  goLogin,
  onChangeArea,
} = useRegisterLogic({
  loginPath: '/h5/login',
});
</script>

<template>
  <div
    ref="pageRef"
    class="mobile-register-page"
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

    <section class="register-card">
      <header class="card-header">
        <h1 class="title">注册</h1>
        <!-- <p class="subtitle">请完善信息完成账号注册</p> -->
      </header>

      <div class="form-container">
        <t-form
          ref="registerFormRef"
          :data="form"
          :rules="registerFormRules"
          layout="vertical"
          label-align="top"
        >
          <t-form-item
            label="姓名"
            name="realName"
          >
            <t-input
              v-model="form.realName"
              borderless
              placeholder="请输入姓名"
            />
          </t-form-item>

          <t-form-item
            label="证件类型"
            name="idType"
          >
            <t-select
              v-model="form.idType"
              borderless
              placeholder="请选择证件类型"
            >
              <t-option
                v-for="item in cardTypeOptions"
                :key="item.value"
                :value="item.value"
                :label="item.label"
                :disabled="item.label !== '居民身份证'"
              />
            </t-select>
          </t-form-item>

          <t-form-item
            label="证件号码"
            name="idCard"
          >
            <t-input
              v-model="form.idCard"
              borderless
              placeholder="请输入证件号码"
            />
          </t-form-item>

          <t-form-item
            label="出生日期"
            name="birthday"
          >
            <t-date-picker
              v-model="form.birthday"
              borderless
              class="w-full"
              type="date"
              placeholder="请选择出生日期"
            />
          </t-form-item>

          <t-form-item
            label="手机号码"
            name="phoneNumber"
          >
            <t-input
              v-model="form.phoneNumber"
              borderless
              placeholder="请输入手机号码"
            />
          </t-form-item>

          <t-form-item
            label="验证码"
            name="verificationCode"
          >
            <t-input
              v-model="form.verificationCode"
              borderless
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
            label="密码"
            name="password"
          >
            <t-input
              v-model="form.password"
              borderless
              type="password"
              placeholder="请输入密码"
            />
          </t-form-item>

          <t-form-item
            label="确认密码"
            name="confirmPassword"
          >
            <t-input
              v-model="form.confirmPassword"
              borderless
              type="password"
              placeholder="请确认密码"
            />
          </t-form-item>

          <t-form-item
            label="性别"
            name="gender"
          >
            <t-select
              v-model="form.gender"
              borderless
              placeholder="请选择性别"
            >
              <t-option
                v-for="item in genderOptions"
                :key="item.value"
                :value="item.value"
                :label="item.label"
              />
            </t-select>
          </t-form-item>

          <t-form-item
            label="民族"
            name="nation"
          >
            <t-select
              v-model="form.nation"
              borderless
              placeholder="请选择民族"
              value-type="object"
            >
              <t-option
                v-for="item in nationalityOptions"
                :key="item.value"
                :value="item.value"
                :label="item.label"
              />
            </t-select>
          </t-form-item>

          <t-form-item
            label="所在地区"
            name="area"
          >
            <t-cascader
              v-model="form.area"
              borderless
              :options="areaOptions"
              value-type="full"
              placeholder="请选择所在地区"
              clearable
              @change="onChangeArea"
            />
          </t-form-item>

          <t-form-item
            label="详细地址"
            name="detailAddress"
          >
            <t-input
              v-model="form.detailAddress"
              borderless
              placeholder="请输入详细地址"
            />
          </t-form-item>
        </t-form>
      </div>
    </section>
    <div class="fixed-actions">
      <t-button
        class="btn primary"
        theme="primary"
        block
        shape="round"
        :loading="loading"
        @click="goRegister"
      >
        注册
      </t-button>

      <t-button
        class="btn"
        block
        variant="outline"
        shape="round"
        @click="goLogin"
      >
        去登录
      </t-button>
    </div>
  </div>
</template>

<style scoped lang="less">
:deep(.t-input--borderless:not(.t-input--focused):hover) {
  border: 0;
  background-color: transparent;
}

.t-input {
  border-width: 0;
}

:deep(.t-select-input--borderless .t-input:hover:not(.t-input--focused)) {
  border: 0;
  background-color: transparent;
}

.mobile-register-page {
  min-height: 100%;
  /**
  padding-bottom: calc(clamp(20px, 6vw, 28px) + env(safe-area-inset-bottom));**/
  overflow-y: auto;
  overscroll-behavior-y: contain;
  touch-action: manipulation;
}

.pull-indicator {
  position: sticky;
  top: 0;
  z-index: 5;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 40px;
  font-size: 12px;
  color: @text-regular;
  transform: translate3d(0, -48px, 0);
  transition:
    transform 0.2s ease,
    opacity 0.2s ease;
  will-change: transform;
}

/* 与 PC 差异：固定宽度注册表单改为移动端自适应单列长表单 */
.register-card {
  width: min(100%, 560px);
  margin: 0 auto;
  padding: clamp(16px, 4.5vw, 22px);
  padding-bottom: 40px;
  border-radius: clamp(16px, 4vw, 20px);
  background: @bg-white;
  box-shadow: 0 12px 28px rgb(0 0 0 / 8%);
  transform: translateZ(0);
}

.card-header {
  margin-bottom: clamp(14px, 4vw, 20px);
}

.title {
  margin: 0;
  color: @primary-color;
  font-size: clamp(24px, 6vw, 30px);
  font-weight: 700;
  text-align: center;
}

.subtitle {
  margin: 8px 0 0;
  color: @text-secondary;
  font-size: 13px;
  text-align: center;
}

.form-container {
  :deep(.t-form__label) {
    margin-bottom: 6px;
    color: @text-regular;
    font-size: 13px;
  }

  :deep(.t-form__item) {
    margin-bottom: 12px;
    border-bottom: 1px solid #eef1f4;
  }

  :deep(.t-input) {
    border-radius: 10px;
  }

  .get-verification-code-btn {
    border-color: @primary-color;
    color: @primary-color;
    background-color: #fff;

    &.disabled {
      border-color: #999;
      color: #999;
      background-color: #f5f5f5;
      cursor: not-allowed;
    }
  }
}

.btn {
  height: 44px;
  margin-top: 6px;
  border-radius: 999px;
  font-size: 14px;
  transform: translateZ(0);

  &:active {
    transform: scale(0.98) translateZ(0);
  }

  &.primary {
    color: #fff;
    background: @primary-color;
  }
}

.extra {
  margin-top: 14px;
  color: @text-secondary;
  font-size: 13px;

  &.center {
    text-align: center;
  }
}

.link {
  margin-left: @space-xs;
  border: 0;
  padding: 0;
  color: @primary-color;
  font-size: 13px;
  background: transparent;

  &:active {
    opacity: 0.72;
  }
}

@media (orientation: landscape) {
  .mobile-register-page {
    min-height: 100%;
  }
}

/* [FIXED] 清理多余 padding/外层壳：内容贴合屏幕边缘，仅保留安全区 */
.mobile-register-page {
  padding-top: env(safe-area-inset-top);
  padding-right: 0;
  /* [OLD] padding-bottom: env(safe-area-inset-bottom); */
  /* [FIXED] 为底部固定按钮留出空间 */
  padding-bottom: calc(0px + env(safe-area-inset-bottom));
  padding-left: 0;
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

/* [FIXED] 长表单改为贴边承载，去除卡片额外留白 */

/* [FIXED] 纯包裹容器仅保留结构，不再产生额外布局间距 */
.card-header,
.form-container,
.extra {
  margin: 0;
}

.btn {
  margin-top: 0;
}
</style>
