import Axios from "axios";
import { useAuthStore } from "@/store.js";

const defaults = { serverUrl: "http://localhost:3000", apiPath: "/api/v1" };

export default {
  install: (app, { serverUrl, apiPath }) => {
    const axiosConf = {
      ...defaults,
      ...{ serverUrl, apiPath },
    };

    const httpRequest = function (method, path, data) {
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
      return new Promise((resolve, reject) => {
        Axios(path, {
          method: method,
          baseURL: apiConfig.apiURL,
          data: data,
          timeout: apiConfig.timeout,
          withCredentials: apiConfig.withCredentials,
          headers: headers,
        })
          .then((response) => {
            resolve(response);
          })
          .catch((err) => {
            if (err.response && err.response.status) {
              if (err.response.data !== "") {
                err.errorResponseText = err.response.data;
              } else {
                err.errorResponseText = err.response.statusText;
              }
            } else {
              err.errorResponseText = "No server connection";
            }
            reject(err);
          });
      });
    };

    app.provide("httpRequest", httpRequest);
    app.provide("serverUrl", serverUrl);
  },
};
