<template>
  <v-container class="fill-height d-flex align-center justify-center">
    <v-card class="pa-5" width="400">
      <v-card-title class="text-center">Авторизация</v-card-title>
      <v-card-text>
        <v-form ref="form" v-model="valid" @submit.prevent="submitForm">
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

          <v-btn
            :disabled="!valid"
            type="submit"
            block
            color="primary"
            class="mt-4"
          >
            Войти
          </v-btn>
          <nuxt-link :to="'/register'">
            <v-btn
              type="submit"
              block
              color="primary"
              class="mt-4"
            >
              Регистрация
            </v-btn>
          </nuxt-link>
        </v-form>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup>
definePageMeta({
  title: "Авторизация",
});
useSeoMeta({
  title: "Авторизация",
});

const userStore = useUserStore();
const email = ref("");
const password = ref("");
const valid = ref(false);

const emailRules = [
  (v) => !!v || "Введите email",
  (v) => /.+@.+\..+/.test(v) || "Введите корректный email",
];

const passwordRules = [
  (v) => !!v || "Введите пароль",
  (v) => v.length >= 6 || "Пароль должен содержать не менее 6 символов",
];

const submitForm = async () => {
  if (valid.value) {
    const result = await userStore.login({
      email: email.value,
      password: password.value,
    });
    if (result) {
      navigateTo("/profile");
    } else {
      alert('Неправильный логин/пароль')
    }
  }
};

onMounted(() => {
  if (userStore.profile) {
    navigateTo("/profile");
  }
});
</script>