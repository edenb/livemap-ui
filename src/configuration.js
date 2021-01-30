import dotenv from 'dotenv'
dotenv.config()

export default class ConfigProvider {
  static get CONFIG() {
    return {
      envServerUrl: '$VUE_APP_SERVER_URL',
      envApiPath: '$VUE_APP_API_PATH',
    }
  }

  static value(name) {
    if (!(name in this.CONFIG)) {
      return
    }

    const value = this.CONFIG[name];

    if (!value) {
      return
    }

    if (value.startsWith('$VUE_APP_')) {
      const envName = value.substr(1)
      const envValue = process.env[envName]
      if (envValue) {
        return envValue
      } else {
        return
      }
    } else {
      return value
    }
  }
}
