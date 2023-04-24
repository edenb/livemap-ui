<template>
  <div />
</template>

<script>
import { inject } from "vue";
import { useAuthStore } from "@/store.js";
import { usePositionStore } from "@/store.js";

export default {
  name: "UserLogout",
  setup() {
    const authStore = useAuthStore();
    const disconnect = inject("disconnect");
    const positionStore = usePositionStore();
    return {
      authStore,
      disconnect,
      positionStore,
    };
  },
  created() {
    this.disconnect();
    this.authStore.revokeAuthorized();
    this.positionStore.clearLastPositions();
    this.$router.push("/");
  },
};
</script>
