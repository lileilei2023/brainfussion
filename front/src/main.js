import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router";

import hljs from 'highlight.js';
import 'highlight.js/styles/atom-one-dark.css' //样式
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import VuePdf from 'vue3-pdfjs'

import * as ElementPlusIconsVue from '@element-plus/icons-vue'

import vue3videoPlay from 'vue3-video-play' // 引入组件
import Chat from 'vue3-beautiful-chat'
import 'vue3-video-play/dist/style.css' // 引入css

// Nucleo Icons
import "./assets/css/nucleo-icons.css";
import "./assets/css/nucleo-svg.css";

import materialKit from "./material-kit";

const app = createApp(App);
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}
app.directive('highlight', function(el) {
    let blocks = el.querySelectorAll('pre code');
    blocks.forEach((block) => {
        hljs.highlightBlock(block)
    })
})

app.use(createPinia());
app.use(router)
app.use(vue3videoPlay)
app.use(VuePdf)
app.use(materialKit);
app.use(Chat);
app.use(ElementPlus);
app.mount("#app");
