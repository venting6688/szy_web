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

async function submitProfile() {
  console.log(profileFormData.value);
  try {
    await updateProfileApi(profileFormData.value);
    MessagePlugin.success('更新个人信息成功');
  } catch (error) {
    MessagePlugin.error(error.message || '更新个人信息失败');
  }
}
const profileFormRules = ref({
  realName: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  idCard: [{ required: true, message: '请输入证件号', trigger: 'blur' }],
  mobile: [{ required: true, message: '请输入手机号', trigger: 'blur' }],
  address: [{ required: true, message: '请输入地址', trigger: 'blur' }],
});

//#endregion

//#region 修改密码表单数据
import { updatePasswordApi } from '@/api/user';
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
import router from '@/router';
function onClickLogout() {
  try {
    useUserStore().logout();
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
        <div class="profile">
          <img
            :src="userStore.userInfo.avatar"
            alt="avatar"
            class="avatar"
          />
          <t-button
            size="small"
            class="logout-btn"
            theme="warning"
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
            :model="profileFormData"
            :label-width="100"
            :rules="profileFormRules"
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
              <t-input v-model="profileFormData.idCard" />
            </t-form-item>
            <t-form-item
              label="手机号"
              prop="mobile"
              name="mobile"
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
            type="primary"
            size="medium"
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
          >
            <t-form-item
              label="旧密码"
              prop="oldPassword"
              name="oldPassword"
            >
              <t-input v-model="passwordFormData.oldPassword" />
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
            type="primary"
            size="medium"
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
  .profile-header {
    height: 100px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: @space-lg;
    box-shadow: @shadow-card;
    .header-left {
      width: 276px;
      .title {
        font-size: 20px;
      }
    }
    .header-right {
      flex: 1;
      margin-left: 20px;
      background: @bg-white;
    }
  }
  .profile-content {
    height: 400px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: @space-lg;
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
      width: calc(100% - 276px - 20px);
      height: 100%;
      margin-left: 20px;
      background: @bg-white;
      .profile {
        width: 50%;
        margin-top: 40px;
        margin-left: 20px;
      }
    }
  }
  .logout-btn {
    width: 61px;
    height: 26px;
    border-radius: 14px;
  }
}
</style>
