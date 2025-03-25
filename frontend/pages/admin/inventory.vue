<template>
  <Products :isAdmin="true"/>
</template>

<script setup>
const userStore = useUserStore();

definePageMeta({
  title: "Инвентарь",
});
useSeoMeta({
  title: "Инвентарь",
});

onMounted(() => {
  if (!userStore.profile || userStore.profile?.role === "client") {
    navigateTo("/");
  }
});
</script>

<style>

</style>