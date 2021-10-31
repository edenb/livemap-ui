<template>
  <v-dialog
    v-if="info && info.application"
    v-model="dialog"
    :max-width="options.width"
    :style="{ zIndex: options.zIndex }"
    @keydown.esc="cancel"
  >
    <v-card>
      <v-toolbar
        dark
        :color="options.color"
        dense
        flat
      >
        <v-toolbar-title class="white--text">
          {{ info.application.name }}
        </v-toolbar-title>
      </v-toolbar>

      <v-list-item three-line>
        <v-list-item-content>
          <div v-if="info.application.about && info.application.about.length>0">
            <v-list-item-title>
              <span class="overline mb-1">About</span>
            </v-list-item-title>
            <v-list-item-subtitle>{{ info.application.about }}</v-list-item-subtitle>
            <v-divider class="mr-1 mt-4" />
          </div>
          <div>
            <v-list-item-title>
              <span class="overline mb-1">Server</span>
              <transition
                :duration="1000"
                name="fade"
              >
                <span
                  v-if="copied[0]"
                  class="caption green--text"
                >
                  Copied!
                </span>
              </transition>
            </v-list-item-title>
            <v-list-item-subtitle>
              <div>
                {{ serverUrl }}
                <v-icon
                  small
                  class="ml-2"
                  @click="copy(serverUrl, 0)"
                >
                  mdi-content-copy
                </v-icon>
              </div>
            </v-list-item-subtitle>
            <v-divider class="mr-1 mt-4" />
          </div>
          <div v-if="info.mqtt">
            <v-list-item-title>
              <span class="overline mb-1">MQTT broker</span>
              <transition
                :duration="1000"
                name="fade"
              >
                <span
                  v-if="copied[1]"
                  class="caption green--text"
                >
                  Copied!
                </span>
              </transition>
            </v-list-item-title>
            <v-list-item-subtitle>
              <div>
                {{ info.mqtt.url }}
                <v-icon
                  small
                  class="ml-2"
                  @click="copy(info.mqtt.url, 1)"
                >
                  mdi-content-copy
                </v-icon>
              </div>
              <div>
                Port: {{ info.mqtt.port }}
              </div>
            </v-list-item-subtitle>
            <v-divider class="mr-1 mt-4" />
          </div>
          <div v-if="info.application.license">
            <v-list-item-title>
              <span class="overline mb-1">License</span>
            </v-list-item-title>
            <v-list-item-subtitle>{{ info.application.license }}</v-list-item-subtitle>
            <v-divider class="mr-1 mt-4" />
          </div>
        </v-list-item-content>
      </v-list-item>

      <v-card-actions class="pt-0">
        <v-spacer />
        <v-btn
          color="primary darken-1"
          text
          @click.native="cancel"
        >
          OK
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import {apiMixin} from '@/components/mixins/apiMixin';
import {getServerUrl} from '@/helpers/axios';
export default {
  name: "Serverinfo",
  mixins: [apiMixin],
  data () {
    return {
      dialog: false,
      resolve: null,
      reject: null,
      info: {},
      serverUrl: '',
      copied: [false, false],
      options: {
        color: 'primary',
        width: 340,
        zIndex: 200
      }
    }
  },
  methods: {
    open() {
      this.dialog = true
      this.serverUrl = getServerUrl()
      this.apiRequest('get', `server/info`)
        .then((response) => {
          this.info = response.data
          return new Promise((resolve, reject) => {
            this.resolve = resolve
            this.reject = reject
          })
        })
    },
    cancel() {
      this.dialog = false
    },
    async copy(clipboardText, copiedIdx) {
      // Use splice to make variable reactive
      this.copied.splice(copiedIdx, copiedIdx + 1, true);
       await navigator.clipboard.writeText(clipboardText)
      this.copied.splice(copiedIdx, copiedIdx + 1, false);
    }
  }
}
</script>
