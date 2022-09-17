<template>
  <div />
</template>

<script>
  import {SocketMixin} from '@/mixins/SocketMixin'
  export default {
    name: "UserLogout",
    mixins: [SocketMixin],
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
