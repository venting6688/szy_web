import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { MessagePlugin } from 'tdesign-vue-next';
import { useUserStore } from '@/store/modules/user';
import { updateProfileApi, updatePasswordApi } from '@/api/user';
import { isEmptyObject } from '@/utils/index/common';

export function useProfileLogic() {
  const userStore = useUserStore();
  const router = useRouter();

  const currentTab = ref('profile');

  const profileFormData = ref({
    realName: userStore.userInfo.realName,
    idCard: userStore.userInfo.idCard,
    phonenumber: userStore.userInfo.phonenumber,
    address: userStore.userInfo.address,
  });
  const profileFormRef = ref(null);
  const profileFormRules = ref({
    realName: [{ required: true, message: '请输入姓名' }],
    idCard: [{ required: true, message: '请输入证件号' }],
    phonenumber: [
      { required: true, message: '请输入手机号' },
      {
        required: true,
        validator: (val) => /^1[3-9]\d{9}$/.test(val),
        message: '请输入正确的11位手机号码',
      },
    ],
    address: [{ required: true, message: '请输入地址' }],
  });

  const passwordFormRules = ref({
    oldPassword: [{ required: true, message: '请输入旧密码' }],
    newPassword: [{ required: true, message: '请输入新密码' }],
    confirmPassword: [{ required: true, message: '请确认新密码' }],
  });
  const passwordFormData = ref({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  async function submitProfile() {
    const isValid = await profileFormRef.value.validate();
    if (isValid !== true && !isEmptyObject(isValid)) {
      throw new Error('个人信息表单验证失败:', isValid);
    }
    try {
      await updateProfileApi(profileFormData.value);
      MessagePlugin.success('更新个人信息成功');
    } catch (error) {
      MessagePlugin.error(error.message || '更新个人信息失败');
    }
  }

  async function submitPassword() {
    try {
      await updatePasswordApi(passwordFormData.value);
      MessagePlugin.success('修改密码成功');
    } catch (error) {
      MessagePlugin.error(error.message || '修改密码失败');
    }
  }

  function onClickLogout() {
    try {
      userStore.logout();
      router.push('/login');
    } catch (error) {
      console.error('退出登录失败:', error);
    }
  }

  function onClick(tab) {
    currentTab.value = tab;
  }

  return {
    userStore,
    currentTab,
    profileFormData,
    profileFormRef,
    profileFormRules,
    passwordFormData,
    passwordFormRules,
    submitProfile,
    submitPassword,
    onClickLogout,
    onClick,
  };
}
