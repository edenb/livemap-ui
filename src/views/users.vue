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
            @click="editItem()"
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
            :disabled="selected.length !== 1 || (selected.length == 1 && selected[0].user_id == $store.state.user.user_id)"
            @click="deleteItem()"
          >
            <v-icon dark>
              mdi-delete
            </v-icon>
          </v-btn>
        </v-toolbar>
      </template>
    </v-data-table>
  </v-container>
</template>

<script>
import {apiMixin} from '@/components/mixins/apiMixin';
import Confirm from '@/views/confirm.vue';
import EditUser from '@/views/editUser.vue';
export default {
  components: {
    Confirm,
    EditUser
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
        { text: 'Role', value: 'role' }
      ],
      search: '',
      newUser: {
        user_id: -1,
        username: '',
        fullname: '',
        email: '',
        role: 'viewer'
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
    editItem () {
      this.showDialogUser(this.selected[0]);
    },
    newItem () {
      this.showDialogUser(this.newUser);
    },
    deleteItem () {
      let messageText = [];
      messageText.push('Are you sure you want to delete the following user?');
      this.$refs.confirm.open('Delete', messageText, [this.selected[0].fullname],
        { color: 'red' })
        .then((confirm) => {
          if (confirm) {
            this.apiRequest('delete', `users/${this.selected[0].user_id}`)
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
    showDialogUser (user) {
      this.$refs.editUser.open(user)
        .then(() => {
          this.loadTable();
        })
    }
  }
}
</script>
