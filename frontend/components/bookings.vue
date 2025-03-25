<template>
  <v-container>
    <v-card>
      <v-card-title class="text-h6">Список бронирований</v-card-title>

      <v-data-table
        v-model:items-per-page="itemsPerPage"
        :headers="computedHeaders"
        :items="filteredBookings"
        :search="search"
        item-value="id"
        class="elevation-1"
      >
        <template v-slot:top>
          <v-toolbar flat>
            <v-toolbar-title>Бронирования</v-toolbar-title>
            <v-spacer></v-spacer>
            <!-- Показывать поиск только для админа -->
            <template v-if="props.isAdmin">
              <v-text-field
                v-model="search"
                label="Поиск по имени"
                density="compact"
                hide-details
                prepend-inner-icon="mdi-magnify"
              />
            </template>
            <v-select
              v-model="filterStatus"
              label="Фильтр по статусу"
              :items="statusOptions"
              item-title="label"
              item-value="value"
              density="compact"
              hide-details
              clearable
              style="min-width: 200px"
            />
            <v-btn color="primary" @click="getBookings">Обновить все</v-btn>
          </v-toolbar>
        </template>

        <!-- Сумма -->
        <template v-slot:item.total_amount="{ item }">
          <template v-if="props.isAdmin">
            <v-text-field
              v-model="item.total_amount"
              type="number"
              density="compact"
              hide-details
              :style="{ minWidth: '200px' }"
              @update:modelValue="markAsChanged(item)"
            />
          </template>
          <template v-else>
            <span>{{ item.total_amount }}</span>
          </template>
        </template>

        <!-- Статус -->
        <template v-slot:item.status="{ item }">
          <template v-if="props.isAdmin">
            <v-select
              v-model="item.status"
              :items="statusOptions"
              item-title="label"
              item-value="value"
              density="compact"
              hide-details
              :style="{ minWidth: '200px' }"
              @update:modelValue="markAsChanged(item)"
            />
          </template>
          <template v-else>
            <span>{{ getStatusLabel(item.status) }}</span>
          </template>
        </template>

        <!-- Дата получения -->
        <template v-slot:item.pickup_datetime="{ item }">
          {{ formatDate(item.pickup_datetime) }}
        </template>

        <!-- Дата возврата -->
        <template v-slot:item.return_datetime="{ item }">
          {{ formatDate(item.return_datetime) }}
        </template>

        <!-- Дата отмены -->
        <template v-slot:item.cancellation_deadline="{ item }">
          <template v-if="props.isAdmin">
            <v-menu
              v-model="item.menu"
              :close-on-content-click="false"
              transition="scale-transition"
              offset-y
            >
              <template v-slot:activator="{ props: menuProps }">
                <v-text-field
                  v-model="item.cancellation_deadline_display"
                  v-bind="menuProps"
                  density="compact"
                  hide-details
                  readonly
                  :style="{ minWidth: '200px' }"
                  @click="item.menu = true"
                />
              </template>

              <v-card>
                <v-date-picker
                  v-model="item.cancellation_deadline_date"
                  @update:modelValue="combineDateTime(item)"
                />
                <v-text-field
                  v-model="item.cancellation_deadline_time"
                  label="Время"
                  type="time"
                  density="compact"
                  hide-details
                  @update:modelValue="combineDateTime(item)"
                />
                <v-card-actions>
                  <v-btn text @click="item.menu = false">OK</v-btn>
                </v-card-actions>
              </v-card>
            </v-menu>
          </template>
          <template v-else>
            <span>{{ item.cancellation_deadline_display }}</span>
          </template>
        </template>

        <!-- Действия -->
        <template v-slot:item.actions="{ item }">
          <template v-if="props.isAdmin">
            <v-btn
              v-if="item.changed"
              color="success"
              @click="updateBooking(item)"
              density="compact"
            >
              Обновить
            </v-btn>
          </template>
          <template v-else>
            <v-btn
              v-if="canCancel(item) && item.status !== 'cancelled'"
              color="error"
              @click="cancelBooking(item)"
              density="compact"
            >
              Отменить
            </v-btn>
          </template>
        </template>
      </v-data-table>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useNuxtApp } from "#app";

