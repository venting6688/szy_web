<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue';
import { useUserStore } from '@/store/modules/user';

const userStore = useUserStore();

const currentTab = ref('profile');

//#region 个人信息表单数据
import { updateProfileApi } from '@/api/user';
const profileFormData = ref({
  realName: userStore.userInfo.realName,
  idCard: userStore.userInfo.idCard,
  phonenumber: userStore.userInfo.phonenumber,
  address: userStore.userInfo.address,
});
const profileFormRef = ref(null);

import { isEmptyObject } from '@/utils/index/common';

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
import { updatePasswordApi } from '@/api/user';
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
const router = useRouter();
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
              <t-input v-model="profileFormData.realName" />
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
              <t-input v-model="profileFormData.phonenumber" />
            </t-form-item>
            <t-form-item
              label="家庭住址"
              prop="address"
              name="address"
            >
              <t-input v-model="profileFormData.address" />
            </t-form-item>
          </t-form>
          <t-button
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
