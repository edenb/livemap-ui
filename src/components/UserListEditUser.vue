<template>
  <v-dialog
    v-if="user"
    v-model="showDialog"
    max-width="500px"
  >
    <v-card>
      <v-card-title>
        <span class="headline px-3">{{ formTitle }}</span>
        <v-spacer />
        <template v-if="user.user_id >= 0">
          <span class="subtitle-1 px-3">User ID: {{ user.user_id }}</span>
        </template>
      </v-card-title>

      <v-card-text>
        <v-container>
          <v-row>
            <v-col
              cols="12"
              sm="6"
              md="4"
            >
              <v-text-field
                v-model="user.username"
                label="Username"
              />
            </v-col>
            <v-col
              v-if="user.user_id < 0"
              cols="12"
              sm="6"
              md="4"
            >
              <v-text-field
                v-model="user.password"
                :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                :type="showPassword ? 'text' : 'password'"
                label="Password"
                class="input-group--focused"
                @click:append="showPassword = !showPassword"
              />
            </v-col>
            <v-col
              cols="12"
              sm="6"
              md="4"
            >
              <v-text-field
                v-model="user.fullname"
                label="Full Name"
              />
            </v-col>
            <v-col
              cols="12"
              sm="6"
              md="4"
            >
              <v-text-field
                v-model="user.email"
                label="E-mail"
              />
            </v-col>
            <v-col
              cols="12"
              sm="6"
              md="4"
            >
              <v-select
                v-model="user.role"
                :items="roles"
                label="Role"
              />
            </v-col>
            <v-col
              cols="12"
              sm="6"
              md="4"
            >
              <v-text-field
                v-model="user.api_key"
                :append-icon="showApiKey ? 'mdi-eye' : 'mdi-eye-off'"
                :type="showApiKey ? 'text' : 'password'"
                readonly
                label="API key"
                class="input-group--focused"
                @click:append="showApiKey = !showApiKey"
              />
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>

      <v-card-actions>
        <template v-if="errorResponseText!==''">
          <v-icon
            medium
            color="error"
          >
            mdi-alert
          </v-icon>
          <div class="error--text px-2">
            {{ errorResponseText }}
          </div>
        </template>
        <v-spacer />
        <v-btn
          color="blue darken-1"
          text
          @click="noChange"
        >
          Cancel
        </v-btn>
        <v-btn
          color="blue darken-1"
          text
          @click="changed"
        >
          Save
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import {ApiMixin} from '@/mixins/ApiMixin';
export default {
  name: "EditUser",
  mixins: [ApiMixin],
  data () {
    return {
      showDialog: false,
      showApiKey: false,
      showPassword: false,
      roles: ['admin', 'manager', 'viewer'],
      resolve: null,
      reject: null,
      user: {}
    }
  },
  computed: {
    formTitle: function () {
      return this.user.user_id < 0 ? 'New User' : 'Edit User'
    }
  },
  methods: {
    open(orgUser) {
      this.user = orgUser;
      this.errorResponseText = '';
      this.showApiKey = false;
      this.showPassword = false;
      this.showDialog = true;
      return new Promise((resolve, reject) => {
        this.resolve = resolve
        this.reject = reject
      })
    },
    changed() {
      // Existing users already have an ID
      if (this.user.user_id >= 0) {
        this.apiRequest('put', `users/${this.user.user_id}`, this.user)
          .then(() => {
            this.resolve(true)
            this.showDialog = false
           })
          .catch(() => {})
      } else {
        this.apiRequest('post', `users`, this.user)
          .then(() => {
            this.resolve(true)
            this.showDialog = false
          })
          .catch(() => {})
      }
    },
    noChange() {
      this.resolve(false)
      this.showDialog = false
    }
  }
}
</script>
