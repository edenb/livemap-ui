<template>
  <v-dialog
    v-model="dialog"
    :max-width="options.width"
    :style="{ zIndex: options.zIndex }"
    @keydown.esc="cancel"
  >
    <v-card>
      <v-toolbar dark :color="options.color" dense flat>
        <v-toolbar-title class="text-white">
          {{ title }}
        </v-toolbar-title>
      </v-toolbar>
      <v-card-text
        v-for="message in messages"
        v-show="!!message"
        :key="message"
      >
        {{ message }}
      </v-card-text>
      <v-card-text>
        <v-chip-group column>
          <v-chip v-for="item in items" :key="item">
            {{ item }}
          </v-chip>
        </v-chip-group>
      </v-card-text>
      <v-card-actions class="pt-0">
        <v-spacer />
        <v-btn color="primary-darken-1" variant="text" @click="agree"> Yes </v-btn>
        <v-btn color="grey" variant="text" @click="cancel"> Cancel </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
/**
 * Vuetify Confirm Dialog component
 *
 * Insert component where you want to use it:
 * <confirm ref="confirm"></confirm>
 *
 * Call it:
 * this.$refs.confirm.open('Delete', 'Are you sure?', { color: 'red' }).then((confirm) => {})
 * Or use await:
 * if (await this.$refs.confirm.open('Delete', 'Are you sure?', { color: 'red' })) {
 *   // yes
 * }
 * else {
 *   // cancel
 * }
 *
 * Alternatively you can place it in main App component and access it globally via this.$root.$confirm
 * <template>
 *   <v-app>
 *     ...
 *     <confirm ref="confirm"></confirm>
 *   </v-app>
 * </template>
 *
 * mounted() {
 *   this.$root.$confirm = this.$refs.confirm.open
 * }
 */
export default {
  data: () => ({
    dialog: false,
    resolve: null,
    reject: null,
    messages: [],
    items: [],
    title: null,
    options: {
      color: "primary",
      width: 290,
      zIndex: 200,
    },
  }),
  methods: {
    open(title, messages, items, options) {
      this.dialog = true;
      this.title = title;
      this.messages = messages;
      this.items = items;
      this.options = Object.assign(this.options, options);
      return new Promise((resolve, reject) => {
        this.resolve = resolve;
        this.reject = reject;
      });
    },
    agree() {
      this.resolve(true);
      this.dialog = false;
    },
    cancel() {
      this.resolve(false);
      this.dialog = false;
    },
  },
};
</script>
