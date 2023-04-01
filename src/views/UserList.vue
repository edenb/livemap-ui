<!-- eslint-disable vuetify/no-deprecated-components -->
<template>
  <v-container fluid pa-3>
    <v-data-table
      v-model="selected"
      density="compact"
      :headers="headers"
      item-value="user_id"
      :items="allUsers"
      :search="search"
      :sort-by="[{ key: 'fullname', order: 'asc' }]"
      show-select
      class="elevation-1"
    >
      <template #top>
        <v-toolbar density="compact" color="secondary">
          <ConfirmDialog ref="confirm" />
          <UserListEditUser ref="editUser" />
          <UserListChangePassword ref="editPassword" />
          <v-toolbar-title>Users</v-toolbar-title>
          <v-spacer />
          <v-text-field
            v-model="search"
            append-icon="mdi-magnify"
            density="compact"
            hide-details
            label="Search"
            single-line
          />
          <v-spacer />
          <v-btn icon="mdi-plus" title="Add user" @click="newItem()" />
          <v-btn
            :disabled="selected.length !== 1"
            icon="mdi-pencil"
            title="Edit selected user"
            @click="editItem(allUsers.find((e) => e.user_id === selected[0]))"
          />
          <v-btn
            :disabled="selected.length !== 1"
            icon="mdi-lock-reset"
            title="Reset password of selected user"
            @click="
              editPasswordItem(allUsers.find((e) => e.user_id === selected[0]))
            "
          />
          <v-btn
            :disabled="
              selected.length !== 1 ||
              (selected.length === 1 &&
                selected[0] === $store.state.user.user_id)
            "
            icon="mdi-delete"
            title="Remove selected user"
            @click="deleteItem(allUsers.find((e) => e.user_id === selected[0]))"
          />
        </v-toolbar>
      </template>
      <template #item.actions="{ item }">
        <v-btn
          icon="mdi-pencil"
          size="small"
          title="Edit user"
          variant="plain"
          @click="editItem(item.raw)"
        />
        <v-btn
          icon="mdi-lock-reset"
          size="small"
          title="Reset password"
          variant="plain"
          @click="editPasswordItem(item.raw)"
        />
        <v-btn
          :disabled="item.raw.user_id === $store.state.user.user_id"
          icon="mdi-delete"
          size="small"
          title="Remove user"
          variant="plain"
          @click="deleteItem(item.raw)"
        />
      </template>
    </v-data-table>
  </v-container>
</template>

<script>
import { ApiMixin } from "@/mixins/ApiMixin.js";
import ConfirmDialog from "@/components/ConfirmDialog.vue";
import UserListEditUser from "@/components/UserListEditUser.vue";
import UserListChangePassword from "@/components/UserListChangePassword.vue";
export default {
  name: "UserList",
  components: {
    ConfirmDialog,
    UserListEditUser,
    UserListChangePassword,
  },
  mixins: [ApiMixin],
  data() {
    return {
      allUsers: [],
      search: "",
      selected: [],
    };
  },
  created() {
    this.headers = [
      { title: "Full Name", key: "fullname" },
      { title: "Username", key: "username" },
      { title: "Role", key: "role" },
      { title: "Actions", key: "actions", sortable: false },
    ];
    this.newUser = {
      api_key: "",
      email: "",
      fullname: "",
      password: "",
      role: "",
      user_id: -1,
      username: "",
    };
    this.loadTable();
  },
  methods: {
    loadTable() {
      this.apiRequest("get", `users`)
        .then((response) => {
          this.allUsers = response.data;
        })
        .catch(() => {
          // Ignore failed (re)loads
        });
    },
    editItem(item) {
      this.showDialogUser(item);
    },
    newItem() {
      this.showDialogUser(this.newUser);
    },
    deleteItem(item) {
      let messageText = [];
      messageText.push("Are you sure you want to delete the following user?");
      this.$refs.confirm
        .open("Delete", messageText, [item.fullname], { color: "red" })
        .then((confirm) => {
          if (confirm) {
            this.apiRequest("delete", `users/${item.user_id}`)
              .then(() => {
                this.loadTable();
              })
              .catch((err) => {
                // Do not reload the table on internal server error
                if (err.response.status < 500) {
                  this.loadTable();
                }
              });
          }
        });
    },
    editPasswordItem(item) {
      this.showDialogPassword(item);
    },
    showDialogUser(user) {
      this.$refs.editUser.open(user).then(() => {
        this.loadTable();
      });
    },
    showDialogPassword(user) {
      this.$refs.editPassword.open(user).then(() => {
        this.loadTable();
      });
    },
  },
};
</script>
