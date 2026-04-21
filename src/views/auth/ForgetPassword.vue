<script setup>
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
  loginPath: '/login',
});
</script>

<template>
  <div class="auth-form">
    <div class="title">忘记密码</div>

    <div class="form-container">
      <t-form
        ref="forgetPasswordFormRef"
        :data="form"
        :rules="forgetPasswordFormRules"
        layout="vertical"
        label-align="left"
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
                @click="!btnDisabled && onClickGetVerificationCode()"
                shape="round"
                theme="primary"
                size="small"
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
    <t-button
      class="btn primary"
      block
      variant="outline"
      shape="circle"
      @click="onClickForgetPassword"
    >
      重置密码
    </t-button>
    <t-button
      class="btn"
      block
      variant="outline"
      shape="circle"
      @click="goLogin"
    >
      返回登录
    </t-button>
  </div>
</template>

<style scoped lang="less">
.auth-form {
  width: 446px;
  margin: 30px auto;
  .title {
    text-align: center;
    font-size: @font-extra-large;
    color: @primary-color;
    margin-bottom: @space-lg;
    font-weight: 600;
  }

  .form-container {
    margin: 20px 0;
    .t-form {
      font-size: @font-medium;
      .t-form__item {
        margin-bottom: 15px;
      }
    }
    .get-verification-code-btn {
      background-color: #fff;
      color: @primary-color;
      border-color: @primary-color;
      &.disabled {
        background-color: #f5f5f5;
        color: #999;
        border-color: #999;
        cursor: not-allowed;
      }
    }
  }

  .btn {
    margin-bottom: 13px;
    height: 55px;
    // 圆角
    border-radius: 27px;
    font-size: @font-medium;
    &.primary {
      background: @primary-color;
      color: #fff;
    }
  }

  .extra {
    margin-top: @space-md;
    font-size: @font-medium;
    color: @text-secondary;

    &.center {
      text-align: center;
    }

    .link {
      color: @primary-color;
      cursor: pointer;
      margin-left: @space-xs;
    }
  }
}
</style>
