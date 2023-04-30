<template>
  <div />
</template>

<script>
import { inject } from "vue";
import { useAuthStore } from "@/store.js";
import { usePositionStore } from "@/store.js";
import { useWorldmapStore } from "@/store.js";

export default {
  name: "UserLogout",
  setup() {
    const authStore = useAuthStore();
    const disconnect = inject("disconnect");
    const positionStore = usePositionStore();
    const worldmapStore = useWorldmapStore();
    return {
      authStore,
      disconnect,
      positionStore,
      worldmapStore,
    };
  },
  created() {
    this.disconnect();
    this.authStore.revokeAuthorized();
    this.positionStore.clearLastPositions();
    this.worldmapStore.resetAll();
    this.$router.push("/");
  },
};
</script>
