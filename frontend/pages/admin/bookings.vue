<template>
  <bookings :is-admin="true" />
</template>
  
  <script setup>
definePageMeta({
  title: "Бронирования",
});
useSeoMeta({
  title: "Бронирования",
});
const userStore = useUserStore();
onMounted(() => {
  if (!userStore.profile || userStore.profile?.role === "client") {
    navigateTo("/");
  }
});
</script>
  
  <style>
</style>