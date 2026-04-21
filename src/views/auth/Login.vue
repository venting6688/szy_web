<script setup>
import { useLoginLogic } from '@/composables/useLoginLogic';

const { loginFormRef, form, loginFormRules, onClickLogin, goRegister, onClickForgetPassword } = useLoginLogic({
  successPath: '/appointment-today',
});

function handleRegister() {
  goRegister('/register');
}

function handleForgetPassword() {
  onClickForgetPassword('/forget-password');
}
</script>

<template>
  <div class="auth-form">
    <div class="title">登录</div>

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

      <div class="extra">
        <span
          >还没有账户？<span
            class="link"
            @click="handleRegister"
            >立即注册</span
          ></span
        >
        <span
          class="link"
          @click="handleForgetPassword"
          >忘记密码？</span
        >
      </div>
    </div>
    <t-button
      class="btn primary"
      block
      shape="circle"
      @click="onClickLogin"
      >登录</t-button
    >

    <t-button
      class="btn"
      block
      variant="outline"
      shape="circle"
      @click="handleRegister"
    >
      注册
    </t-button>
  </div>
</template>

<style scoped lang="less">
.auth-form {
  width: 446px;
  margin: 50px auto;
  .title {
    width: 100%;
    text-align: center;
    font-size: @font-extra-large;
    color: @primary-color;
    margin-bottom: @space-lg;
    font-weight: 600;
  }

  .form-container {
    margin: 50px 0;
    .t-form {
      font-size: @font-medium;
    }

    .extra {
      margin-top: @space-lg;
      display: flex;
      justify-content: space-between;
      margin-bottom: @space-lg;
      font-size: @font-medium;
      color: @text-secondary;

      .link {
        color: @warning-color;
        cursor: pointer;
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
}
</style>
