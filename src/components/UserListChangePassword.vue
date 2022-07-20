<template>
  <v-dialog
    v-if="user"
    v-model="showDialog"
    max-width="500px"
  >
    <v-card>
      <v-card-title>
        <span class="headline px-3">Reset Password</span>
      </v-card-title>     

      <v-card-text>
        <div class="subtitle-1 px-3">
          User: {{ user.fullname }}
        </div>
        <div class="subtitle-1 px-3">
          Username: {{ user.username }}
        </div>
        <v-container>
          <v-row>
            <v-col cols="12">
              <v-text-field
                v-model="password.newpwd"
                :append-icon="showPasswordNew ? 'mdi-eye' : 'mdi-eye-off'"
                :type="showPasswordNew ? 'text' : 'password'"
                label="New Password"
                class="input-group--focused"
                @click:append="showPasswordNew = !showPasswordNew"
              />
            </v-col>
            <v-col cols="12">
              <v-text-field
                v-model="password.confirmpwd"
                :append-icon="showPasswordConfirm ? 'mdi-eye' : 'mdi-eye-off'"
                :type="showPasswordConfirm ? 'text' : 'password'"
                label="Confirm Password"
                class="input-group--focused"
                @click:append="showPasswordConfirm = !showPasswordConfirm"
              />
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>

      <v-card-actions>
        <template v-if="errorResponseText!==''">
          <v-icon
            icon="mdi-alert"
            medium
            color="error"
          />
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
  name: "EditPassword",
  mixins: [ApiMixin],
  data () {
    return {
      showDialog: false,
      showPasswordNew: false,
      showPasswordConfirm: false,
      resolve: null,
      reject: null,
      user: {},
      password: {}
    }
  },
  methods: {
    open(orgUser) {
      this.user = orgUser;
      this.password.newpwd = '';
      this.password.confirmpwd = '';
      this.errorResponseText = '';
      this.showDialog = true;
      return new Promise((resolve, reject) => {
        this.resolve = resolve
        this.reject = reject
      })
    },
    changed() {
      this.apiRequest('post', `users/${this.user.user_id}/password/reset`, this.password)
        .then(() => {
          this.resolve(true)
          this.showDialog = false
        })
        .catch(() => {})
    },
    noChange() {
      this.resolve(false)
      this.showDialog = false
    }
  }
}
</script>
