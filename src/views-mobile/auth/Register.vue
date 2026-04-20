<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { registerApi } from '@/api/user';
import { sendYunMsgApi } from '@/api/user';
import { useUserStore } from '@/store/modules/user';
import { isEmptyObject } from '@/utils/index/common';
import areaData from 'china-area-data';
import { getDictDataApi } from '@/api/user';

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
  province: '',
  city: '',
  district: '',
  detailAddress: '',
  password: '',
  confirmPassword: '',
});

const goLogin = () => {
  // [OLD] router.push('/login');
  // [FIXED] 移动端注册页返回移动端登录
  router.push('/mobile/login');
};

// 监听身份证号变化，自动填充出生日期和性别
watch(
  () => form.value.idCard,
  (newIdCard) => {
    if (newIdCard && newIdCard.length === 18) {
      // 从身份证号中提取出生日期（第7-14位）
      const birthYear = newIdCard.substring(6, 10);
      const birthMonth = newIdCard.substring(10, 12);
      const birthDay = newIdCard.substring(12, 14);
      form.value.birthday = `${birthYear}-${birthMonth}-${birthDay}`;

      // 从身份证号中提取性别（第17位，奇数为男，偶数为女）
      const genderCode = parseInt(newIdCard.charAt(16), 10);
      // 假设性别选项的值为 '0' 代表女，'1' 代表男
      form.value.gender = genderCode % 2 === 0 ? '0' : '1';
    }
  },
);

const registerFormRef = ref(null);
const loading = ref(false); // [FIXED] 注册提交状态控制
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

// [FIXED] 实现防抖/节流：增加 loading 锁，防止重复提交
async function goRegister() {
  if (loading.value) return;
  const isValid = await registerFormRef.value.validate();
  console.log(isValid);
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
    // [OLD] router.push('/login');
    // [FIXED] 移动端注册成功后跳转移动端登录
    router.push('/mobile/login');
  } catch (error) {
    console.error('注册提交异常:', error);
  } finally {
    loading.value = false;
  }
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

  // 设置默认值
  // 1. 证件类型默认：居民身份证
  const defaultCardType = cardTypeOptions.value.find((item) => item.label === '居民身份证');
  if (defaultCardType) {
    form.value.idType = defaultCardType.value;
  }

  // 2. 民族默认：汉族 (因为 t-select 使用了 value-type="object")
  const defaultNation = nationalityOptions.value.find((item) => item.label === '汉族');
  if (defaultNation) {
    console.log(defaultNation);
    form.value.nation = defaultNation;
  }
});

const btnDisabled = computed(() => {
  return !form.value.phoneNumber || countdown.value > 0;
});

// [FIXED] PC 模板中存在 @change="onChangeArea"，补齐处理函数以避免运行时告警
function onChangeArea() {}

onBeforeUnmount(() => {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
});
</script>

<template>
  <div
    ref="pageRef"
    class="mobile-register-page"
  >
    <!-- <div
      class="pull-indicator"
      :style="pullIndicatorStyle"
    >
      <t-loading
        v-if="isRefreshing"
        size="small"
      />
      <span>{{ pullHint }}</span>
    </div> -->

    <section class="register-card">
      <header class="card-header">
        <h1 class="title">注册</h1>
        <!-- <p class="subtitle">请完善信息完成账号注册</p> -->
      </header>

      <div class="form-container">
        <t-form
          ref="registerFormRef"
          :data="form"
          :rules="registerFormRules"
          layout="vertical"
          label-align="top"
        >
          <t-form-item
            label="姓名"
            name="realName"
          >
            <t-input
              v-model="form.realName"
              borderless
              placeholder="请输入姓名"
            />
          </t-form-item>

          <t-form-item
            label="证件类型"
            name="idType"
          >
            <t-select
              v-model="form.idType"
              borderless
              placeholder="请选择证件类型"
            >
              <t-option
                v-for="item in cardTypeOptions"
                :key="item.value"
                :value="item.value"
                :label="item.label"
                :disabled="item.label !== '居民身份证'"
              />
            </t-select>
          </t-form-item>

          <t-form-item
            label="证件号码"
            name="idCard"
          >
            <t-input
              v-model="form.idCard"
              borderless
              placeholder="请输入证件号码"
            />
          </t-form-item>

          <t-form-item
            label="出生日期"
            name="birthday"
          >
            <t-date-picker
              v-model="form.birthday"
              borderless
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
              borderless
              placeholder="请输入手机号码"
            />
          </t-form-item>

          <t-form-item
            label="验证码"
            name="verificationCode"
          >
            <t-input
              v-model="form.verificationCode"
              borderless
              placeholder="请输入验证码"
            >
              <template #suffix>
                <t-button
                  class="get-verification-code-btn"
                  :class="{ disabled: btnDisabled }"
                  shape="round"
                  theme="primary"
                  size="small"
                  @click="!btnDisabled && onClickGetVerificationCode()"
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
              borderless
              type="password"
              placeholder="请输入密码"
            />
          </t-form-item>

          <t-form-item
            label="确认密码"
            name="confirmPassword"
          >
            <t-input
              v-model="form.confirmPassword"
              borderless
              type="password"
              placeholder="请确认密码"
            />
          </t-form-item>

          <t-form-item
            label="性别"
            name="gender"
          >
            <t-select
              v-model="form.gender"
              borderless
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
              borderless
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
              borderless
              :options="areaOptions"
              value-type="full"
              placeholder="请选择所在地区"
              clearable
              @change="onChangeArea"
            />
          </t-form-item>

          <t-form-item
            label="详细地址"
            name="detailAddress"
          >
            <t-input
              v-model="form.detailAddress"
              borderless
              placeholder="请输入详细地址"
            />
          </t-form-item>
        </t-form>
      </div>
    </section>
    <div class="fixed-actions">
      <t-button
        class="btn primary"
        theme="primary"
        block
        shape="round"
        :loading="loading"
        @click="goRegister"
      >
        注册
      </t-button>

      <t-button
        class="btn"
        block
        variant="outline"
        shape="round"
        @click="goLogin"
      >
        去登录
      </t-button>
    </div>
  </div>
