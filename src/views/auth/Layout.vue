<script setup>
import FooterMobile from '@/components/Footer/FooterMobile.vue';
</script>

<template>
  <div class="auth-layout">
    <div class="auth">
      <!-- 左侧背景 -->
      <div class="auth-left"></div>

      <!-- 右侧内容 -->
      <div class="auth-right">
        <div class="auth-card">
          <router-view />
        </div>
      </div>
    </div>
    <Footer />
  </div>
</template>

<style scoped lang="less">
.auth-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.auth {
  display: flex;
  height: 100vh;
  flex: 1;
  background: @bg-page;
}

/* 左侧背景 */
.auth-left {
  width: 770px;
  height: 100vh;
  background: url('@/assets/image/auth.png') no-repeat center;
  background-size: cover;
}

/* 右侧 */
.auth-right {
  width: 1150px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 卡片 */
.auth-card {
  width: 643px;
  padding: @space-xl;
  background: @bg-white;
  border-radius: @radius-large;
  box-shadow: @shadow-card;
}
</style>
