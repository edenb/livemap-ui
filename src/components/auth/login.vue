<template>
 <v-app id="app">
    <v-content>
      <v-container
        class="fill-height"
        fluid
      >
        <v-row
          align="center"
          justify="center"
        >
          <v-col
            cols="12"
            sm="8"
            md="4"
          >
            <v-card
              class="elevation-12"
            >
              <v-toolbar
                color="primary"
                dark
                flat
              >
                <v-toolbar-title>Login</v-toolbar-title>
              </v-toolbar>
              <v-progress-linear
                :active="loading"
                :indeterminate="loading"
                absolute
                bottom
                color="primary"
              ></v-progress-linear>
              <v-card-text>
                <v-form
                  ref="form"
                  v-model="valid"
                >
                  <v-text-field
                    label="Username"
                    name="username"
                    prepend-icon="person"
                    type="text"
                    v-model="username"
                    :rules="usernameRules"
                    required
                    @keyup.enter="loginUser"
                  />
                  <v-text-field
                    id="password"
                    label="Password"
                    name="password"
                    prepend-icon="lock"
                    type="password"
                    v-model="password"
                    :rules="passwordRules"
                    required
                    @keyup.enter="loginUser"
                  />
                </v-form>
              </v-card-text>
              <v-card-actions class="px-4">
                <template v-if="errorResponseText!==''">
                  <v-icon medium color="error">mdi-alert</v-icon>
                  <div class="error--text px-2">
                    {{errorResponseText}}
                  </div>
                </template>
                <v-spacer />
                <v-btn
                  :disabled="!valid"
                  color="primary"
                  @click="loginUser"
                >
                  Login
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-content>
  </v-app>
</template>

<script>
  import {apiMixin} from '@/components/mixins/apiMixin'
  export default {
    mixins: [apiMixin],
    data: () => ({
      username: "",
      usernameRules: [
        v => !!v || 'Username is required',
      ],
      password: "",
      passwordRules: [
        v => !!v || 'Password is required',
      ],
      valid: false
    }),
    methods: {
      loginUser() {
        if (this.username && this.password) { 
          this.apiRequest('post', '/login', {"username": this.username, "password": this.password})
            .then((response) => {
              console.log(`User token: ${response.data.access_token}`);
              return this.$store.dispatch('setUserToken', response.data.access_token);
            })
            .then(() => {
              this.$socket.client.open();
              this.$router.push("/worldmap");
            })
            .catch((err) => {
              this.loading = false;
              if (err.response && err.response.status) {
                this.errorResponseText = getErrorResponseText(err.response.status);
                if (err.response.status == 401) {
                  this.$store.dispatch('revokeUserToken');
                } 
              } else {
                this.errorResponseText = "No server connection";
              }
            })
          }
        }
    }
  }

function getErrorResponseText(status) {
  let errorResponseText = "";
  switch(status) {
    case 401:
      errorResponseText = "Login failed"
      break;
    default:
      errorResponseText = "Server busy";
  }
  return errorResponseText;
}
</script>
