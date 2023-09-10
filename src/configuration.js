export default class ConfigProvider {
  static get CONFIG() {
    return {
      envServerUrl: "$VITE_SERVER_URL",
      envApiPath: "$VITE_API_PATH",
    };
  }

  static value(name) {
    if (!(name in ConfigProvider.CONFIG)) {
      return;
    }

    const value = ConfigProvider.CONFIG[name];

    if (!value) {
      return;
    }

    if (value.startsWith("$VITE_")) {
      const envName = value.substr(1);
      const envValue = import.meta.env[envName];
      if (envValue) {
        return envValue;
      } else {
        return;
      }
    } else {
      return value;
    }
  }
}
