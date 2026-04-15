<script setup>
import { onMounted } from 'vue';
import Footer from '@/components/Footer/Footer.vue';

onMounted(() => {
  console.log('Mobile Layout mounted!');
});
</script>

<template>
  <div class="mobile-layout">
    <div class="mobile-content">
      <router-view />
    </div>
    <Footer />
  </div>
</template>

<style scoped lang="less">
.mobile-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.mobile-content {
  flex: 1;
}
</style>
