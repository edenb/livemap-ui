<template>
  <div />
</template>

<script>
import { inject } from "vue";

export default {
  name: "UserLogout",
  setup() {
    const disconnect = inject("disconnect");
    return {
      disconnect,
    };
  },
  created() {
    this.disconnect();
    this.$store.dispatch("revokeUserToken");
    this.$store.dispatch("clearLastPositions");
    this.$store.dispatch("clearMapZoom");
    this.$store.dispatch("clearMapCenter");
    this.$router.push("/");
  },
};
</script>
