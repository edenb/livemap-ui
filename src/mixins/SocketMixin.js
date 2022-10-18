import store from "@/store.js";

export const SocketMixin = {
  created: function () {
    if (store.state.authorized) {
      this.socketAuth();
    }
  },
  methods: {
    socketAuth: socketAuth,
    socketDeAuth: socketDeAuth,
  },
  sockets: {
    connect() {
      this.$socket.client.emit("token", this.$store.state.token);
    },
    authenticate() {
      this.$socket.client.emit("token", this.$store.state.token);
    },
  },
};

function socketAuth() {
  this.$socket.client.open();
}

function socketDeAuth() {
  this.$socket.client.close();
}
