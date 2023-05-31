<template>
  <div />
</template>

<script setup>
import { inject, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore, usePositionStore, useWorldmapStore } from "@/store.js";

const authStore = useAuthStore();
const disconnect = inject("disconnect");
const positionStore = usePositionStore();
const router = useRouter();
const worldmapStore = useWorldmapStore();

onMounted(() => {
  disconnect();
  authStore.revokeAuthorized();
  positionStore.clearLastPositions();
  worldmapStore.resetAll();
  router.push("/");
});
</script>
