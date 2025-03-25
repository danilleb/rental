<template>
  <v-container fluid class="page-container">
    <div v-if="pending" class="loading">
      <v-progress-circular indeterminate color="primary" size="50" />
      Загрузка данных...
    </div>

    <div v-else-if="error" class="error">
      <v-alert type="error" variant="outlined">
        Ошибка при загрузке данных
      </v-alert>
    </div>

    <!-- Описание товара -->
    <v-card v-else-if="data" class="product-card" flat>
      <v-card-title class="product-title">{{ data?.name }}</v-card-title>

      <v-carousel
        v-if="data?.images && data?.images.length"
        hide-delimiters
        class="product-carousel"
      >
        <v-carousel-item
          v-for="(image, index) in data.images"
          :key="index"
          :src="`${config.public.apiBase}/files/${image}`"
          cover
        />
      </v-carousel>

      <div v-else class="no-image-placeholder">Нет изображения</div>

      <v-card-text>
        <v-list>
          <v-list-item>
            <v-list-item-title>📄 Описание</v-list-item-title>
            <v-list-item-subtitle v-html="renderedDescription" class="multiline" />
          </v-list-item>

          <v-list-item>
            <v-list-item-title>⚙️ Спецификации</v-list-item-title>
            <v-list-item-subtitle v-html="renderedSpecifications" class="multiline" />
          </v-list-item>

          <v-list-item>
            <v-list-item-title>📏 Размер</v-list-item-title>
            <v-list-item-subtitle>
              {{ data.size || "Нет данных" }}
            </v-list-item-subtitle>
          </v-list-item>

          <v-list-item>
            <v-list-item-title>📋 Правила использования</v-list-item-title>
            <v-list-item-subtitle v-html="renderedUsageRules" class="multiline" />
          </v-list-item>

          <v-list-item>
            <v-list-item-title>💰 Цена за сутки</v-list-item-title>
            <v-list-item-subtitle>
              {{ formatPrice(data.price_per_day) }}
            </v-list-item-subtitle>
          </v-list-item>
        </v-list>
      </v-card-text>
    </v-card>

    <!-- Пункт проката и даты -->
    <v-card v-if="userStore.profile" class="pa-5 mt-4">
      <v-card-title class="text-h6">Выберите пункт проката</v-card-title>

      <v-list>
        <v-list-item
          v-for="point in rentalPoints"
          :key="point.id"
          @click="selectPoint(point)"
          :class="{ 
            'bg-primary text-white': selectedPoint?.id === point.id, 
            'text-grey': point.available_quantity === 0
          }"
          :disabled="point.available_quantity === 0"
        >
          <v-list-item-title>{{ point.name }}</v-list-item-title>
          <v-list-item-subtitle>
            Наличие: {{ point.available_quantity }}
          </v-list-item-subtitle>
        </v-list-item>
      </v-list>

      <v-divider class="my-4" />

      <v-row>
        <v-col cols="12" md="6">
          <v-text-field
            v-model="pickupDateTime"
            label="Дата и время забора"
            type="datetime-local"
            :min="minDateTime"
            @input="validateReturnDate"
          />
        </v-col>

        <v-col cols="12" md="6">
          <v-text-field
            v-model="returnDateTime"
            label="Дата и время возврата"
            type="datetime-local"
            :min="pickupDateTime"
            @input="calculatePrice"
          />
        </v-col>
      </v-row>

      <v-btn
        class="mt-4"
        color="primary"
        block
        :disabled="!selectedPoint || !pickupDateTime || !returnDateTime || totalPrice === null"
        @click="confirmRental"
      >
        {{ buttonText }}
      </v-btn>
    </v-card>
    <v-card v-else class="pa-5 mt-4">
      <v-card-title class="text-h6">Авторизуйтесь что бы арендовать</v-card-title>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import MarkdownIt from 'markdown-it';
import { useRoute } from "vue-router";

const userStore = useUserStore();
const config = useRuntimeConfig();
const dataStore = useDataStore();
const { $api } = useNuxtApp();

