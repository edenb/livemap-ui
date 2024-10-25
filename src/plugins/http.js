import Axios from "axios";
import { useAuthStore } from "@/store.js";

const defaults = { serverUrl: "http://localhost:3000", apiPath: "/api/v1" };

export default {
  install: (app, { serverUrl, apiPath }) => {
    const axiosConf = {
      ...defaults,
      ...{ serverUrl, apiPath },
    };

    async function httpRequest(method, path, data) {
      const apiConfig = {
        apiURL: axiosConf.serverUrl + axiosConf.apiPath,
        timeout: 30000,
        withCredentials: true,
      };
      let headers = {};
      const authStore = useAuthStore();
      if (authStore.token) {
        headers = {
          Authorization: "Bearer " + authStore.token,
        };
      }
      try {
        const response = await Axios(path, {
          method: method,
          baseURL: apiConfig.apiURL,
          data: data,
          timeout: apiConfig.timeout,
          withCredentials: apiConfig.withCredentials,
          headers: headers,
        });
        return response;
      } catch (err) {
        if (err.response && err.response.status) {
          if (err.response.data !== "") {
            err.errorResponseText = err.response.data;
          } else {
            err.errorResponseText = err.response.statusText;
          }
        } else {
          err.errorResponseText = "No server connection";
        }
        throw err;
      }
    }

    app.provide("httpRequest", httpRequest);
    app.provide("serverUrl", serverUrl);
  },
};
