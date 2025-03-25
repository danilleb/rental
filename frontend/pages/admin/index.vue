<template>
  <v-container>
    <v-row>
      <v-col v-for="link in links" :key="link.path" cols="12" md="4">
        <nuxt-link :to="link.path" class="card-link">
          <v-card class="pa-4 d-flex align-center justify-center text-center">
            <v-card-title>{{ link.title }}</v-card-title>
          </v-card>
        </nuxt-link>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
const userStore = useUserStore();

definePageMeta({
  title: "Панель администратора",
});
useSeoMeta({
  title: "Панель администратора",
});
const links = computed(() => {
  return [
    { path: "/admin/users", title: "Пользователи" },
    { path: "/admin/inventory", title: "Инвентарь" },
    { path: "/admin/categories", title: "Категории" },
    { path: "/admin/bookings", title: "Бронирования" },
    { path: "/admin/rental-points", title: "Пункты проката" },
  ];
});

onMounted(() => {
  if (!userStore.profile || userStore.profile?.role === "client") {
    navigateTo("/");
  }
});
</script>

<style>
</style>