import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router";

import vue3videoPlay from 'vue3-video-play' // 引入组件
import Chat from 'vue3-beautiful-chat'
import 'vue3-video-play/dist/style.css' // 引入css

// Nucleo Icons
import "./assets/css/nucleo-icons.css";
import "./assets/css/nucleo-svg.css";

import materialKit from "./material-kit";

const app = createApp(App);

app.use(createPinia());
app.use(router)
app.use(vue3videoPlay)
app.use(materialKit);
app.use(Chat);
app.mount("#app");
