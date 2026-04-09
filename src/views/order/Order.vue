<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue';

onMounted(() => {
  console.log('Component mounted!');
});
</script>

<template>
  <div>
    <div class="title">订单管理</div>
  </div>
</template>

<style scoped lang="less"></style>
