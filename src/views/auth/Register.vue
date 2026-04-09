<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { registerApi } from '@/api/user';
import { useUserStore } from '@/store/modules/user';
import { sendYunMsgApi } from '@/api/user';

const userStore = useUserStore();
const router = useRouter();

onMounted(() => {
  console.log('Component mounted!');
});
const form = ref({
  idType: '',
  idCard: '',
  realName: '',
  birthday: '',
  gender: '',
  phoneNumber: '',
  verificationCode: '',
  nation: '',
  province: '山东省',
  city: '济南市',
  district: '历城区',
  detailAddress: '唐冶街道xxx小区1号楼1单元101',
  password: '123456',
  confirmPassword: '123456',
});

const goLogin = () => {
  router.push('/login');
};

import { isEmptyObject } from '@/utils/index/common';

const registerFormRef = ref(null);
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
  password: [{ required: true, message: '请输入密码' }],
  confirmPassword: [{ required: true, message: '请确认密码' }],
  area: [{ required: true, message: '请选择所在地区' }],

  detailAddress: [{ required: true, message: '请输入详细地址' }],
  nation: [{ required: true, message: '请选择民族' }],
  idType: [{ required: true, message: '请选择证件类型' }],
  birthday: [{ required: true, message: '请选择出生日期' }],
  gender: [{ required: true, message: '请选择性别' }],
});
async function goRegister() {
  const isValid = await registerFormRef.value.validate();
  console.log(isValid);
  if (isValid !== true && !isEmptyObject(isValid)) {
    throw new Error('注册表单验证失败:', isValid);
  }
  const formData = {
    ...form.value,
  };
  formData.nation = formData.nation.label;
  const areaText = getAreaText(formData.area, areaOptions);
  formData.province = areaText[0];
  formData.city = areaText[1];
  formData.district = areaText[2];
  const res = await registerApi(formData);
  router.push('/login');
  console.log(res);
}
const countdown = ref(0); // 倒计时秒数
let timer = null; // 定时器实例

// 验证码
async function onClickGetVerificationCode() {
  console.log(form.value.phoneNumber);

  if (countdown.value > 0) return; // 防止重复点击

  console.log('获取验证码');
  const res = await sendYunMsgApi({
    type: 'kopebe',
    phone: form.value.phoneNumber,
  });
  console.log(res);

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
//#region 地址处理
import areaData from 'china-area-data';
console.log(areaData);
// 构建级联数据
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
console.log(areaOptions);

function getAreaText(values, options) {
  let result = [];
  let current = options;

  for (let i = 0; i < values.length; i++) {
    const node = current.find((item) => item.value === values[i]);
    if (!node) break;

    result.push(node.label);
    current = node.children || [];
  }
  return result;
}
//#endregion
// 字典数据
import { getDictDataApi } from '@/api/user';
const dictData = ref({});
const nationalityOptions = ref([]);
const cardTypeOptions = ref([]);
const genderOptions = ref([]);

// 辅助函数：将字典数据转换为下拉选项格式
const mapDictToOptions = (dictArray) => {
  return (
    dictArray?.map((item) => ({
      label: item.dictLabel,
      value: item.dictValue,
    })) || []
  );
};

onMounted(async () => {
  const data = await getDictDataApi();
  console.log(data);
  dictData.value = data || {};

  nationalityOptions.value = mapDictToOptions(data?.nationality);
  cardTypeOptions.value = mapDictToOptions(data?.card_type);
  genderOptions.value = mapDictToOptions(data?.sex).filter((item) => item.label === '男' || item.label === '女');
});

const btnDisabled = computed(() => {
  return !form.value.phoneNumber || countdown.value > 0;
});
</script>

<template>
  <div class="auth-form">
    <div class="title">注册</div>

    <div class="form-container">
      <t-form
        :data="form"
        ref="registerFormRef"
        layout="vertical"
        :rules="registerFormRules"
      >
        <t-form-item
          label="姓名"
          name="realName"
        >
          <t-input
            v-model="form.realName"
            placeholder="请输入姓名"
          />
        </t-form-item>

        <t-form-item
          label="证件类型"
          name="idType"
        >
          <t-select
            v-model="form.idType"
            placeholder="请选择证件类型"
          >
            <t-option
              v-for="item in cardTypeOptions"
              :key="item.value"
              :value="item.value"
              :label="item.label"
            />
          </t-select>
        </t-form-item>
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
          label="出生日期"
          name="birthday"
        >
          <t-date-picker
            v-model="form.birthday"
            class="w-full"
            type="date"
            placeholder="请选择出生日期"
          />
        </t-form-item>
        <t-form-item
          label="手机号码"
          name="phoneNumber"
        >
          <t-input
            v-model="form.phoneNumber"
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
          label="密码"
          name="password"
        >
          <t-input
            v-model="form.password"
            type="password"
            placeholder="请输入密码"
          />
        </t-form-item>
        <t-form-item
          label="性别"
          name="gender"
        >
          <t-select
            v-model="form.gender"
            placeholder="请选择性别"
          >
            <t-option
              v-for="item in genderOptions"
              :key="item.value"
              :value="item.value"
              :label="item.label"
            />
          </t-select>
        </t-form-item>
        <t-form-item
          label="民族"
          name="nation"
        >
          <t-select
            v-model="form.nation"
            placeholder="请选择民族"
            value-type="object"
          >
            <t-option
              v-for="item in nationalityOptions"
              :key="item.value"
              :value="item.value"
              :label="item.label"
            />
          </t-select>
        </t-form-item>
        <t-form-item
          label="所在地区"
          name="area"
        >
          <t-cascader
            v-model="form.area"
            :options="areaOptions"
            value-type="full"
            placeholder="请选择所在地区"
            @change="onChangeArea"
            clearable
          />
        </t-form-item>
        <t-form-item
          label="详细地址"
          name="detailAddress"
        >
          <t-input
            v-model="form.detailAddress"
            placeholder="请输入详细地址"
          />
        </t-form-item>
        <!-- <t-form-item
          label="国籍"
          name="nationality"

        >
          <t-input
            v-model="form.nationality"
            placeholder="请输入国籍"
          />
        </t-form-item> -->
      </t-form>
    </div>
    <t-button
      class="btn primary"
      block
      variant="outline"
      shape="circle"
      @click="goRegister"
    >
      注册
    </t-button>

    <div class="extra center">
      已有账号？<span
        class="link"
        @click="goLogin"
        >去登录</span
      >
    </div>
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
