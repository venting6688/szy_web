<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue';
import { useUserStore } from '@/store/modules/user';

const userStore = useUserStore();

onMounted(() => {
  console.log('Component mounted!');
});
</script>

<template>
  <div>
    <h1>个人中心</h1>
    <p>用户名：{{ userStore.userInfo.username }}</p>
    <p>邮箱：{{ userStore.userInfo.email }}</p>
  </div>
</template>

<style scoped lang="less"></style>
