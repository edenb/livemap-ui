import { computed, ref } from "vue";
import { io } from "socket.io-client";

const defaults = { connection: "http://localhost:3000", options: {} };

export default {
  install: (app, { connection, options }) => {
    let isConnected = ref(false);
    let positionUpdate = ref("");
    let token = null;
    let socketioConf = {
      ...defaults,
      ...{ connection, options },
    };
    const socketio = io(socketioConf.connection, socketioConf.options);

    socketio.on("connect", () => {
      isConnected.value = true;
    });
    socketio.on("disconnect", () => {
      isConnected.value = false;
    });
    socketio.on("authenticate", () => {
      socketio.emit("token", token);
    });
    socketio.on("positionUpdate", (data) => {
      positionUpdate.value = data;
    });

    const connect = function (newToken) {
      token = newToken;
      if (!isConnected.value) {
        socketio.open();
      }
    };
    const disconnect = function () {
      token = null;
      socketio.close();
    };

    app.provide("connect", connect);
    app.provide("disconnect", disconnect);
    app.provide(
      "isConnected",
      computed(() => isConnected.value),
    );
    app.provide(
      "positionUpdate",
      computed(() => positionUpdate.value),
    );
  },
};
