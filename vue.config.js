const Dotenv = require('dotenv-webpack');

module.exports = {
  "lintOnSave": false,
  "runtimeCompiler": true,
  "transpileDependencies": [
    "vuetify"
  ],
  configureWebpack: {
    plugins: [
      new Dotenv()
    ]
  }
}
