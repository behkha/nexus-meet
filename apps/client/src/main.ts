import { createApp } from "vue";
import { createPinia } from "pinia";
import router from "#/router";
import "./style.css";
import App from "./App.vue";
import googleLogin from "vue3-google-login";
import { useAuthStore } from "./stores/auth";
import { configureAPI } from "./services/index.service";

const app = createApp(App);
app.use(createPinia());
app.use(router);
app.use(googleLogin, {
  clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
});

const authStore = useAuthStore();

configureAPI({
  getToken: () => authStore.accessToken,
  refreshToken: authStore.refreshAccessToken,
});

await router.isReady();
app.mount("#app");
