<template>
  <v-container>
    <v-row>
      <v-col cols="12" md="3" class="sidebar">
        <v-card class="filter-card d-none d-md-flex">
          <div class="filter-content">
            <v-text-field
              v-model="searchQuery"
              label="Поиск"
              variant="outlined"
              density="comfortable"
              append-inner-icon="mdi-magnify"
              hide-details
            />

            <v-select
              v-model="selectedCategory"
              :items="categoriesFlat"
              label="Категория"
              variant="outlined"
              density="comfortable"
              item-title="name"
              item-value="id"
              clearable
              hide-details
            />

            <v-select
              v-model="selectedRentalPoints"
              :items="rentalPoints"
              label="Пункты проката"
              variant="outlined"
              density="comfortable"
              item-title="name"
              item-value="id"
              multiple
              clearable
              chips
              closable-chips
              hide-details
            />

            <v-select
              v-model="selectedSizesInventory"
              :items="sizesInventory"
              label="Размеры"
              variant="outlined"
              density="comfortable"
              item-title="name"
              item-value="id"
              multiple
              clearable
              chips
              hide-details
            />

            <v-card class="sort-card" variant="plain">
              <div class="sort-content">
                <v-select
                  v-model="selectedSort"
                  :items="sortOptions"
                  label="Сортировать по"
                  variant="outlined"
                  density="comfortable"
                  hide-details
                  class="sort-select"
                />
                <v-btn
                  :icon="
                    sortDirection === 'asc'
                      ? 'mdi-sort-ascending'
                      : 'mdi-sort-descending'
                  "
                  @click="toggleSortDirection"
                  variant="text"
                  density="comfortable"
                  class="sort-toggle"
                />
              </div>
            </v-card>

            <v-btn color="primary" block @click="applyFilter">
              Применить
            </v-btn>
          </div>
        </v-card>

        <v-expansion-panels v-model="panel" class="d-md-none">
          <v-expansion-panel value="filters">
            <v-expansion-panel-title> Фильтры </v-expansion-panel-title>
            <v-expansion-panel-text>
              <div class="filter-content">
                <v-text-field
                  v-model="searchQuery"
                  label="Поиск"
                  variant="outlined"
                  density="comfortable"
                  append-inner-icon="mdi-magnify"
                  hide-details
                />

                <v-select
                  v-model="selectedCategory"
                  :items="categoriesFlat"
                  label="Категория"
                  variant="outlined"
                  density="comfortable"
                  item-title="name"
                  item-value="id"
                  clearable
                  hide-details
                />

                <v-select
                  v-model="selectedRentalPoints"
                  :items="rentalPoints"
                  label="Пункты проката"
                  variant="outlined"
                  density="comfortable"
                  item-title="name"
                  item-value="id"
                  multiple
                  clearable
                  chips
                  closable-chips
                  hide-details
                />

                <v-card class="sort-card" variant="plain">
                  <div class="sort-content">
                    <v-select
                      v-model="selectedSort"
                      :items="sortOptions"
                      label="Сортировать по"
                      variant="outlined"
                      density="comfortable"
                      hide-details
                      class="sort-select"
                    />
                    <v-btn
                      :icon="
                        sortDirection === 'asc'
                          ? 'mdi-sort-ascending'
                          : 'mdi-sort-descending'
                      "
                      @click="toggleSortDirection"
                      variant="text"
                      density="comfortable"
                      class="sort-toggle"
                    />
                  </div>
                </v-card>

                <v-btn color="primary" block @click="applyFilter">
                  Применить
                </v-btn>
              </div>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-col>
      <v-col cols="12" md="9">
        <v-btn
          v-if="isAdmin && userStore.profile?.role === 'admin'"
          color="primary"
          block
          class="mb-4"
          @click="openOverlay = true"
        >
          Добавить инвентарь
        </v-btn>

        <v-row v-if="pending" justify="center">
          <v-progress-circular
            indeterminate
            color="primary"
            size="50"
            width="4"
          />
        </v-row>

        <v-row
          v-else-if="pending"
          justify="start"
          align="stretch"
          class="flex-wrap"
        >
          <v-col v-for="n in 6" :key="n" cols="auto" class="product-wrapper">
            <v-skeleton-loader type="image, article" class="product-skeleton" />
          </v-col>
        </v-row>

        <v-row v-else justify="start" align="stretch" class="flex-wrap">
          <v-col
            v-for="(product, index) in data"
            :key="index"
            cols="auto"
            class="product-wrapper"
          >
            <ProductCard :product="product">
              <template v-if="isAdmin" #actions>
                <v-btn icon="mdi-pencil" @click="editProduct(product)" />
                <v-btn
                  v-if="userStore.profile?.role === 'admin'"
                  icon="mdi-delete"
                  color="error"
                  @click="deleteProduct(product.id)"
                />
              </template>
            </ProductCard>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
    <ProductOverlay
      v-if="isAdmin"
      :modelValue="openOverlay"
      :categories="categoriesFlat"
      :rentalPoints="rentalPoints"
      :data="dataOverlay"
      @close="(val) => (openOverlay = val)"
      @save="save"
    />
  </v-container>
