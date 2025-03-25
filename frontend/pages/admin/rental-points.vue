<template>
  <rentalPoints />
</template>
  
<script setup>
definePageMeta({
  title: "Пункты проката",
});
useSeoMeta({
  title: "Пункты проката",
});
const userStore = useUserStore();

onMounted(() => {
  if (!userStore.profile || userStore.profile?.role === "client") {
    navigateTo("/");
  }
});
</script>
  