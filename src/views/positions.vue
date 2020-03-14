<template>
  <v-layout child-flex px-3 py-3>
    <v-data-table
      v-model="selected"
      :headers="headers"
      :items="allPositions"
      item-key="device_id"
      :sort-by="['device_id']"
      class="elevation-1"
    >
    </v-data-table>
  </v-layout>
</template>

<script>
  import {apiMixin} from '@/components/mixins/apiMixin';
  export default {
    name: "Positions",
    mixins: [apiMixin],
    created() {
      this.apiRequest('get', '/positions');
    },
    computed: {
      allPositions: function() {
        return this.response.data
      }
    },
    data () {
      return {
        singleSelect: false,
        selected: [],
        headers: [
          {
            text: 'Timestamp',
            align: 'left',
            value: 'loc_timestamp',
          },
          { text: 'Alias', value: 'alias' },
          { text: 'Latitude', value: 'loc_lat' },
          { text: 'Longitude', value: 'loc_lon' },
        ],
      }
    }
  }
</script>
