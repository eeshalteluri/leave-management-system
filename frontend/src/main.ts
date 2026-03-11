import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router";
import "./style.css";
import { useThemeStore } from "./store/theme";

const app = createApp(App);
const pinia = createPinia();
app.use(pinia).use(router);

// Apply saved theme before first render to avoid flash
useThemeStore();

app.mount("#app");