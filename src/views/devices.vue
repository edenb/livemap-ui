<template>
  <v-layout child-flex px-3 py-3>
    <v-data-table
      :headers="headers"
      :items="allDevices"
      item-key="device_id"
      :sort-by="['device_id']"
      class="elevation-1"
    >
    </v-data-table>
  </v-layout>
</template>

<script>
  import {axiosMixin} from '@/components/mixins/axiosMixin';
  export default {
    name: "Devices",
    mixins: [axiosMixin],
    created() {
      this.apiRequest('get', '/devices');
    },
    computed: {
      allDevices: function() {
        return this.response.data
      }
    },
    data () {
      return {
        singleSelect: false,
        selected: [],
        headers: [
          {
            text: 'Device ID',
            align: 'left',
            value: 'device_id',
          },
          { text: 'API key', value: 'api_key' },
          { text: 'Identifier', value: 'identifier' },
          { text: 'Alias', value: 'alias' },
          { text: 'Latitude', value: 'fixed_loc_lat' },
          { text: 'Longitude', value: 'fixed_loc_lon' },
        ],
      }
    }
  }
</script>