</template>

<style scoped lang="less">
:deep(.t-input--borderless:not(.t-input--focused):hover) {
  border: 0;
  background-color: transparent;
}

.t-input {
  border-width: 0;
}

:deep(.t-select-input--borderless .t-input:hover:not(.t-input--focused)) {
  border: 0;
  background-color: transparent;
}

.mobile-register-page {
  min-height: 100%;
  /**
  padding-bottom: calc(clamp(20px, 6vw, 28px) + env(safe-area-inset-bottom));**/
  overflow-y: auto;
  overscroll-behavior-y: contain;
  touch-action: manipulation;
}

.pull-indicator {
  position: sticky;
  top: 0;
  z-index: 5;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 40px;
  font-size: 12px;
  color: @text-regular;
  transform: translate3d(0, -48px, 0);
  transition:
    transform 0.2s ease,
    opacity 0.2s ease;
  will-change: transform;
}

/* 与 PC 差异：固定宽度注册表单改为移动端自适应单列长表单 */
.register-card {
  width: min(100%, 560px);
  margin: 0 auto;
  padding: clamp(16px, 4.5vw, 22px);
  padding-bottom: 40px;
  border-radius: clamp(16px, 4vw, 20px);
  background: @bg-white;
  box-shadow: 0 12px 28px rgb(0 0 0 / 8%);
  transform: translateZ(0);
}

.card-header {
  margin-bottom: clamp(14px, 4vw, 20px);
}

.title {
  margin: 0;
  color: @primary-color;
  font-size: clamp(24px, 6vw, 30px);
  font-weight: 700;
  text-align: center;
}

.subtitle {
  margin: 8px 0 0;
  color: @text-secondary;
  font-size: 13px;
  text-align: center;
}

.form-container {
  :deep(.t-form__label) {
    margin-bottom: 6px;
    color: @text-regular;
    font-size: 13px;
  }

  :deep(.t-form__item) {
    margin-bottom: 12px;
    border-bottom: 1px solid #eef1f4;
  }

  :deep(.t-input) {
    border-radius: 10px;
  }

  .get-verification-code-btn {
    border-color: @primary-color;
    color: @primary-color;
    background-color: #fff;

    &.disabled {
      border-color: #999;
      color: #999;
      background-color: #f5f5f5;
      cursor: not-allowed;
    }
  }
}

.btn {
  height: 44px;
  margin-top: 6px;
  border-radius: 999px;
  font-size: 14px;
  transform: translateZ(0);

  &:active {
    transform: scale(0.98) translateZ(0);
  }

  &.primary {
    color: #fff;
    background: @primary-color;
  }
}

.extra {
  margin-top: 14px;
  color: @text-secondary;
  font-size: 13px;

  &.center {
    text-align: center;
  }
}

.link {
  margin-left: @space-xs;
  border: 0;
  padding: 0;
  color: @primary-color;
  font-size: 13px;
  background: transparent;

  &:active {
    opacity: 0.72;
  }
}

@media (orientation: landscape) {
  .mobile-register-page {
    min-height: 100%;
  }
}

/* [FIXED] 清理多余 padding/外层壳：内容贴合屏幕边缘，仅保留安全区 */
.mobile-register-page {
  padding-top: env(safe-area-inset-top);
  padding-right: 0;
  /* [OLD] padding-bottom: env(safe-area-inset-bottom); */
  /* [FIXED] 为底部固定按钮留出空间 */
  padding-bottom: calc(0px + env(safe-area-inset-bottom));
  padding-left: 0;
}

/* [FIXED] 底部固定操作区样式 */
.fixed-actions {
  position: fixed;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 100;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  padding-bottom: calc(16px + env(safe-area-inset-bottom));
  background: @bg-white;
  box-shadow: 0 -4px 12px rgb(0 0 0 / 6%);
}

/* [FIXED] 长表单改为贴边承载，去除卡片额外留白 */

/* [FIXED] 纯包裹容器仅保留结构，不再产生额外布局间距 */
.card-header,
.form-container,
.extra {
  margin: 0;
}

.btn {
  margin-top: 0;
}
</style>
