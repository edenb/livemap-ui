import { computed, ref } from "vue";
import { io } from "socket.io-client";

const defaults = { connection: "http://localhost:3000", options: {} };

export default {
  install: (app, { connection, options }) => {
    let isConnected = ref(false);
    let positionUpdate = ref("");
    let socketioConf = {
      ...defaults,
      ...{ connection, options },
    };
    const socketio = io(socketioConf.connection, socketioConf.options);

    socketio.on("connect", () => {
      isConnected.value = true;
    });
    socketio.on("connect_error", () => {
      // If the connection is denied by the server
      isConnected.value = false;
    });
    socketio.on("disconnect", () => {
      isConnected.value = false;
    });
    socketio.on("positionUpdate", (data) => {
      positionUpdate.value = data;
    });

    const connect = function () {
      if (!isConnected.value) {
        socketio.open();
      }
    };
    const disconnect = function () {
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
