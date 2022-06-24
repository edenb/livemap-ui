module.exports = {
  "lintOnSave": false,
  "runtimeCompiler": true,
  "transpileDependencies": [
    "vuetify"
  ],
  chainWebpack: (config) => {
    config.resolve.alias.set('vue', '@vue/compat')

    config.module
      .rule('vue')
      .use('vue-loader')
      .tap((options) => {
        return {
          ...options,
          compilerOptions: {
            compatConfig: {
              MODE: 2
            }
          }
        }
      })
  }
}
