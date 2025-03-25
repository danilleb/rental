<template>
  <v-container>
    <v-card>
      <v-list>
        <v-list-item
          v-for="notification in notifications"
          :key="notification.id"
        >
          <v-list-item-content>
            <v-list-item-title>{{ notification.message }}</v-list-item-title>
            <v-list-item-subtitle>
              {{ formatDate(notification.created_at) }}
            </v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
        <v-list-item v-if="!notifications || notifications.length === 0">
          <v-list-item-content>
            <v-list-item-title>Нет уведомлений</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-card>
  </v-container>
</template>

<script setup>
definePageMeta({
  title: 'Уведомления',
});
useSeoMeta({
  title: 'Уведомления',
});

const { $api } = useNuxtApp();
const notifications = ref([]);

const getNotifications = async () => {
  notifications.value = await $api.getNotifications();
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleString();
};
const userStore = useUserStore();

onMounted(() => {
  if (!userStore.profile) {
    navigateTo("/");
  }
  getNotifications();
});
</script>

<style scoped>
.v-card {
  margin-top: 20px;
}
</style>