const route = useRoute();
const paramID = computed(() => route.params.id);

const { data, pending, error } = await useAsyncData(
  `inventory-${paramID.value}`,
  () => (paramID.value ? $api.getInventory(paramID.value) : null),
  { watch: [paramID] }
);

definePageMeta({ title: "Карточка товара" });
useSeoMeta({ title: "Карточка товара" });

const formatPrice = (price) => {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    minimumFractionDigits: 0,
  }).format(price);
};

const rentalPoints = ref([]);
const selectedPoint = ref(null);

const pickupDateTime = ref('');
const returnDateTime = ref('');
const minDateTime = ref('');

const totalPrice = ref(null);
const buttonText = ref('Арендовать');

// Инициализация markdown-it
const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
});

// Вычисляемые свойства для рендеринга Markdown
const renderedDescription = computed(() =>
  data.value && data.value.description ? md.render(data.value.description) : "Нет описания"
);

const renderedSpecifications = computed(() =>
  data.value && data.value.specifications ? md.render(data.value.specifications) : "Нет информации"
);

const renderedUsageRules = computed(() =>
  data.value && data.value.usage_rules ? md.render(data.value.usage_rules) : "Нет данных"
);

// Автоматическое выставление минимальной даты (сегодня + ближайший час)
const setDefaultDates = () => {
  const now = new Date();
  now.setMinutes(0, 0, 0);
  const defaultPickupDateTime = now.toISOString().slice(0, 16);

  pickupDateTime.value = defaultPickupDateTime;
  returnDateTime.value = defaultPickupDateTime;
  minDateTime.value = defaultPickupDateTime;
};

const availability = async () => {
  const res = await $api.availabilityInventory(data.value.id);
  const result = [];
  for (const el of res) {
    const rentalPoint = dataStore.rentalPoints.find(
      (e) => e.id === el.rental_point_id
    );
    result.push({ ...el, name: rentalPoint.name });
  }
  rentalPoints.value = result;
};

const selectPoint = (point) => {
  if (point.available_quantity > 0) {
    selectedPoint.value = point;
    calculatePrice();
  }
};

const calculatePrice = () => {
  const pickupDate = new Date(pickupDateTime.value);
  const returnDate = new Date(returnDateTime.value);

  if (isNaN(pickupDate) || isNaN(returnDate) || pickupDate >= returnDate) {
    totalPrice.value = null;
    buttonText.value = 'Арендовать';
    return;
  }

  const diffTime = Math.abs(returnDate - pickupDate);
  const diffHours = diffTime / (1000 * 60 * 60);

  const totalDays = Math.ceil(diffHours / 24);
  totalPrice.value = totalDays * data.value.price_per_day;

  buttonText.value = `Арендовать за ${formatPrice(totalPrice.value)}`;
};

const confirmRental = async () => {
  const bookingData = {
    inventory_id: selectedPoint.value.inventory_id,
    rental_point_id: selectedPoint.value.rental_point_id,
    datePickup: pickupDateTime.value,
    dateReturn: returnDateTime.value,
    price: totalPrice.value,
    user_id: userStore.profile.id
  }
  const res = await $api.createBooking(bookingData)
  if (res) {
    alert('Заявка создана, отслеживайте в "Мои бронирования"')
  }
};

const validateReturnDate = () => {
  if (new Date(returnDateTime.value) < new Date(pickupDateTime.value)) {
    returnDateTime.value = pickupDateTime.value;
  }
};

onMounted(() => {
  setDefaultDates();
  availability().then(() => {}).catch(() => {});
});
</script>

<style scoped>
.page-container {
  padding: 0 !important;
}

.product-card {
  width: 100%;
  padding: 20px;
  box-shadow: none;
  border: none;
  background-color: transparent;
}

.text-grey {
  color: #9e9e9e !important;
}

/* Обновлённый класс для переноса строк с блоковым отображением */
.multiline {
  display: block !important;
  white-space: pre-wrap !important;
  overflow: visible !important;
  text-overflow: clip !important;
  word-break: break-word;
}
</style>
