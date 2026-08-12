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
  const isModify = ref(false);
  function onClickModify() {
    isModify.value = true;
  }

  //#region 个人信息表单数据
  const profileFormData = ref({
    realName: userStore.userInfo.realName,
    idCard: userStore.userInfo.idCard,
    phonenumber: userStore.userInfo.phonenumber,
    address: userStore.userInfo.address,
  });
  const profileFormRef = ref(null);

  async function submitProfile() {
    const isValid = await profileFormRef.value.validate();
    if (isValid !== true && !isEmptyObject(isValid)) {
      throw new Error('个人信息表单验证失败:', isValid);
    }
    await updateProfileApi(profileFormData.value);
    // 更新个人信息后重置编辑状态，避免界面仍处于编辑模式
    isModify.value = false;
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
    newPassword: [
      { required: true, message: '请输入密码' },
      { pattern: /^(?=.*[A-Za-z])(?=.*\d).{6,}$/, message: '密码至少6位，且包含字母和数字' }, //必须包含字母和数字，两者都有
    ],
    confirmPassword: [
      { required: true, message: '请确认新密码' },
      { validator: (val) => val === passwordFormData.value.newPassword, message: '两次输入密码不一致' },
    ],
  });
  const passwordFormData = ref({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  async function submitPassword() {
    const res = await updatePasswordApi(passwordFormData.value);
    if (res) {
      MessagePlugin.success('修改密码成功，请重新登录！');
      setTimeout(() => {
        userStore.logout();
        router.push('/login');
      }, 500);
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
    isModify,
    onClickModify,
  };
}
