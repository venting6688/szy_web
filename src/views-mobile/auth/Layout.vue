<script setup>
import FooterMobile from '@/components/Footer/FooterMobile.vue';
</script>

<template>
  <div class="mobile-auth-layout">
    <section class="auth-hero">
      <img
        class="hero-image"
        src="@/assets/image/auth.png"
        alt="auth"
      />
      <div class="hero-mask"></div>
      <div class="hero-content">
        <div class="hero-badge">山东省中医院</div>
        <!-- <div class="hero-title">互联网医院</div>
        <div class="hero-subtitle">挂号预约、个人中心、就诊服务一体化</div> -->
      </div>
    </section>

    <section class="auth-panel">
      <div class="mobile-auth-card">
        <router-view />
      </div>
    </section>

    <!-- 移动端页脚 -->
    <div class="auth-footer-mobile">
      <FooterMobile />
    </div>
  </div>
</template>

<style scoped lang="less">
.auth-footer-mobile {
  margin-bottom: 100px;
}
/* [FIXED] 认证页整体改为上下分区布局，顶部展示品牌视觉图，底部承载子页面内容 */
.mobile-auth-layout {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  background: @bg-page;
  overflow-x: hidden;
  /* [FIXED] 滚动由 auth-panel 内部子页面承担，外层布局保持固定 */
  overflow-y: hidden;
}

/* [FIXED] 顶部视觉区直接使用设计图，叠加品牌文案提高识别度 */
.auth-hero {
  position: relative;
  height: min(20vh, 380px);
  min-height: 170px;
  overflow: hidden;
  background: #dfe7f2;
}

.hero-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center top;
  transform: scale(1.02) translateZ(0);
}

.hero-mask {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgb(255 255 255 / 20%) 0%, rgb(20 44 77 / 16%) 100%);
}

.hero-content {
  position: absolute;
  right: clamp(16px, 5vw, 24px);
  bottom: clamp(20px, 6vw, 28px);
  left: clamp(16px, 5vw, 24px);
  color: #fff;
  text-shadow: 0 2px 8px rgb(0 0 0 / 16%);
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  padding: 5px 10px;
  margin-bottom: 20px;
  border-radius: 999px;
  font-size: 24px;
}

.hero-title {
  font-size: clamp(24px, 7vw, 32px);
  font-weight: 700;
  line-height: 1.2;
}

.hero-subtitle {
  margin-top: 8px;
  font-size: clamp(12px, 3.4vw, 14px);
  line-height: 1.6;
}

/* [FIXED] 下方内容区采用上浮卡片感承接 router-view，避免直接贴边 */
.auth-panel {
  position: relative;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  margin-top: -4px;
}

.mobile-auth-card {
  width: 100%;
  flex: 1;
  min-height: 0;
  max-width: 560px;
  margin: 0 auto;
  background: transparent;
}

@media (orientation: landscape) {
  .auth-hero {
    height: min(58vh, 420px);
  }

  .auth-panel {
    margin-top: -30px;
  }
}
</style>
