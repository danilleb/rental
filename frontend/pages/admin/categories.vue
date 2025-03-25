<template>
  <v-container>
    <v-card class="pa-4">
      <v-card-title>Категории</v-card-title>

      <v-list>
        <template v-for="category in categories" :key="category.id">
          <v-list-item :style="{ paddingLeft: `${category.level * 20}px` }">
            <div class="category-row">
              <div class="category-info">
                {{ category.name }}
              </div>
              <div v-if="userStore.profile?.role === 'admin'" class="actions">
                <v-btn icon size="x-small" @click="openDialog(category)">
                  <v-icon>mdi-pencil</v-icon>
                </v-btn>
                <v-btn
                  icon
                  color="error"
                  size="x-small"
                  @click="deleteCategory(category.id)"
                >
                  <v-icon>mdi-delete</v-icon>
                </v-btn>
              </div>
            </div>
          </v-list-item>
        </template>
      </v-list>

      <v-btn  v-if="userStore.profile?.role === 'admin'" color="primary" @click="openDialog(null)"
        >Добавить категорию</v-btn
      >
    </v-card>

    <v-dialog v-model="dialog" max-width="500px">
      <v-card>
        <v-card-title>
          {{ editingItem ? "Редактировать" : "Добавить" }} категорию
        </v-card-title>
        <v-card-text>
          <v-text-field
            v-model="form.name"
            label="Название"
            required
          ></v-text-field>
          <v-text-field
            v-model="form.description"
            label="Описание"
            required
          ></v-text-field>
          <v-select
            v-model="form.parent_id"
            :items="flattenCategories(categories)"
            label="Родительская категория"
            item-title="name"
            item-value="id"
            clearable
          ></v-select>
        </v-card-text>
        <v-card-actions v-if="userStore.profile.role === 'admin'">
          <v-btn @click="saveCategory" color="primary">Сохранить</v-btn>
          <v-btn @click="dialog = false">Отмена</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>
  
  <script setup>
const userStore = useUserStore();
const dataStore = useDataStore();
const { $api } = useNuxtApp();

const categories = computed(() => buildCategoryList(dataStore.categories));

const buildCategoryList = (categories, level = 0) => {
  return categories.reduce((acc, category) => {
    acc.push({ ...category, level });
    if (category.children && category.children.length) {
      acc.push(...buildCategoryList(category.children, level + 1));
    }
    return acc;
  }, []);
};

const dialog = ref(false);
const editingItem = ref(null);
const form = ref({ name: "", description: "", parent_id: null });

const flattenCategories = (categories, list = []) => {
  categories.forEach((cat) => {
    list.push({ id: cat.id, name: cat.name });
  });
  return list;
};

const openDialog = (item) => {
  editingItem.value = item;
  form.value = item
    ? { ...item }
    : { name: "", description: "", parent_id: null };
  dialog.value = true;
};

const saveCategory = async () => {
  if (editingItem.value) {
    await $api.editCategories(form.value.id, form.value);
    await dataStore.getCategories();
    alert("Обновлено");
  } else {
    await $api.createCategories(form.value);
    await dataStore.getCategories();
    alert("Добавлено");
  }
  dialog.value = false;
};

const deleteCategory = async (id) => {
  await $api.deleteCategories(id);
  await dataStore.getCategories();
  alert("Удалено");
};

onMounted(() => {
  if (!userStore.profile || userStore.profile?.role === "client") {
    navigateTo("/");
  }
});
</script>
  
  <style>
.category-row {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
}
.category-info {
  flex: 1;
}
.actions {
  display: flex;
  gap: 4px;
}
</style>
  