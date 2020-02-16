import Vue from 'vue';
import Vuetify from 'vuetify/lib';
import colors from 'vuetify/lib/util/colors';

Vue.use(Vuetify);

export default new Vuetify({
  theme: {
      options: {
        customProperties: true,
      },
    themes: {
      light: {
        primary: colors.blueGrey,
        secondary: colors.blueGrey.lighten2,
        accent: colors.blueGrey.lighten4,
        error: colors.red,
        info: colors.blue,
        success: colors.green,
        warning: colors.orange
      },
    },
  },
  icons: {
    iconfont: 'md',
  },
});
