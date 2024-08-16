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
          <ConfirmDialog ref="confirmDialog" />
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
          <v-btn v-tooltip="'Add user'" icon="mdi-plus" @click="newItem()" />
          <v-btn
            v-tooltip="'Edit selected user'"
            :disabled="selected.length !== 1"
            icon="mdi-pencil"
            @click="editItem(allUsers.find((e) => e.user_id === selected[0]))"
          />
          <v-btn
            v-tooltip="'Reset password of selected user'"
            :disabled="selected.length !== 1"
            icon="mdi-lock-reset"
            @click="
              editPasswordItem(allUsers.find((e) => e.user_id === selected[0]))
            "
          />
          <v-btn
            v-tooltip="'Remove selected user'"
            :disabled="
              selected.length !== 1 ||
              (selected.length === 1 && selected[0] === user.user_id)
            "
            icon="mdi-delete"
            @click="deleteItem(allUsers.find((e) => e.user_id === selected[0]))"
          />
        </v-toolbar>
      </template>
      <template #[`item.actions`]="{ item }">
        <v-btn
          v-tooltip="'Edit user'"
          icon="mdi-pencil"
          size="small"
          variant="plain"
          @click="editItem(item)"
        />
        <v-btn
          v-tooltip="'Reset password'"
          icon="mdi-lock-reset"
          size="small"
          variant="plain"
          @click="editPasswordItem(item)"
        />
        <v-btn
          v-tooltip="'Remove user'"
          :disabled="item.user_id === user.user_id"
          icon="mdi-delete"
          size="small"
          variant="plain"
          @click="deleteItem(item)"
        />
      </template>
    </v-data-table>
  </v-container>
</template>

<script setup>
import { inject, onMounted, ref } from "vue";
import { storeToRefs } from "pinia";
import { useAuthStore } from "@/store.js";
import ConfirmDialog from "@/components/ConfirmDialog.vue";
import UserListEditUser from "@/components/UserListEditUser.vue";
import UserListChangePassword from "@/components/UserListChangePassword.vue";

const allUsers = ref([]);
const confirmDialog = ref(null);
const editPassword = ref(null);
const editUser = ref(null);
const headers = [
  { title: "Full Name", key: "fullname" },
  { title: "Username", key: "username" },
  { title: "Role", key: "role" },
  { title: "Actions", key: "actions", sortable: false },
];
const httpRequest = inject("httpRequest");
const newUser = ref({
  api_key: "",
  email: "",
  fullname: "",
  password: "",
  role: "",
  user_id: -1,
  username: "",
});
const search = ref("");
const selected = ref([]);
const { user } = storeToRefs(useAuthStore());

onMounted(() => {
  loadTable();
});

function loadTable() {
  httpRequest("get", `users`)
    .then((response) => {
      allUsers.value = response.data;
    })
    .catch(() => {
      // Ignore failed (re)loads
    });
}

function editItem(item) {
  showDialogUser(item);
}

function newItem() {
  showDialogUser(newUser.value);
}

function deleteItem(item) {
  let messageText = [];
  messageText.push("Are you sure you want to delete the following user?");
  confirmDialog.value
    .open("Delete", messageText, [item.fullname], { color: "red" })
    .then((confirm) => {
      if (confirm) {
        httpRequest("delete", `users/${item.user_id}`)
          .then(() => {
            loadTable();
            selected.value = [];
          })
          .catch((err) => {
            // Do not reload the table on internal server error
            if (err.response.status < 500) {
              loadTable();
            }
          });
      }
    });
}

function editPasswordItem(item) {
  showDialogPassword(item);
}

function showDialogUser(user) {
  editUser.value.open(user).then(() => {
    loadTable();
  });
}

function showDialogPassword(user) {
  editPassword.value.open(user).then(() => {
    loadTable();
  });
}
</script>