</template>
  
<script setup>
import { ref, computed, onMounted } from "vue";

const props = defineProps({
  isAdmin: {
    type: Boolean,
    default: false,
  },
});
const userStore = useUserStore();
const dataStore = useDataStore();
const { $api } = useNuxtApp();
const searchParameters = ref({
  searchTerm: "",
  categoryId: null,
  rentalPointIds: [],
  sizes: [],
  sortBy: "name",
  sortOrder: "asc",
});
const incriment = ref(0);

const { data, pending, error, refresh } = await useAsyncData(
  "searchInventory",
  () => $api.inventorySearch(searchParameters.value, !props.isAdmin),
  { watch: [searchParameters, incriment] }
);
const panel = ref(null);
const searchQuery = ref("");

const categoriesFlat = computed(() => {
  const flatList = [];
  const flattenCategories = (items, prefix = "") => {
    items.forEach((category) => {
      const categoryName = prefix
        ? `${prefix} / ${category.name}`
        : category.name;
      flatList.push({ id: category.id, name: categoryName });

      if (category.children && category.children.length) {
        flattenCategories(category.children, categoryName);
      }
    });
  };
  flattenCategories(dataStore.categories);
  return flatList;
});

const selectedCategory = ref(null);

const rentalPoints = computed(() => {
  return dataStore.rentalPoints;
});
const selectedRentalPoints = ref(null);

const sizesInventory = computed(() => {
  return dataStore.sizesInventory;
});
const selectedSizesInventory = ref(null);

const sortOptions = [
  { title: "По имени", value: "name" },
  { title: "По цене (за день)", value: "price_per_day" },
];

const selectedSort = ref("name");
const sortDirection = ref("asc");

const toggleSortDirection = () => {
  sortDirection.value = sortDirection.value === "desc" ? "asc" : "desc";
};

const applyFilter = () => {
  searchParameters.value = {
    searchTerm: searchQuery.value,
    categoryId: selectedCategory.value,
    rentalPointIds: selectedRentalPoints.value,
    sizes: selectedSizesInventory.value || [],
    sortBy: selectedSort.value,
    sortOrder: sortDirection.value,
  };
};

const openOverlay = ref(false);
const dataOverlay = ref({
  id: null,
  name: "",
  description: "",
  specifications: "",
  size: "",
  usage_rules: "",
  images: [],
  price_per_day: "",
  category_id: null,
  rental_point_ids: [],
  rental_point_quantities: {},
});
const editProduct = async (_data) => {
  const availability = await $api.availabilityInventory(_data.id);
  const rental_point_quantities = {};
  for (const el of availability) {
    rental_point_quantities[el.rental_point_id] = el.available_quantity;
  }
  dataOverlay.value = Object.assign(_data, { rental_point_quantities });
  openOverlay.value = true;
};

const save = async (_data) => {
  const urls = [];
  for (let i = 0; i < _data.images.length; i++) {
    const url =
      typeof _data.images[i] === "string"
        ? _data.images[i]
        : await $api.addFile(_data.images[i]);
    urls.push(url);
  }
  const data = Object.assign(JSON.parse(JSON.stringify(_data)), {
    images: urls,
  });
  const res = _data.id
    ? await $api.editInventory(data.id, data)
    : await $api.createInventory(data);
  if (res) {
    alert(_data.id ? "Инвентарь обновлен" : "Инвентарь добавлен");
    incriment.value = incriment.value + 1;
    openOverlay.value = false;
    await dataStore.getAllSizesInventory();
  }
};

const deleteProduct = async (id) => {
  const res = await $api.deleteInventory(id);
  if (res) {
    alert("Инвентарь удален");
    incriment.value = incriment.value + 1;
    openOverlay.value = false;
  }
};

onMounted(() => {});
</script>
  
  <style scoped>
.sidebar {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.filter-card {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  box-sizing: border-box;
}

.filter-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.v-input,
.v-btn {
  width: 100%;
}
.sort-card {
  padding: 16px 0px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent; /* Убирает фон */
}

.sort-content {
  display: flex;
  width: 100%;
  gap: 12px;
}

.sort-select {
  flex: 1;
}

.sort-toggle {
  width: 48px;
  height: 48px;
  border: none; /* Убирает границу */
  box-shadow: none; /* Убирает тень */
}
</style>
  