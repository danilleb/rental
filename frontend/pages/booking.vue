<template>
  <bookings :is-admin="false" />
</template>
  
<script setup>
definePageMeta({
  title: "Мои бронирования",
});
useSeoMeta({
  title: "Мои бронирования",
});

const userStore = useUserStore();
onMounted(() => {
  if (!userStore.profile) {
    navigateTo("/");
  }
});
</script>
  
  <style>
</style>