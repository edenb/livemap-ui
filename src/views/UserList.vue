<template>
  <v-container class="pa-3" fluid style="height: 100%">
    <v-row v-if="state === 'loading'" style="height: 100%">
      <v-col align-self="center" class="text-center">
        <v-progress-circular
          v-if="state === 'loading'"
          data-cy="user-list-state-loading"
          indeterminate
          :size="50"
        ></v-progress-circular>
      </v-col>
    </v-row>

    <v-empty-state
      v-if="state === 'failed'"
      data-cy="user-list-state-failed"
      icon="mdi-emoticon-sad"
      style="height: 100%"
      text="This may be caused by a server failure, a problem with your connection or insufficient rights to access the user list."
      title="Unable to show the user list."
    ></v-empty-state>

    <v-data-table
      v-if="state === 'loaded'"
      v-model="selected"
      data-cy="user-list-state-loaded"
      density="compact"
      :headers="headers"
      item-value="user_id"
      :items="allUsers"
      :mobile="null"
      mobile-breakpoint="md"
      :search="search"
      :sort-by="[{ key: 'fullname', order: 'asc' }]"
      show-select
      class="elevation-1"
    >
      <template #top>
        <v-toolbar density="compact" color="secondary">
          <ConfirmDialog ref="confirmDialog" />
          <UserListEditUser ref="userListEditUser" />
          <UserListChangePassword ref="userListChangePassword" />
          <v-toolbar-title class="hidden-xs">Users</v-toolbar-title>
          <v-text-field
            v-model="search"
            append-icon="mdi-magnify"
            class="pl-4"
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
const userListChangePassword = ref(null);
const userListEditUser = ref(null);
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
const { show } = inject("snackbar");
const state = ref(null);
const { user } = storeToRefs(useAuthStore());

onMounted(async () => {
  await loadTable();
});

async function loadTable() {
  state.value = "loading";
  try {
    const response = await httpRequest("get", `users`);
    allUsers.value = response.data;
    if (allUsers.value.length === 0) {
      state.value = "empty";
    } else {
      state.value = "loaded";
    }
  } catch {
    state.value = "failed";
  }
}

function editItem(item) {
  showDialogUser(item);
}

function newItem() {
  showDialogUser(newUser.value);
}

async function deleteItem(item) {
  const messageText = ["Are you sure you want to delete the following user?"];
  const confirm = await confirmDialog.value.open(
    "Delete",
    messageText,
    [item.fullname],
    { color: "red" },
  );
  if (confirm) {
    try {
      await httpRequest("delete", `users/${item.user_id}`);
      await loadTable();
      selected.value = [];
      show({ message: `User ${item.fullname} deleted.`, color: "success" });
    } catch (err) {
      show({
        message: `Failed to delete user ${item.fullname}.`,
        color: "error",
      });
    }
  }
}

function editPasswordItem(item) {
  showDialogPassword(item);
}

async function showDialogUser(user) {
  const changed = await userListEditUser.value.open(user);
  if (changed) {
    await loadTable();
  }
}

async function showDialogPassword(user) {
  const changed = await userListChangePassword.value.open(user);
  if (changed) {
    await loadTable();
  }
}
</script>
