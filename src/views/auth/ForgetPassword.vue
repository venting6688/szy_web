<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { forgetPasswordApi } from '@/api/user';
import { useUserStore } from '@/store/modules/user';
import { sendYunMsgApi } from '@/api/user';

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

import { isEmptyObject } from '@/utils/index/common';

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
  router.push('/login');
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
      @click="router.push('/login')"
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
