import { ref, computed, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import { forgetPasswordApi, sendYunMsgApi } from '@/api/user';
import { isEmptyObject } from '@/utils/index/common';

export function useForgetPasswordLogic({ loginPath }) {
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

  const countdown = ref(0);
  let timer = null;

  const btnDisabled = computed(() => !form.value.phone || countdown.value > 0);

  async function onClickGetVerificationCode() {
    if (countdown.value > 0) return;

    const res = await sendYunMsgApi({
      type: 'kopebe',
      phone: form.value.phone,
    });

    countdown.value = 60;
    timer = setInterval(() => {
      if (countdown.value > 0) {
        countdown.value -= 1;
      } else {
        clearInterval(timer);
        timer = null;
      }
    }, 1000);
  }

  async function onClickForgetPassword() {
    const isValid = await forgetPasswordFormRef.value.validate();
    if (isValid !== true && !isEmptyObject(isValid)) {
      throw new Error('忘记密码表单验证失败:', isValid);
    }
    const formData = {
      ...form.value,
    };

    const res = await forgetPasswordApi(formData);
    router.push(loginPath);
  }

  function goLogin() {
    router.push(loginPath);
  }

  onBeforeUnmount(() => {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  });

  return {
    form,
    forgetPasswordFormRef,
    forgetPasswordFormRules,
    countdown,
    btnDisabled,
    onClickGetVerificationCode,
    onClickForgetPassword,
    goLogin,
  };
}
