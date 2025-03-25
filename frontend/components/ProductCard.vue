<template>
  <div class="product-card-container">
    <nuxt-link 
      class="product-card-link" 
      :to="`/inventory/${product.id}`"
    >
      <v-card class="product-card" elevation="1">
        <v-img
          :src="`${config.public.apiBase}/files/${product.images?.[0]}`"
          height="200px"
          cover
          class="product-image"
          :lazy-src="getPlaceholder(product.images?.[0])"
        >
          <template #error>
            <div class="placeholder">Нет изображения</div>
          </template>
        </v-img>

        <v-card-title class="product-title">
          {{ product.name }}
        </v-card-title>

        <v-card-subtitle class="product-price">
          {{ formatPrice(product.price_per_day) }} / день
        </v-card-subtitle>
      </v-card>
    </nuxt-link>
    <div v-if="$slots.actions" class="actions-container">
      <slot name="actions"></slot>
    </div>
  </div>
</template>

<script setup>
const config = useRuntimeConfig()
const props = defineProps({
  product: {
    type: Object,
    required: true,
  },
});

const formatPrice = (price) => {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    minimumFractionDigits: 0,
  }).format(price);
};

const getPlaceholder = (image) => {
  return `${config.public.apiBase}/files/${image}` || "/images/no-image-placeholder.jpg";
};
</script>

<style scoped>
.product-card-container {
  position: relative; /* Позиционируем контейнер для управления иконками */
  width: 300px;
}

.product-card-link {
  display: block;
  text-decoration: none;
  color: inherit;
}

.product-card {
  border-radius: 12px;
  overflow: hidden;
  transition: transform 0.2s ease-in-out;
  padding-bottom: 16px;
}

.product-card:hover {
  transform: scale(1.03);
}

.product-image {
  border-bottom: 1px solid #e0e0e0;
}

.product-title {
  font-weight: 600;
}

.product-price {
  font-weight: 500;
  color: #4caf50;
}

.placeholder {
  display: flex;
  height: 100%;
  align-items: center;
  justify-content: center;
  background-color: #e0e0e0;
  color: #757575;
}

.actions-container {
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 8px;
  padding: 4px;
  width: 60px;
}
</style>
