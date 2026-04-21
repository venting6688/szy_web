import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import { registerApi, sendYunMsgApi, getDictDataApi } from '@/api/user';
import { isEmptyObject } from '@/utils/index/common';
import areaData from 'china-area-data';

export function useRegisterLogic({ loginPath }) {
  const router = useRouter();

  const form = ref({
    idType: '',
    idCard: '',
    realName: '',
    birthday: '',
    gender: '',
    phoneNumber: '',
    verificationCode: '',
    nation: '',
    province: '',
    city: '',
    district: '',
    detailAddress: '',
    password: '',
    confirmPassword: '',
  });

  const registerFormRef = ref(null);
  const loading = ref(false);

  const registerFormRules = ref({
    realName: [{ required: true, message: '请输入姓名' }],
    idCard: [{ required: true, message: '请输入证件号' }],
    phoneNumber: [
      { required: true, message: '请输入手机号' },
      {
        validator: (val) => /^1[3-9]\d{9}$/.test(val),
        message: '请输入正确的11位手机号码',
      },
    ],
    verificationCode: [{ required: true, message: '请输入验证码' }],
    password: [
      { required: true, message: '请输入密码' },
      { pattern: /^(?=.*[A-Za-z])(?=.*\d).{6,}$/, message: '密码至少6位，且包含字母和数字' },
    ],
    confirmPassword: [
      { required: true, message: '请确认密码' },
      { validator: (val) => val === form.value.password, message: '两次输入密码不一致' },
    ],
    area: [{ required: true, message: '请选择所在地区' }],
    detailAddress: [{ required: true, message: '请输入详细地址' }],
    nation: [{ required: true, message: '请选择民族' }],
    idType: [{ required: true, message: '请选择证件类型' }],
    birthday: [{ required: true, message: '请选择出生日期' }],
    gender: [{ required: true, message: '请选择性别' }],
  });

  watch(
    () => form.value.idCard,
    (newIdCard) => {
      if (newIdCard && newIdCard.length === 18) {
        const birthYear = newIdCard.substring(6, 10);
        const birthMonth = newIdCard.substring(10, 12);
        const birthDay = newIdCard.substring(12, 14);
        form.value.birthday = `${birthYear}-${birthMonth}-${birthDay}`;

        const genderCode = parseInt(newIdCard.charAt(16), 10);
        form.value.gender = genderCode % 2 === 0 ? '0' : '1';
      }
    },
  );

  onBeforeUnmount(() => {
    if (timer) clearInterval(timer);
  });

  const countdown = ref(0);
  let timer = null;

  async function onClickGetVerificationCode() {
    if (countdown.value > 0) return;

    const res = await sendYunMsgApi({
      type: 'kopebe',
      phone: form.value.phoneNumber,
    });
    console.log(res);

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

  const buildAreaTree = () => {
    const provinces = areaData[86];

    return Object.keys(provinces).map((provinceCode) => {
      const provinceName = provinces[provinceCode];
      const cities = areaData[provinceCode] || {};

      return {
        label: provinceName,
        value: provinceCode,
        children: Object.keys(cities).map((cityCode) => {
          const cityName = cities[cityCode];
          const districts = areaData[cityCode] || {};

          return {
            label: cityName,
            value: cityCode,
            children: Object.keys(districts).map((districtCode) => ({
              label: districts[districtCode],
              value: districtCode,
            })),
          };
        }),
      };
    });
  };

  const areaOptions = buildAreaTree();

  function getAreaText(values, options) {
    const result = [];
    let current = options;

    for (let i = 0; i < values.length; i += 1) {
      const node = current.find((item) => item.value === values[i]);
      if (!node) break;

      result.push(node.label);
      current = node.children || [];
    }
    return result;
  }

  const dictData = ref({});
  const nationalityOptions = ref([]);
  const cardTypeOptions = ref([]);
  const genderOptions = ref([]);

  const mapDictToOptions = (dictArray) =>
    dictArray?.map((item) => ({
      label: item.dictLabel,
      value: item.dictValue,
    })) || [];

  onMounted(async () => {
    const data = await getDictDataApi();
    dictData.value = data || {};

    nationalityOptions.value = mapDictToOptions(data?.nationality);
    cardTypeOptions.value = mapDictToOptions(data?.card_type);
    genderOptions.value = mapDictToOptions(data?.sex).filter((item) => item.label === '男' || item.label === '女');

    const defaultCardType = cardTypeOptions.value.find((item) => item.label === '居民身份证');
    if (defaultCardType) {
      form.value.idType = defaultCardType.value;
    }

    const defaultNation = nationalityOptions.value.find((item) => item.label === '汉族');
    if (defaultNation) {
      form.value.nation = defaultNation;
    }
  });

  const btnDisabled = computed(() => !form.value.phoneNumber || countdown.value > 0);

  async function goRegister() {
    if (loading.value) return;

    const isValid = await registerFormRef.value.validate();
    if (isValid !== true && !isEmptyObject(isValid)) {
      console.error('注册表单验证失败:', isValid);
      return;
    }

    try {
      loading.value = true;
      const formData = {
        ...form.value,
      };
      formData.nation = formData.nation.label;
      const areaText = getAreaText(formData.area, areaOptions);
      formData.province = areaText[0];
      formData.city = areaText[1];
      formData.district = areaText[2];
      const res = await registerApi(formData);
      console.log(res);
      router.push(loginPath);
    } catch (error) {
      console.error('注册提交异常:', error);
    } finally {
      loading.value = false;
    }
  }

  function goLogin() {
    router.push(loginPath);
  }

  function onChangeArea() {}

  onBeforeUnmount(() => {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  });

  return {
    form,
    registerFormRef,
    loading,
    registerFormRules,
    countdown,
    btnDisabled,
    areaOptions,
    nationalityOptions,
    cardTypeOptions,
    genderOptions,
    onClickGetVerificationCode,
    goRegister,
    goLogin,
    onChangeArea,
  };
}
