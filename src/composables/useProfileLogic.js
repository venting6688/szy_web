import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { MessagePlugin } from 'tdesign-vue-next';
import { useUserStore } from '@/store/modules/user';
import { updateProfileApi, updatePasswordApi } from '@/api/user';
import { isEmptyObject } from '@/utils/index/common';

export function useProfileLogic() {
  const userStore = useUserStore();
  const router = useRouter();

  const currentTab = ref('profile');

  //#region 个人信息表单数据
  const profileFormData = ref({
    realName: userStore.userInfo.realName,
    idCard: userStore.userInfo.idCard,
    phonenumber: userStore.userInfo.phonenumber,
    address: userStore.userInfo.address,
  });
  const profileFormRef = ref(null);

  async function submitProfile() {
    console.log(profileFormData.value);
    const isValid = await profileFormRef.value.validate();
    console.log(isValid);
    if (isValid !== true && !isEmptyObject(isValid)) {
      throw new Error('个人信息表单验证失败:', isValid);
    }
    try {
      await updateProfileApi(profileFormData.value);
      MessagePlugin.success('更新个人信息成功');
      // 刷新用户信息
      // userStore.userInfo = profileFormData.value;
      // userStore.logout();
      // nextTick(() => {
      //   router.push('/login');
      // });
    } catch (error) {
      MessagePlugin.error(error.message || '更新个人信息失败');
    }
  }
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

  //#endregion

  //#region 修改密码表单数据
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
  async function submitPassword() {
    console.log(passwordFormData.value);
    try {
      await updatePasswordApi(passwordFormData.value);
      MessagePlugin.success('修改密码成功');
    } catch (error) {
      MessagePlugin.error(error.message || '修改密码失败');
    }
  }
  //#endregion

  // 退出登录
  function onClickLogout() {
    try {
      userStore.logout();
      router.push('/login');
    } catch (error) {
      console.error('退出登录失败:', error);
    }
  }

  const onClick = (tab) => {
    currentTab.value = tab;
  };
  onMounted(() => {
    console.log('Component mounted!');
  });

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
