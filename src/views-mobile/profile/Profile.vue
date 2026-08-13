<script setup>
import { useProfileLogic } from '@/composables/useProfileLogic';

const {
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
} = useProfileLogic();
</script>

<template>
  <div
    ref="pageRef"
    class="mobile-profile-page"
  >
    <!-- <section class="hero-card">
      <div class="user-row">
        <img
          src="@/assets/image/profile_user.png"
          alt="avatar"
          class="avatar"
        />
        <div class="user-meta">
          <div class="name">{{ userStore.userInfo.realName || '-' }}</div>
          <div class="id-card">{{ userStore.userInfo.idCard || '-' }}</div>
        </div>
        <button
          type="button"
          class="btn-logout"
          @click="onClickLogout"
        >
          退出
        </button>
      </div>
    </section> -->

    <section class="tab-panel">
      <!-- 与 PC 差异：sidebar 改为顶部分段切换，减少横向占用 -->
      <div class="tab-header">
        <button
          class="tab-item"
          :class="{ active: currentTab === 'profile' }"
          type="button"
          @click="onClick('profile')"
        >
          当前就诊人
        </button>
        <button
          class="tab-item"
          :class="{ active: currentTab === 'password' }"
          type="button"
          @click="onClick('password')"
        >
          修改密码
        </button>
      </div>

      <div
        v-if="currentTab === 'profile'"
        class="form-card"
      >
        <t-form
          ref="profileFormRef"
          :data="profileFormData"
          :rules="profileFormRules"
          label-align="top"
        >
          <t-form-item
            label="姓名"
            prop="realName"
            name="realName"
          >
            <t-input
              :disabled="!isModify"
              v-model="profileFormData.realName"
              placeholder="请输入姓名"
            />
          </t-form-item>
          <t-form-item
            label="证件号"
            prop="idCard"
            name="idCard"
          >
            <t-input
              v-model="profileFormData.idCard"
              disabled
            />
          </t-form-item>
          <t-form-item
            label="手机号"
            prop="phonenumber"
            name="phonenumber"
          >
            <t-input
              v-model="profileFormData.phonenumber"
              :disabled="!isModify"
              placeholder="请输入手机号"
            />
          </t-form-item>
          <t-form-item
            label="家庭住址"
            prop="address"
            name="address"
          >
            <t-input
              :disabled="!isModify"
              v-model="profileFormData.address"
              placeholder="请输入家庭住址"
            />
          </t-form-item>
        </t-form>

        <t-button
          v-if="!isModify"
          block
          class="btn-submit"
          theme="primary"
          @click="onClickModify"
        >
          修改
        </t-button>
        <t-button
          v-if="isModify"
          block
          class="btn-submit"
          theme="primary"
          @click="submitProfile"
        >
          提交个人信息
        </t-button>
      </div>

      <div
        v-else
        class="form-card"
      >
        <t-form
          :model="passwordFormData"
          :rules="passwordFormRules"
          label-align="top"
        >
          <t-form-item
            label="旧密码"
            prop="oldPassword"
            name="oldPassword"
          >
            <t-input
              v-model="passwordFormData.oldPassword"
              type="password"
              placeholder="请输入旧密码"
            />
          </t-form-item>
          <t-form-item
            label="新密码"
            prop="newPassword"
            name="newPassword"
          >
            <t-input
              v-model="passwordFormData.newPassword"
              type="password"
              placeholder="请输入新密码"
            />
          </t-form-item>
          <t-form-item
            label="确认新密码"
            prop="confirmPassword"
            name="confirmPassword"
          >
            <t-input
              v-model="passwordFormData.confirmPassword"
              type="password"
              placeholder="请再次输入新密码"
            />
          </t-form-item>
        </t-form>

        <t-button
          block
          class="btn-submit"
          theme="primary"
          @click="submitPassword"
        >
          提交密码修改
        </t-button>
      </div>
    </section>
  </div>
</template>

<style scoped lang="less">
.mobile-profile-page {
  min-height: 100%;
  padding: clamp(12px, 3.5vw, 18px);
  padding-bottom: calc(clamp(20px, 6vw, 28px) + env(safe-area-inset-bottom));
  overscroll-behavior-y: contain;
  touch-action: manipulation;
  background: linear-gradient(180deg, rgb(32 133 126 / 8%) 0, rgb(32 133 126 / 0%) 160px), @bg-page;
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

.hero-card {
  margin-bottom: clamp(12px, 4vw, 18px);
  padding: clamp(14px, 4vw, 18px);
  border-radius: clamp(14px, 4vw, 18px);
  background: linear-gradient(135deg, #20857e 0%, #36a095 100%);
  box-shadow: 0 10px 24px rgb(32 133 126 / 18%);
  transform: translateZ(0);
}

.user-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  border: 2px solid rgb(255 255 255 / 46%);
  background-color: #fff;
}

.user-meta {
  min-width: 0;
  flex: 1;
}

.name {
  font-size: clamp(17px, 4.4vw, 20px);
  font-weight: 700;
  color: #fff;
}

.id-card {
  margin-top: 4px;
  font-size: 12px;
  color: rgb(255 255 255 / 85%);
  word-break: break-all;
}

.btn-logout {
  min-width: 64px;
  height: 32px;
  padding: 0 12px;
  border: 0;
  border-radius: 999px;
  font-size: 12px;
  color: @warning-color;
  background: #fff6e8;
  transform: translateZ(0);

  &:active {
    transform: scale(0.96) translateZ(0);
  }
}

.tab-panel {
  padding: clamp(14px, 4vw, 18px);
  border-radius: clamp(16px, 4vw, 20px);
  background: @bg-white;
  box-shadow: @shadow-card;
}

.tab-header {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  margin-bottom: 14px;
  padding: 4px;
  border-radius: 12px;
  background: #f6f7f9;
}

.tab-item {
  height: 38px;
  border: 0;
  border-radius: 10px;
  font-size: 14px;
  color: @text-regular;
  background: transparent;
  transform: translateZ(0);

  &:active {
    transform: scale(0.98) translateZ(0);
  }

  &.active {
    font-weight: 700;
    color: @primary-color;
    background: @bg-white;
    box-shadow: 0 2px 8px rgb(0 0 0 / 8%);
  }
}

/* 与 PC 差异：表单改为纵向单列，label 放在顶部，避免移动端横向拥挤 */
.form-card {
  :deep(.t-form__label) {
    margin-bottom: 6px;
    color: @text-regular;
    font-size: 13px;
  }

  :deep(.t-input) {
    border-radius: 10px;
  }
  :deep(.t-input__inner) {
    font-size: 16px;
  }
}

.btn-submit {
  margin: 20px auto 5px;
  height: 42px;
  border-radius: 999px;
  transform: translateZ(0);

  &:active {
    transform: scale(0.98) translateZ(0);
  }
}
</style>
