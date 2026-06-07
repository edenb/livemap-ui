import Axios from "axios";
import { useAuthStore } from "@/store.js";

const defaults = { serverUrl: "http://localhost:3000", apiPath: "/api/v1" };

let axiosConf = { ...defaults };

export async function httpRequest(method, path, data) {
  const apiConfig = {
    apiURL: axiosConf.serverUrl + axiosConf.apiPath,
    timeout: 30000,
    withCredentials: true,
  };
  let headers = {};
  const authStore = useAuthStore();
  if (authStore.token) {
    headers = { Authorization: `Bearer ${authStore.token}` };
  }
  try {
    const response = await Axios(path, {
      method,
      baseURL: apiConfig.apiURL,
      data,
      timeout: apiConfig.timeout,
      withCredentials: apiConfig.withCredentials,
      headers,
    });
    return response;
  } catch (err) {
    if (err.response) {
      err.httpError = {
        message:
          err.response.data.message ||
          err.response.data.statusText ||
          "Unknown error",
        code: err.response.data.statusCode,
      };
      if (err.response.data.errors) {
        err.httpError.errors = err.response.data.errors;
      }
    } else if (err.request) {
      err.httpError = { message: "No server connection" };
    } else {
      err.httpError = { message: "Request failed" };
    }
    throw err;
  }
}

export default {
  install: (app, { serverUrl, apiPath }) => {
    axiosConf = { ...defaults, ...{ serverUrl, apiPath } };
    app.provide("serverUrl", serverUrl);
  },
};
