<template>
  <v-app>
    <v-navigation-drawer v-model="drawer" temporary app class="d-sm-none">
      <v-list>
        <v-list-item
          v-for="(item, index) in navItems"
          :key="index"
          @click="drawer = false"
        >
          <nuxt-link :to="item.link">
            <v-list-item-title>{{ item.name }}</v-list-item-title>
          </nuxt-link>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
    <v-app-bar app color="primary" dark hide-on-scroll>
      <v-app-bar-nav-icon @click="drawer = !drawer" class="d-sm-none" />
      <v-toolbar-title>{{ pageTitleName }}</v-toolbar-title>
      <v-spacer></v-spacer>
      <div class="d-none d-sm-flex">
        <nuxt-link
          :to="item.link"
          v-for="(item, index) in navItems"
          :key="index"
        >
          <v-btn text>{{ item.name }}</v-btn>
        </nuxt-link>
      </div>
    </v-app-bar>
    <v-main>
      <v-container fluid>
        <slot />
      </v-container>
    </v-main>
  </v-app>
</template>
  
<script setup>
const dataStore = useDataStore();
const userStore = useUserStore();
import { useRoute } from "vue-router";
const route = useRoute();
const pageTitleName = computed(() => {
  return route.meta.title || "Страница без названия";
});
const drawer = ref(false);

const userProfile = computed(() => {
  return userStore.profile;
});
const navItems = computed(() => {
  const titles = {
    // "/faq": "FAQ",
  };
  console.log(userProfile.value);
  if (userProfile.value) {
    if (userProfile.value?.role === "client") {
      titles["/booking"] = "Мои бронирования";
      titles["/notifications"] = "Уведомления";
    }
    // titles["/feedback"] = "Обратная связь";
  }
  if (["admin", "manager"].includes(userProfile.value?.role)) {
    titles["/admin"] = "Админ панель";
  }
  if (!["admin", "manager"].includes(userProfile.value?.role)) {
    titles["/rental-points"] = "Пункты проката";
  }

  if (userProfile.value) {
    titles["/profile"] = "Профиль";
  } else {
    titles["/login"] = "Войти";
  }

  const linkHomePage =
    route.path === "/" ? [] : [{ name: "На главную", link: "/" }];
  return [
    ...linkHomePage,
    ...Object.entries(titles)
      .map(([link, name]) => ({
        name,
        link,
      }))
      .filter((el) => el.link !== route.path),
  ];
});

onMounted(() => {
  Promise.all([
    userStore.getProfile(),
    dataStore.getCategories(),
    dataStore.getRentalPoints(),
    dataStore.getAllSizesInventory(),
  ])
    .then(() => {})
    .catch((error) => {
      console.error("Ошибка при загрузке данных:", error);
    });
});
</script>
  
<style>
</style>