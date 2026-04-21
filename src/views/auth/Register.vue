<script setup>
import { useRegisterLogic } from '@/composables/useRegisterLogic';

const {
  form,
  registerFormRef,
  registerFormRules,
  loading,
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
} = useRegisterLogic({
  loginPath: '/login',
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
        labelAlign="left"
      >
        <t-form-item
          label="姓名"
          name="realName"
        >
          <t-input
            borderless
            v-model="form.realName"
            placeholder="请输入姓名"
          />
        </t-form-item>

        <t-form-item
          label="证件类型"
          name="idType"
        >
          <t-select
            borderless
            v-model="form.idType"
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
            borderless
            v-model="form.idCard"
            placeholder="请输入证件号码"
          />
        </t-form-item>
        <t-form-item
          label="出生日期"
          name="birthday"
        >
          <t-date-picker
            borderless
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
            borderless
            v-model="form.phoneNumber"
            placeholder="请输入手机号码"
          />
        </t-form-item>
        <t-form-item
          label="验证码"
          name="verificationCode"
        >
          <t-input
            borderless
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
            borderless
            v-model="form.password"
            type="password"
            placeholder="请输入密码"
          />
        </t-form-item>
        <t-form-item
          label="确认密码"
          name="confirmPassword"
        >
          <t-input
            borderless
            v-model="form.confirmPassword"
            type="password"
            placeholder="请确认密码"
          />
        </t-form-item>
        <t-form-item
          label="性别"
          name="gender"
        >
          <t-select
            borderless
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
            borderless
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
            borderless
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
            borderless
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
      theme="primary"
      block
      shape="circle"
      :loading="loading"
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
        border-bottom: 1px solid #e9ecef;
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
