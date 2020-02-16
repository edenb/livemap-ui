<template>
  <v-layout child-flex px-3 py-3>
    <v-data-table
      v-model="selected"
      :headers="headers"
      :items="allUsers"
      item-key="user_id"
      :sort-by="['user_id']"
      class="elevation-1"
    >
    </v-data-table>
  </v-layout>
</template>

<script>
  import {axiosMixin} from '@/components/mixins/axiosMixin';
  export default {
    name: "Users",
    mixins: [axiosMixin],
    created() {
      this.apiRequest('get', '/users');
    },
    computed: {
      allUsers: function() {
        return this.response.data
      }
    },
    data () {
      return {
        singleSelect: false,
        selected: [],
        headers: [
          {
            text: 'User ID',
            align: 'left',
            value: 'user_id',
          },
          { text: 'Username', value: 'username' },
          { text: 'Full name', value: 'fullname' },
          { text: 'E-mail', value: 'email' },
          { text: 'Role', value: 'role' },
          { text: 'API key', value: 'api_key' },
        ],
      }
    }
  }
</script>
