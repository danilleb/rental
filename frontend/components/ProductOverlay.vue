<template>
  <v-dialog v-model="dialog" max-width="600">
    <template #default>
      <v-card>
        <v-card-title>
          <span class="headline"
            >{{ isEdit ? "Редактирование" : "Создание" }} товара</span
          >
        </v-card-title>
        <v-card-text>
          <v-form ref="form" v-model="formValid">
            <!-- Название -->
            <v-text-field
              v-model="formData.name"
              label="Название"
              :rules="[rules.required]"
            />

            <!-- Описание -->
            <v-textarea v-model="formData.description" label="Описание" />

            <!-- Спецификация -->
            <v-textarea
              v-model="formData.specifications"
              label="Спецификация"
            />

            <!-- Размер -->
            <v-text-field v-model="formData.size" label="Размер" />

            <!-- Правила использования -->
            <v-textarea
              v-model="formData.usage_rules"
              label="Правила использования"
            />

            <!-- Категория -->
            <v-select
              v-model="formData.category_id"
              :items="categories"
              label="Категория"
              variant="outlined"
              density="comfortable"
              item-title="name"
              item-value="id"
              clearable
              hide-details
              class="mb-4"
            />

            <!-- Пункты проката -->
            <v-select
              v-model="formData.rental_point_ids"
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
              class="mb-4"
            />

            <!-- Блок наличия по выбранным пунктам проката -->
            <div
              v-if="
                formData.rental_point_ids && formData.rental_point_ids.length
              "
              class="mb-4"
            >
              <h3>Наличие по выбранным пунктам проката:</h3>
              <v-list dense>
                <v-list-item v-for="id in formData.rental_point_ids" :key="id">
                  <v-list-item-title>{{
                    getRentalPointName(id)
                  }}</v-list-item-title>
                  <v-list-item-action>
                    <v-text-field
                      v-model.number="formData.rental_point_quantities[id]"
                      type="number"
                      label="Кол-во"
                      hide-details
                      class="w-25"
                    />
                  </v-list-item-action>
                </v-list-item>
              </v-list>
            </div>

            <!-- Изображения -->
            <v-file-input
              v-model="formData.images"
              label="Изображения"
              multiple
              show-size
              accept="image/*"
            />

            <!-- Цена за день -->
            <v-text-field
              v-model="formData.price_per_day"
              label="Цена за день"
              :rules="[rules.required, rules.numeric]"
              prefix="₽"
            />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="handleCancel">Отмена</v-btn>
          <v-btn color="primary" :disabled="!formValid" @click="handleSave">
            {{ isEdit ? "Сохранить" : "Создать" }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </template>
  </v-dialog>
</template>

<script setup>
import { ref, reactive, computed, watch } from "vue";

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  data: {
    type: Object,
    default: () => ({
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
    }),
  },
  categories: {
    type: Array,
    default: () => [],
  },
  rentalPoints: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(["close", "save"]);

const dialog = ref(props.modelValue);
const formValid = ref(false);
const form = ref(null);
const formData = reactive(JSON.parse(JSON.stringify(props.data)));


watch(
  () => props.modelValue,
  (val) => {
    dialog.value = val;
  }
);
watch(dialog, (val) => {
  emit("close", val);
  if (!val) resetForm();
});
watch(
  () => props.data,
  (newData) => {
    Object.assign(formData, newData);
  },
  { deep: true }
);

const isEdit = computed(() => !!props.data.name);

const rules = {
  required: (value) => !!value || "Обязательное поле",
  numeric: (value) => !isNaN(parseFloat(value)) || "Должно быть числовым",
};

function resetForm() {
  Object.assign(formData, {
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
  if (form.value) {
    form.value.resetValidation();
  }
}

function handleSave() {
  if (form.value && form.value.validate()) {
    emit("save", formData);
  }
}

function handleCancel() {
  dialog.value = false;
}

function getRentalPointName(id) {
  const point = props.rentalPoints.find((point) => point.id === id);
  return point ? point.name : id;
}
</script>

<style scoped>
.headline {
  font-size: 1.25rem;
  font-weight: bold;
}

.mb-4 {
  margin-bottom: 1rem;
}

.w-25 {
  width: 25%;
}
</style>
