<script setup>
import { onMounted } from 'vue';
import { useHospitalStore } from '@/store/modules/hospital';

const hospitalStore = useHospitalStore();

onMounted(() => {
  hospitalStore.fetchHospitalList();
});
</script>

<template>
  <div id="the-app">
    <RouterView />
  </div>
</template>

<style scoped>
#the-app {
  width: 100vw;
  height: 100%;
}
</style>
