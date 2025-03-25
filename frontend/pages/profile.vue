<template>
  <v-container>
    <v-card max-width="500" class="mx-auto pa-4">
      <v-card-title>Профиль пользователя</v-card-title>
      <v-card-text>
        <v-simple-table>
          <template v-slot:default>
            <tbody>
              <tr>
                <td><strong>ID:</strong></td>
                <td>{{ userStore.profile.id }}</td>
              </tr>
              <tr>
                <td><strong>Имя:</strong></td>
                <td>{{ userStore.profile.name }}</td>
              </tr>
              <tr>
                <td><strong>Email:</strong></td>
                <td>{{ userStore.profile.email }}</td>
              </tr>
              <tr>
                <td><strong>Роль:</strong></td>
                <td>{{ roleLabel }}</td>
              </tr>
            </tbody>
          </template>
        </v-simple-table>
      </v-card-text>
      <v-card-actions>
        <v-btn block color="secondary" @click="logout">Выйти</v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script setup>
import { computed, onMounted } from 'vue';
definePageMeta({
  title: 'Профиль',
});
useSeoMeta({
  title: 'Профиль',
});

const userStore = useUserStore();

const roleLabel = computed(() => {
  const role = userStore.profile?.role;
  switch (role) {
    case 'client':
      return 'Клиент';
    case 'manager':
      return 'Менеджер';
    case 'admin':
      return 'Администратор';
    default:
      return role;
  }
});

const logout = () => {
  localStorage.removeItem('Bearer');
  userStore.profile = null;
  navigateTo('/');
};

onMounted(() => {
  if (!userStore.profile) {
    navigateTo('/login');
  }
});
</script>

<style scoped>
</style>
