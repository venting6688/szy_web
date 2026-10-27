import { ref, onMounted, computed, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import { MessagePlugin } from 'tdesign-vue-next';
import { useUserStore } from '@/store/modules/user';
import { getFamilyListApi, sendYunMsgApi, updatePatientInfoApi, updatePasswordApi } from '@/api/user';
import { isEmptyObject } from '@/utils/index/common';

export function useProfileLogic() {
  const userStore = useUserStore();
  const router = useRouter();

  const currentTab = ref('profile');
  const isModify = ref(false);
  function onClickModify() {
    // 进入编辑态时清空上次残留的验证码
    profileFormData.value.verificationCode = '';
    isModify.value = true;
  }

  //#region 个人信息表单数据
  const profileFormData = ref({
    realName: userStore.userInfo.realName,
    idCard: userStore.userInfo.idCard,
    phonenumber: userStore.userInfo.phonenumber,
    address: userStore.userInfo.address,
    verificationCode: '',
  });
  const profileFormRef = ref(null);

  // 当前就诊人：个人中心展示/修改的是「当前就诊人」，数据取家庭列表里的默认就诊人，而非登录账号信息
  // 接口返回：{ archivesList: [{...}], defaultPatient: {...} }，字段为下划线命名
  function pickDefaultPatient(data) {
    if (!data || typeof data !== 'object') return null;
    const defaultPatient = data.defaultPatient && typeof data.defaultPatient === 'object' ? data.defaultPatient : null;
    const list = Array.isArray(data.archivesList) ? data.archivesList : [];
    return defaultPatient || list.find((item) => item.default_patient === true) || list[0] || null;
  }

  async function loadCurrentPatient() {
    const { userInfo } = userStore;
    const userId = userInfo.userId;
    if (!userId || userId === -1) return;

    try {
      const patient = pickDefaultPatient(await getFamilyListApi(userId));
      // 接口返回前用户已进入编辑态，则不覆盖正在编辑的内容
      if (!patient || isModify.value) return;

      // 接口没返回的字段沿用登录信息；更新接口的 PatName/PatientID/profileId 等取自 userStore
      const profile = {
        realName: patient.real_name || patient.nickname || userInfo.realName,
        idCard: patient.id_card || userInfo.idCard,
        phonenumber: patient.phonenumber || userInfo.phonenumber,
        address: patient.address || userInfo.address,
        profileId: patient.profile_id || patient.member_profile_id || userInfo.profileId,
        patientId: patient.his_patient_id || userInfo.patientId,
        birthday: patient.birthday || userInfo.birthday,
        gender: patient.gender || userInfo.gender,
        idType: patient.card_type || userInfo.idType,
        his_patient_card: patient.his_patient_card || patient.card_no || userInfo.his_patient_card,
        his_patient_card_type: patient.his_patient_card_type || userInfo.his_patient_card_type,
      };

      const patch = {};
      Object.entries(profile).forEach(([key, value]) => {
        if (value === undefined || value === null || value === '') return;
        patch[key] = value;
        if (key in profileFormData.value) profileFormData.value[key] = value;
      });
      if (Object.keys(patch).length) userStore.setUserInfo(patch);
    } catch (error) {
      console.error('获取当前就诊人失败:', error);
    }
  }

  onMounted(loadCurrentPatient);

  // 发送手机号验证码，60 秒倒计时内不可重复获取
  const countdown = ref(0);
  let timer = null;
  const smsBtnDisabled = computed(
    () => !/^1[3-9]\d{9}$/.test(profileFormData.value.phonenumber || '') || countdown.value > 0,
  );

  async function onClickGetVerificationCode() {
    if (smsBtnDisabled.value) return;

    await sendYunMsgApi({
      type: 'kopebe',
      phone: profileFormData.value.phonenumber,
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

  function clearCountdown() {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
    countdown.value = 0;
  }

  onBeforeUnmount(() => {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  });

  async function submitProfile() {
    const isValid = await profileFormRef.value.validate();
    if (isValid !== true && !isEmptyObject(isValid)) {
      throw new Error('个人信息表单验证失败:', isValid);
    }
    await updatePatientInfoApi({
      phonenumber: profileFormData.value.phonenumber,
      verificationCode: profileFormData.value.verificationCode,
      address: profileFormData.value.address,
    });
    // 更新个人信息成功后清空验证码、停掉倒计时，避免残留
    clearCountdown();
    profileFormData.value.verificationCode = '';
    // 更新个人信息后重置编辑状态，避免界面仍处于编辑模式
    isModify.value = false;
    // 提交成功后同步本地用户信息，避免切走再回来仍显示旧手机号/旧地址
    userStore.setUserInfo({
      phonenumber: profileFormData.value.phonenumber,
      address: profileFormData.value.address,
    });
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
    verificationCode: [{ required: true, message: '请输入验证码' }],
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
    countdown,
    smsBtnDisabled,
    onClickGetVerificationCode,
  };
}
