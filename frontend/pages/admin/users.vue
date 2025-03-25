<template>
  <v-container>
    <v-card>
      <v-card-title>Пользователи</v-card-title>
      <v-data-table
        :headers="computedHeaders"
        :items="filteredUsers"
        item-value="id"
        class="elevation-1"
      >
        <!-- Верхняя панель с фильтрами -->
        <template v-slot:top>
          <v-toolbar flat>
            <v-toolbar-title>Фильтры</v-toolbar-title>
            <v-spacer></v-spacer>
            <v-text-field
              v-model="search"
              label="Поиск по имени или email"
              density="compact"
              hide-details
              clearable
              style="max-width: 250px"
            />
            <v-select
              v-model="roleFilter"
              :items="roleOptions"
              item-title="label"
              item-value="value"
              label="Фильтр по ролям"
              density="compact"
              hide-details
              clearable
              style="max-width: 200px"
            />
          </v-toolbar>
        </template>

        <!-- Столбец "Роль" -->
        <template v-slot:item.role="{ item }">
          <div v-if="isAdmin">
            <v-select
              v-model="item.role"
              :items="roleOptions"
              item-title="label"
              item-value="value"
              density="compact"
              hide-details
              @update:modelValue="markAsChanged(item)"
            />
          </div>
          <div v-else>
            {{ getRoleLabel(item.role) }}
          </div>
        </template>

        <!-- Форматирование дат -->
        <template v-slot:item.created_at="{ item }">
          {{ formatDate(item.created_at) }}
        </template>
        <template v-slot:item.last_login="{ item }">
          {{ formatDate(item.last_login) }}
        </template>

        <!-- Столбец "Действия" (только для admin) -->
        <template v-slot:item.actions="{ item }">
          <v-btn
            v-if="item.changed && isAdmin"
            color="success"
            density="compact"
            @click="updateUser(item)"
          >
            Сохранить
          </v-btn>
        </template>
      </v-data-table>
    </v-card>
  </v-container>
</template>
  
  <script setup>
import { ref, computed, onMounted } from "vue";
import { useNuxtApp } from "#app";

const userStore = useUserStore();

definePageMeta({
  title: "Пользователи",
});
useSeoMeta({
  title: "Пользователи",
});

const { $api } = useNuxtApp();
const users = ref([]);
const search = ref("");
const roleFilter = ref(null);

const getUsers = async () => {
  const data = await $api.getUsers();
  users.value = data.map((user) => ({ ...user, changed: false }));
};

onMounted(() => {
  getUsers();
});

// Основные заголовки таблицы
const headers = [
  { title: "ID", key: "id", sortable: false },
  { title: "Имя", key: "name", sortable: false },
  { title: "Email", key: "email", sortable: false },
  { title: "Роль", key: "role", sortable: false },
  { title: "Создан", key: "created_at", sortable: false },
  { title: "Последний вход", key: "last_login", sortable: false },
  { title: "Действия", key: "actions", sortable: false },
];

// Если текущий пользователь не админ, убираем столбец "Действия"
const computedHeaders = computed(() => {
  return userStore.profile?.role === "admin"
    ? headers
    : headers.filter((h) => h.key !== "actions");
});

// Опции для ролей
const roleOptions = [
  { label: "Клиент", value: "client" },
  { label: "Менеджер", value: "manager" },
  { label: "Администратор", value: "admin" },
];

// Флаг для проверки, является ли текущий пользователь администратором
const isAdmin = computed(() => userStore.profile?.role === "admin");

// Функция для расшифровки роли
const getRoleLabel = (role) => {
  switch (role) {
    case "client":
      return "Клиент";
    case "manager":
      return "Менеджер";
    case "admin":
      return "Администратор";
    default:
      return role;
  }
};

const markAsChanged = (item) => {
  item.changed = true;
};

const updateUser = async (item) => {
  try {
    await $api.editUsers(item.id, { role: item.role });
    item.changed = false;
    getUsers();
  } catch (error) {
    console.error("Ошибка при обновлении пользователя:", error);
  }
};

const formatDate = (dateString) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleString();
};

const filteredUsers = computed(() => {
  return users.value.filter((user) => {
    const searchText = search.value.toLowerCase();
    const matchesSearch =
      user.name.toLowerCase().includes(searchText) ||
      user.email.toLowerCase().includes(searchText);
    const matchesRole = roleFilter.value
      ? user.role === roleFilter.value
      : true;
    return matchesSearch && matchesRole;
  });
});

onMounted(() => {
  if (!userStore.profile || userStore.profile?.role === "client") {
    navigateTo("/");
  }
});
</script>
  
  <style scoped>
.v-data-table {
  max-width: 100%;
}
</style>
  