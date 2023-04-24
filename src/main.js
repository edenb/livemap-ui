import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router";
import vuetify from "./plugins/vuetify";
import { loadFonts } from "./plugins/webfontloader";
import Configuration from "@/configuration.js";
import mitt from "mitt";
import socketio from "@/plugins/socketio.js";

loadFonts();

const pinia = createPinia();
const app = createApp(App);

const emitter = mitt();
app.config.globalProperties.emitter = emitter;

const socketioConf = {
  connection: Configuration.value("envServerUrl") || "http://localhost:3000",
  options: {
    autoConnect: false,
  },
};

app
  .use(pinia)
  .use(router)
  .use(vuetify)
  .use(socketio, socketioConf)
  .mount("#app");
