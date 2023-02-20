import { ref, onMounted, inject } from "vue";
//import io from "socket.io-client";

let token = null;
export function useSocketio() {
  const socketio = inject("socketio");
  const connected = ref(false);
  onMounted(() => {
    initConnection();
  });
  const setToken = (newToken) => {
    token = newToken;
    socketio.io.opts.query = socketio.io.opts.query || {};
    //socketio.io.opts.query = {};
    socketio.io.opts.query.token = token;
    console.log("Set token");
  };
  function initConnection() {
    if (socketio) {
      socketio.on("connect", () => {
        console.log("Socket ID:", socketio.id);
        connected.value = true;
      });
      socketio.on("disconnect", () => {
        connected.value = false;
      });
      connected.value = socketio.connected;
      socketio.open();
      socketio.emit("token", token);
    }
  }
  return {
    connected,
    setToken,
  };
}
