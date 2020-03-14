<template>
  <v-app id="app"/>
</template>

<script>
  export default {
    created() {
      this.$store.dispatch('revokeUserToken');
      this.$router.push("/");
    }
  };
</script>
