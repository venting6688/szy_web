import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { MessagePlugin } from 'tdesign-vue-next';
import { isEmptyObject } from '@/utils/index/common';
import { useUserStore } from '@/store/modules/user';
import { loginApi } from '@/api/user';

export function useLoginLogic({ successPath }) {
  const userStore = useUserStore();
  const router = useRouter();

  const loginFormRef = ref(null);

  const form = ref({
    username: '',
    password: '',
  });

  const loginFormRules = ref({
    username: [{ required: true, message: '请输入身份证号' }],
    password: [{ required: true, message: '请输入密码' }],
  });

  async function onClickLogin() {
    const isValid = await loginFormRef.value.validate();
    if (isValid !== true && !isEmptyObject(isValid)) {
      throw new Error('登录表单验证失败:', isValid);
    }

    const data = await loginApi(form.value);
    userStore.setLogin(data.accessToken, data);
    if (successPath) {
      router.push(successPath);
    }
  }

  function goRegister(path) {
    router.push(path);
  }

  function onClickForgetPassword(path) {
    router.push(path);
  }

  return {
    loginFormRef,
    form,
    loginFormRules,
    onClickLogin,
    goRegister,
    onClickForgetPassword,
  };
}
