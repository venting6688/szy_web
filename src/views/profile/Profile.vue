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
  <div class="profile-container">
    <div class="profile-header">
      <div class="header-left">
        <div class="title">个人中心</div>
        <div class="info">
          <span>如需修改个人信息，请修改后点击提交按钮</span>
        </div>
      </div>
      <div class="header-right">
        <div class="profile-card">
          <img
            src="@/assets/image/profile_user.png"
            alt="avatar"
            class="avatar"
          />
          <div class="profile-info">
            <div class="realName">{{ userStore.userInfo.realName }}</div>
            <div class="idCard">{{ userStore.userInfo.idCard }}</div>
          </div>
          <t-button
            ghost
            size="medium"
            class="logout-btn"
            @click="onClickLogout"
            >退出</t-button
          >
        </div>
      </div>
    </div>
    <div class="profile-content">
      <div class="content-left">
        <div
          @click="onClick('profile')"
          class="tab-item"
          :class="{ active: currentTab == 'profile' }"
        >
          <img
            src="@/assets/image/change_profile.png"
            alt="change_profile"
            class="btn-icon"
            v-if="currentTab !== 'profile'"
          />
          <img
            src="@/assets/image/change_profile_active.png"
            alt="change_profile_active"
            class="btn-icon"
            v-else
          />
          <span>当前就诊人</span>
        </div>
        <div
          @click="onClick('password')"
          class="tab-item"
          :class="{ active: currentTab == 'password' }"
        >
          <img
            src="@/assets/image/change_password.png"
            alt="change_password"
            class="btn-icon"
            v-if="currentTab !== 'password'"
          />
          <img
            src="@/assets/image/change_password_active.png"
            alt="change_password_active"
            class="btn-icon"
            v-else
          />
          <span>修改密码</span>
        </div>
      </div>
      <div class="content-right">
        <div
          class="profile"
          v-if="currentTab === 'profile'"
        >
          <t-form
            ref="profileFormRef"
            :data="profileFormData"
            :label-width="100"
            :rules="profileFormRules"
            labelAlign="left"
          >
            <t-form-item
              label="姓名"
              prop="realName"
              name="realName"
            >
              <t-input
                :disabled="!isModify"
                v-model="profileFormData.realName"
              />
            </t-form-item>
            <t-form-item
              label="证件号"
              prop="idCard"
              name="idCard"
            >
              <t-input
                disabled
                v-model="profileFormData.idCard"
              />
            </t-form-item>
            <t-form-item
              label="手机号"
              prop="phonenumber"
              name="phonenumber"
            >
              <t-input
                :disabled="!isModify"
                v-model="profileFormData.phonenumber"
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
              />
            </t-form-item>
          </t-form>
          <t-button
            v-if="!isModify"
            block
            class="submit-btn"
            theme="primary"
            size="medium"
            @click="onClickModify"
          >
            修改
          </t-button>
          <t-button
            v-if="isModify"
            ghost
            type="primary"
            size="medium"
            class="submit-btn"
            @click="submitProfile"
            >提交</t-button
          >
        </div>
        <div
          class="profile password"
          v-if="currentTab === 'password'"
        >
          <t-form
            :model="passwordFormData"
            :label-width="100"
            :rules="passwordFormRules"
            labelAlign="left"
          >
            <t-form-item
              label="旧密码"
              prop="oldPassword"
              name="oldPassword"
            >
              <t-input
                type="password"
                v-model="passwordFormData.oldPassword"
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
              />
            </t-form-item>
          </t-form>
          <t-button
            ghost
            type="primary"
            size="medium"
            class="submit-btn"
            @click="submitPassword"
            >提交</t-button
          >
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
.profile-container {
  padding: 20px;
  .profile-header {
    height: 70px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    .header-left {
      width: 276px;
      .title {
        font-size: 24px;
        font-weight: 800;
        line-height: 30px;
      }
      .info {
        line-height: 34px;
        font-size: @font-base;
        font-weight: 400;
        color: @text-regular;
      }
    }
    .header-right {
      width: calc(100% - 276px - 15px);
      height: 100%;
      padding: @space-md;
      flex: 1;
      margin-left: 15px;
      background: @bg-white;
      border-radius: 14px;

      .profile-card {
        height: 100%;
        display: flex;
        justify-content: flex-start;
        align-items: center;
        .avatar {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          margin-right: 20px;
        }
        .profile-info {
          flex: 1;
          .realName {
            font-size: 16px;
            font-weight: 800;
            line-height: 30px;
          }
          .idCard {
            font-size: 14px;
            font-weight: 400;
            color: @text-regular;
          }
        }
        .logout-btn {
          width: 94px;
          height: 32px;
          border-radius: 24px;
        }
      }
    }
  }
  .profile-content {
    height: 400px;
    margin-top: 15px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    .content-left {
      box-shadow: @shadow-card;
      border-radius: 14px;
      padding: @space-lg;
      width: 276px;
      height: 100%;
      background: @bg-white;
      .tab-item {
        padding: @space-md;
        display: flex;
        justify-content: flex-start;
        align-items: center;
        cursor: pointer;
        .btn-icon {
          width: 14px;
          height: 14px;
          margin-right: 10px;
        }
        &.active {
          color: @primary-color;
          font-weight: 800;
        }
      }
    }
    .content-right {
      box-shadow: @shadow-card;
      border-radius: 14px;
      width: calc(100% - 276px - 15px);
      height: 100%;
      margin-left: 15px;
      background: @bg-white;
      .profile {
        width: 50%;
        margin-top: 40px;
        margin-left: 35px;
      }
    }
  }
  .submit-btn {
    width: 94px;
    height: 32px;
    border-radius: 24px;
    margin-top: 30px;
  }
}
</style>
