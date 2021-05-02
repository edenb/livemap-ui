<template>
  <v-container fluid pa-3>
    <v-data-table
      v-model="selected"
      :headers="headers"
      :items="allUsers"
      :search="search"
      item-key="user_id"
      :sort-by="['fullname']"
      show-select
      class="elevation-1"
    >
      <template v-slot:top>
        <v-toolbar
          flat
          dense
          color="secondary"
          dark
        >
          <confirm ref="confirm"></confirm>
          <editUser ref="editUser"></editUser>
          <editPassword ref="editPassword"></editPassword>
          <v-toolbar-title>Users</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-text-field
            v-model="search"
            append-icon="mdi-magnify"
            label="Search"
            single-line
            hide-details
          >
          </v-text-field> 
          <v-spacer></v-spacer>
          <v-btn
            color="white"
            fab
            dark
            small
            icon
            @click="newItem()"
          >
            <v-icon dark>
              mdi-plus
            </v-icon>
          </v-btn>
          <v-btn
            color="white"
            fab
            dark
            small
            icon
            :disabled="selected.length !== 1"
            @click="editItem(selected[0])"
          >
            <v-icon dark>
              mdi-pencil
            </v-icon>
          </v-btn>
          <v-btn
            color="white"
            fab
            dark
            small
            icon
            :disabled="selected.length !== 1"
            @click="editPasswordItem(selected[0])"
          >
            <v-icon dark>
              mdi-lock-reset
            </v-icon>
          </v-btn>
          <v-btn
            color="white"
            fab
            dark
            small
            icon
            :disabled="selected.length !== 1 || (selected.length == 1 && selected[0].user_id == $store.state.user.user_id)"
            @click="deleteItem(selected[0])"
          >
            <v-icon dark>
              mdi-delete
            </v-icon>
          </v-btn>
        </v-toolbar>
      </template>
      <template v-slot:[`item.actions`]="{ item }">
        <v-icon
          small
          class="mr-2"
          @click="editItem(item)"
        >
          mdi-pencil
        </v-icon>
        <v-icon
          small
          class="mr-2"
          @click="editPasswordItem(item)"
        >
          mdi-lock-reset
        </v-icon>
        <v-icon
          small
          @click="deleteItem(item)"
        >
          mdi-delete
        </v-icon>
      </template>
    </v-data-table>
  </v-container>
</template>

<script>
import {apiMixin} from '@/components/mixins/apiMixin';
import Confirm from '@/views/confirm.vue';
import EditUser from '@/views/editUser.vue';
import EditPassword from '@/views/editPassword.vue';
export default {
  components: {
    Confirm,
    EditUser,
    EditPassword
  },
  name: "Users",
  mixins: [apiMixin],
  created() {
    this.loadTable();
  },
  data () {
    return {
      allUsers: [],
      selected: [],
      headers: [
        { text: 'Full Name', value: 'fullname' },
        { text: 'Username', value: 'username' },
        { text: 'Role', value: 'role' },
        { text: 'Actions', value: 'actions', sortable: false }
      ],
      search: '',
      newUser: {
        user_id: -1,
        username: '',
        fullname: '',
        email: '',
        role: 'manager',
        password: ''
      }
    }
  },
  methods: {
    loadTable () {
      this.apiRequest('get', `users`)
        .then((response) => {
          this.allUsers = response.data
          this.selected = this.updateSelected(this.allUsers, this.selected)
        })
        .catch(() => {
          // Ignore failed (re)loads
        })
    },
    updateSelected (users, selected) {
      let newSelected = []
      for (let user of selected) {
        if (users.find(el => el.user_id === user.user_id)) {
          newSelected.push(user);
        }
      }
      return newSelected
    },
    editItem (item) {
      this.showDialogUser(item);
    },
    newItem () {
      this.showDialogUser(this.newUser);
    },
    deleteItem (item) {
      let messageText = [];
      messageText.push('Are you sure you want to delete the following user?');
      this.$refs.confirm.open('Delete', messageText, [item.fullname],
        { color: 'red' })
        .then((confirm) => {
          if (confirm) {
            this.apiRequest('delete', `users/${item.user_id}`)
              .then(() => {
                this.loadTable();
              })
              .catch((err) => {
                // Do not reload the table on internal server error
                if(err.response.status < 500) {
                  this.loadTable();
                }
              })
          }
        })
    },
    editPasswordItem (item) {
      this.showDialogPassword(item);
    },
    showDialogUser (user) {
      this.$refs.editUser.open(user)
        .then(() => {
          this.loadTable();
        })
    },
    showDialogPassword (user) {
      this.$refs.editPassword.open(user)
        .then(() => {
          this.loadTable();
        })
    }
  }
}
</script>
