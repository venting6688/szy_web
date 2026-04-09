<script setup>
import { ref } from 'vue';
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

async function onClickLogin() {
  const isValid = await loginFormRef.value.validate();
  console.log(isValid);
  if (isValid !== true && !isEmptyObject(isValid)) {
    throw new Error('登录表单验证失败:', isValid);
  }
  const data = await loginApi(form.value);
  userStore.setLogin(data.accessToken, data);
  router.push('/appointment');
}

function goRegister() {
  router.push('/register');
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
            @click="goRegister"
            >立即注册</span
          ></span
        >
        <span class="link">忘记密码？</span>
      </div>
    </div>
    <t-button
      class="btn primary"
      block
      shape="circle"
      @click="onClickLogin"
      @keyup.enter="onClickLogin"
      >登录</t-button
    >

    <t-button
      class="btn"
      block
      variant="outline"
      shape="circle"
      @click="goRegister"
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
