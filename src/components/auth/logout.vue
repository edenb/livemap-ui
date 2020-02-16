<template>
  <v-app id="app"/>
</template>

<script>
  import {axiosMixin} from '@/components/mixins/axiosMixin'
  export default {
    mixins: [axiosMixin],
    created() {
      this.apiLogout();
    }
  };
</script>
