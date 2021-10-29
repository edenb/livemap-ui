<template>
  <v-app id="app" />
</template>

<script>
  import {socketMixin} from '@/components/mixins/socketMixin'
  export default {
    mixins: [socketMixin],
    created() {
      this.socketDeAuth();
      this.$store.dispatch('revokeUserToken');
      this.$store.dispatch('clearLastPositions');
      this.$store.dispatch('clearMapZoom');
      this.$store.dispatch('clearMapCenter');
      this.$router.push("/");
    }
  };
</script>
