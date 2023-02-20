// Styles
import "@mdi/font/css/materialdesignicons.css";
import "vuetify/styles";

// Vuetify
import { createVuetify } from "vuetify";
import { aliases, mdi } from "vuetify/iconsets/mdi";
import { VDataTable } from "vuetify/labs/VDataTable";

// Colors derived from vuetify/lib/util/colors
// primary: colors.blueGrey.base,              // #607d8b
// secondary: colors.blueGrey.lighten2,        // #90a4ae
// accent: colors.blueGrey.lighten4,           // #cfd8dc
// error: colors.red.base,                     // #f44336
// info: colors.blue.base,                     // #2196f3
// success: colors.green.base,                 // #4caf50
// warning: colors.orange.base                 // #ff9800

const livemapTheme = {
  dark: false,
  colors: {
    background: "#FFFFFF",
    surface: "#FFFFFF",
    primary: "#607d8b",
    secondary: "#90a4ae",
    accent: "#cfd8dc",
    error: "#f44336",
    info: "#2196f3",
    success: "#4caf50",
    warning: "#ff9800",
  },
};

export default createVuetify({
  components: {
    VDataTable,
  },
  theme: {
    defaultTheme: "livemapTheme",
    themes: {
      livemapTheme,
    },
  },
  icons: {
    defaultSet: "mdi",
    aliases,
    sets: {
      mdi,
    },
  },
});