const props = defineProps({
  isAdmin: {
    type: Boolean,
    default: false,
  },
});

const { $api } = useNuxtApp();
const bookings = ref([]);
const search = ref("");
const filterStatus = ref(null);
const itemsPerPage = ref(10);

const headers = [
  { title: "Номер", key: "id", sortable: false },
  { title: "Имя пользователя", key: "user_name", sortable: false },
  { title: "Email", key: "user_email", sortable: false },
  { title: "Дата получения", key: "pickup_datetime", sortable: false },
  { title: "Дата возврата", key: "return_datetime", sortable: false },
  { title: "Статус", key: "status", sortable: false },
  { title: "Сумма", key: "total_amount", sortable: false },
  { title: "Дата отмены", key: "cancellation_deadline", sortable: false },
  { title: "Прокат", key: "rental_point_name", sortable: false },
  { title: "Действия", key: "actions" },
];

const computedHeaders = computed(() => {
  if (props.isAdmin) {
    return headers;
  } else {
    return headers.filter(
      (header) => !["user_name", "user_email"].includes(header.key)
    );
  }
});

const statusOptions = [
  { label: "В ожидании", value: "pending" },
  { label: "Подтверждено", value: "confirmed" },
  { label: "Отменено", value: "cancelled" },
  { label: "Завершено", value: "completed" },
];

const getStatusLabel = (statusValue) => {
  const option = statusOptions.find((opt) => opt.value === statusValue);
  return option ? option.label : statusValue;
};

const getBookings = async () => {
  const res = await $api.getBookings();
  if (res) {
    bookings.value = res.map((item) => ({
      ...item,
      menu: false,
      cancellation_deadline_display: formatDate(item.cancellation_deadline),
      cancellation_deadline_date: item.cancellation_deadline
        ? item.cancellation_deadline.split("T")[0]
        : null,
      cancellation_deadline_time: item.cancellation_deadline
        ? item.cancellation_deadline.split("T")[1].substring(0, 5)
        : null,
      changed: false,
    }));
  }
};

const markAsChanged = (item) => {
  item.changed = true;
};

const combineDateTime = (item) => {
  if (item.cancellation_deadline_date && item.cancellation_deadline_time) {
    const hour = item.cancellation_deadline_time.split(":")[0];
    item.cancellation_deadline_display = `${formatDate(
      item.cancellation_deadline_date
    )} ${hour}:00`;
    markAsChanged(item);
  }
};

const updateBooking = async (item) => {
  let payload = {
    user_id: item.user_id,
    inventory_id: item.inventory_id,
    datePickup: item.pickup_datetime,
    dateReturn: item.return_datetime,
    rental_point_id: item.rental_point_id,
    status: item.status,
  };
  if (props.isAdmin) {
    payload.price = item.total_amount;
    payload.cancellation_deadline =
      item.cancellation_deadline_date && item.cancellation_deadline_time
        ? `${item.cancellation_deadline_date}T${item.cancellation_deadline_time.split(
            ":"
          )[0]}:00:00.000Z`
        : null;
  }
  try {
    await $api.editBooking(item.id, payload);
    item.changed = false;
    getBookings();
  } catch (error) {
    console.error("Ошибка при обновлении бронирования:", error);
  }
};

const cancelBooking = async (item) => {
  item.status = "cancelled";
  await updateBooking(item);
};

const formatDate = (dateString) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  return `${day}.${month}.${year} ${hours}:00`;
};

const canCancel = (item) => {
  if (!item.cancellation_deadline) return true;
  const deadline = new Date(item.cancellation_deadline);
  const now = new Date();
  return deadline <= now;
};

const filteredBookings = computed(() => {
  return bookings.value.filter(
    (item) =>
      (!filterStatus.value || item.status === filterStatus.value) &&
      (!search.value ||
        item.user_name.toLowerCase().includes(search.value.toLowerCase()))
  );
});

onMounted(() => {
  getBookings();
});
</script>

<style scoped>
.v-data-table {
  max-width: 100%;
}
</style>
