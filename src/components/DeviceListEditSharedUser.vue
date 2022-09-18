<template>
  <v-dialog v-if="devices" v-model="showDialog" max-width="500px">
    <v-card>
      <v-card-title>
        <span class="headline">Share / Unshare</span>
      </v-card-title>

      <v-card-text>
        <v-row dense>
          <v-col cols="12" sm="6" md="4">
            <v-text-field v-model="username" label="Username" />
          </v-col>
        </v-row>
      </v-card-text>

      <v-card-title>
        <span class="headline">Affected devices</span>
      </v-card-title>

      <v-card-text>
        <v-chip-group column>
          <v-chip v-for="device in devices" :key="device">
            {{ device.alias }}
          </v-chip>
        </v-chip-group>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn color="blue darken-1" text @click="noChange"> Cancel </v-btn>
        <v-btn color="blue darken-1" text @click="addUser"> Share </v-btn>
        <v-btn color="blue darken-1" text @click="removeUser"> Unshare </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { ApiMixin } from "@/mixins/ApiMixin";
export default {
  name: "EditSharedUser",
  mixins: [ApiMixin],
  data() {
    return {
      showDialog: false,
      resolve: null,
      reject: null,
      devices: [],
      username: "",
    };
  },
  methods: {
    open(devices) {
      this.devices = devices;
      this.showDialog = true;
      return new Promise((resolve, reject) => {
        this.resolve = resolve;
        this.reject = reject;
      });
    },
    addUser() {
      let deviceIdList = [];
      for (let item of this.devices) {
        deviceIdList.push(item.device_id);
      }
      this.apiRequest(
        "post",
        `users/${this.$store.state.user.user_id}/devices/${deviceIdList}/shareduser`,
        { username: this.username }
      )
        .then(() => {
          this.resolve(true);
        })
        .catch((err) => {
          // Only throw an error on server errors
          if (err.response.status >= 500) {
            this.reject(true);
          } else {
            this.resolve(false);
          }
        })
        .finally(() => {
          this.showDialog = false;
        });
    },
    removeUser() {
      let deviceIdList = [];
      for (let item of this.devices) {
        deviceIdList.push(item.device_id);
      }
      this.apiRequest(
        "delete",
        `users/${this.$store.state.user.user_id}/devices/${deviceIdList}/shareduser`,
        { username: this.username }
      )
        .then(() => {
          this.resolve(true);
        })
        .catch((err) => {
          // Only throw an error on server errors
          if (err.response.status >= 500) {
            this.reject(true);
          } else {
            this.resolve(false);
          }
        })
        .finally(() => {
          this.showDialog = false;
        });
    },
    noChange() {
      this.resolve(false);
      this.showDialog = false;
    },
  },
};
</script>
