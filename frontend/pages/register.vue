<template>
  <v-container class="fill-height d-flex align-center justify-center">
    <v-card class="pa-5" width="400">
      <v-card-title class="text-center">Регистрация</v-card-title>
      <v-card-text>
        <v-form ref="form" v-model="valid" @submit.prevent="submitForm">
          <v-text-field
            v-model="name"
            label="Имя"
            :rules="nameRules"
            required
            variant="outlined"
          ></v-text-field>

          <v-text-field
            v-model="email"
            label="Email"
            :rules="emailRules"
            required
            variant="outlined"
          ></v-text-field>

          <v-text-field
            v-model="password"
            label="Пароль"
            type="password"
            :rules="passwordRules"
            required
            variant="outlined"
          ></v-text-field>

          <v-text-field
            v-model="confirmPassword"
            label="Подтвердите пароль"
            type="password"
            :rules="confirmPasswordRules"
            required
            variant="outlined"
          ></v-text-field>

          <v-btn
            :disabled="!valid"
            type="submit"
            block
            color="primary"
            class="mt-4"
          >
            Зарегистрироваться
          </v-btn>

          <nuxt-link :to="'/login'">
            <v-btn
              type="button"
              block
              color="secondary"
              class="mt-4"
            >
              Уже есть аккаунт?
            </v-btn>
          </nuxt-link>
        </v-form>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup>
definePageMeta({
  title: "Регистрация",
});
useSeoMeta({
  title: "Регистрация",
});

const userStore = useUserStore();

const name = ref("");
const email = ref("");
const password = ref("");
const confirmPassword = ref("");
const valid = ref(false);

const nameRules = [
  (v) => !!v || "Введите имя",
  (v) => v.length >= 2 || "Имя должно содержать не менее 2 символов",
];

const emailRules = [
  (v) => !!v || "Введите email",
  (v) => /.+@.+\..+/.test(v) || "Введите корректный email",
];

const passwordRules = [
  (v) => !!v || "Введите пароль",
  (v) => v.length >= 6 || "Пароль должен содержать не менее 6 символов",
];

const confirmPasswordRules = [
  (v) => !!v || "Подтвердите пароль",
  (v) => v === password.value || "Пароли не совпадают",
];

const submitForm = async () => {
  if (valid.value) {
    const result = await userStore.register({
      name: name.value,
      email: email.value,
      password: password.value,
    });

    if (result) {
      navigateTo('/profile');
    } else {
      alert('Пользователь с таким email существует');
    }
  }
};

onMounted(() => {
  if (userStore.profile) {
    navigateTo("/profile");
  }
});
</script>
