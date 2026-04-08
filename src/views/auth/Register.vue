<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { sendYunMsgApi, registerApi } from '@/api/user';

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

async function goRegister() {
  form.value.nation = form.value.nation.label;
  form.value.province = form.value.area[0].label;
  form.value.city = form.value.area[1].label;
  form.value.district = form.value.area[2].label;

  const res = await registerApi(form.value);
  console.log(res);
}
// 验证码
async function onClickGetVerificationCode() {
  console.log('获取验证码');
  const res = await sendYunMsgApi({
    type: 'kopebe',
    phone: form.value.phoneNumber,
  });
  console.log(res);
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
//#endregion
// 字典数据
import { getDictDataApi } from '@/api/user';
const dictData = ref({});
const nationalityOptions = ref([]);
const cardTypeOptions = ref([]);
onMounted(async () => {
  const data = await getDictDataApi();
  console.log(data);
  dictData.value = data || {};
  // 民族数据格式转换为下拉选项
  nationalityOptions.value =
    data?.nationality?.map((item) => ({
      label: item.dictLabel,
      value: item.dictValue,
    })) || [];
  // 证件类型数据格式转换为下拉选项
  cardTypeOptions.value =
    data?.card_type?.map((item) => ({
      label: item.dictLabel,
      value: item.dictValue,
    })) || [];
});
</script>

<template>
  <div class="auth-form">
    <div class="title">注册</div>

    <div class="form-container">
      <t-form
        :data="form"
        layout="vertical"
      >
        <t-form-item
          label="姓名"
          name="realName"
          requiredMark
        >
          <t-input
            v-model="form.realName"
            placeholder="请输入姓名"
          />
        </t-form-item>

        <t-form-item
          label="证件类型"
          name="idType"
          requiredMark
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
          requiredMark
        >
          <t-input
            v-model="form.idCard"
            placeholder="请输入证件号码"
          />
        </t-form-item>
        <t-form-item
          label="出生日期"
          name="birthday"
          requiredMark
        >
          <t-date-picker
            v-model="form.birthday"
            type="date"
            placeholder="请选择出生日期"
          />
        </t-form-item>
        <t-form-item
          label="手机号码"
          name="phoneNumber"
          requiredMark
        >
          <t-input
            v-model="form.phoneNumber"
            placeholder="请输入手机号码"
          />
        </t-form-item>
        <t-form-item
          label="验证码"
          name="verificationCode"
          requiredMark
        >
          <t-input
            v-model="form.verificationCode"
            placeholder="请输入验证码"
          >
            <template #suffix>
              <t-button
                class="get-verification-code-btn"
                @click="onClickGetVerificationCode"
                shape="round"
                type="primary"
                size="small"
                >获取动态码</t-button
              >
            </template>
          </t-input>
        </t-form-item>
        <t-form-item
          label="密码"
          name="password"
          requiredMark
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
          requiredMark
        >
          <t-select
            v-model="form.gender"
            placeholder="请选择性别"
          >
            <t-option
              value="male"
              label="男"
            />
            <t-option
              value="female"
              label="女"
            />
          </t-select>
        </t-form-item>
        <t-form-item
          label="民族"
          name="nation"
          requiredMark
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
        <t-form
          :data="form"
          layout="vertical"
        >
          <t-form-item
            label="所在地区"
            requiredMark
          >
            <t-cascader
              v-model="form.area"
              :options="areaOptions"
              placeholder="请选择所在地区"
              clearable
            />
          </t-form-item>
        </t-form>
        <t-form-item
          label="详细地址"
          name="detailAddress"
          requiredMark
        >
          <t-input
            v-model="form.detailAddress"
            placeholder="请输入详细地址"
          />
        </t-form-item>

        <!-- <t-form-item
          label="国籍"
          name="nationality"
          requiredMark
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
