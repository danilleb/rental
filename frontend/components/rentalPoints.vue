<template>
  <v-container>
    <v-data-table
      :headers="headers"
      :items="rentalPoints"
      item-value="id"
      class="elevation-1"
    >
      <template v-slot:top>
        <v-toolbar flat>
          <v-toolbar-title>Пункты проката</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn
            v-if="userStore.profile?.role === 'admin'"
            color="primary"
            @click="openDialog(null)"
            >Добавить</v-btn
          >
        </v-toolbar>
      </template>

      <template v-slot:[`item.actions`]="{ item }">
        <v-btn
          v-if="['admin', 'manager'].includes(userStore.profile?.role)"
          icon
          @click="openDialog(item)"
          ><v-icon>mdi-pencil</v-icon></v-btn
        >
        <v-btn
          v-if="userStore.profile?.role === 'admin'"
          icon
          color="error"
          @click="deleteRentalPoint(item.id)"
          ><v-icon>mdi-delete</v-icon></v-btn
        >
      </template>
    </v-data-table>

    <v-dialog v-model="dialog" max-width="500px">
      <v-card>
        <v-card-title
          >{{ editingItem ? "Редактировать" : "Добавить" }} пункт
          проката</v-card-title
        >
        <v-card-text>
          <v-text-field
            v-model="form.name"
            label="Название"
            required
          ></v-text-field>
          <v-text-field
            v-model="form.address"
            label="Адрес"
            required
          ></v-text-field>
          <v-text-field
            v-model="form.contact_info"
            label="Контактная информация"
            required
          ></v-text-field>
          <v-text-field
            v-model="form.working_hours"
            label="Часы работы"
            required
          ></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-btn @click="saveRentalPoint" color="primary">Сохранить</v-btn>
          <v-btn @click="dialog = false">Отмена</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>
    
    <script setup>
const userStore = useUserStore();
const dataStore = useDataStore();
import { ref } from "vue";
const { $api } = useNuxtApp();

definePageMeta({
  title: "Пункты проката",
});

const headers = computed(() => {
  const values = [
    { title: "Название", key: "name" },
    { title: "Адрес", key: "address" },
    { title: "Контактная информация", key: "contact_info" },
    { title: "Часы работы", key: "working_hours" }
  ]
  if (['admin', 'manager'].includes(userStore.profile?.role)) {
    values.push({ title: "Действия", key: "actions", sortable: false })
  }
  return values
});

const rentalPoints = computed(() => {
  return dataStore.rentalPoints;
});
const dialog = ref(false);
const editingItem = ref(null);
const form = ref({
  name: "",
  address: "",
  contact_info: "",
  working_hours: "",
});

const openDialog = (item) => {
  editingItem.value = item;
  form.value = item
    ? { ...item }
    : { name: "", address: "", contact_info: "", working_hours: "" };
  dialog.value = true;
};

const saveRentalPoint = async () => {
  if (editingItem.value) {
    await $api.editRentalPoint(form.value.id, form.value);
    await dataStore.getRentalPoints();
    alert("Обновлено");
  } else {
    await $api.createRentalPoint(form.value);
    await dataStore.getRentalPoints();
    alert("Добавлено");
  }
  dialog.value = false;
};

const deleteRentalPoint = async (id) => {
  await $api.deleteRentalPoint(id);
  await dataStore.getRentalPoints();
  alert("Удалено");
};
</script>
    