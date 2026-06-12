// Styles
import "@mdi/font/css/materialdesignicons.css";
import "vuetify/styles";

// Vuetify
import { createVuetify } from "vuetify";
import { aliases, mdi } from "vuetify/iconsets/mdi";

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

// Dark theme: blue-grey palette inverted for dark surfaces.
//
// Design rationale:
//   background / surface  — deep blue-grey instead of pure black, keeps the
//                           blue-grey family feel and avoids harsh contrast.
//   primary               — lightened blue-grey (blueGrey.lighten2) so it
//                           stays readable on dark surfaces (WCAG AA).
//   secondary             — mid blue-grey (blueGrey.lighten1), one step below
//                           primary to maintain the light/secondary hierarchy.
//   accent                — darkened blue-grey (blueGrey.darken1) for subtle
//                           chip/badge backgrounds without washing out.
//   error/info/success/   — all slightly brightened (+10–15 lightness) vs the
//   warning                 light-theme values so they stay vivid on dark bg.
const livemapThemeDark = {
  dark: true,
  colors: {
    background: "#1a2226", // blueGrey.darken4 approx
    surface: "#263238", // blueGrey.darken3
    primary: "#90a4ae", // blueGrey.lighten2 — readable on dark bg
    secondary: "#78909c", // blueGrey.lighten1
    accent: "#546e7a", // blueGrey.darken1
    error: "#ef5350", // red.lighten1
    info: "#42a5f5", // blue.lighten1
    success: "#66bb6a", // green.lighten1
    warning: "#ffa726", // orange.lighten1
  },
};

export default createVuetify({
  theme: {
    // "system" lets Vuetify 4 honour the OS dark/light preference and
    // automatically switch between livemapTheme and livemapThemeDark.
    defaultTheme: "system",
    themes: {
      // Vuetify 4 matches theme names by convention:
      //   "light"  → used when OS prefers light
      //   "dark"   → used when OS prefers dark
      // Aliasing your custom themes to these names means the system
      // toggle works without any additional configuration.
      light: livemapTheme,
      dark: livemapThemeDark,
      // Keep the named exports too so any existing
      // useTheme() / theme.global.name references still resolve.
      livemapTheme,
      livemapThemeDark,
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
