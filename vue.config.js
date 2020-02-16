module.exports = {
  "lintOnSave": false,
  "runtimeCompiler": true,
  "configureWebpack": {
    "devtool": "source-map",
    "resolve": {
      "symlinks": false
    }
  },
  "devServer": {
    "stats": "verbose",
    "proxy": {
      "/api": {
        "target": "http://localhost:3000",
        "logLevel": "debug",
        "changeOrigin": true
      }
    }
  },
  "transpileDependencies": [
    "vuetify"
  ]
}