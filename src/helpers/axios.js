import Axios from "axios";
import { useAuthStore } from "@/store.js";
import Configuration from "@/configuration.js";

const serverUrl =
  Configuration.value("envServerUrl") || "http://localhost:3000";
const apiPath = Configuration.value("envApiPath") || "/api/v1";

const apiConfig = {
  apiURL: serverUrl + apiPath,
  timeout: 30000,
  withCredentials: true,
};

export function getServerUrl() {
  return serverUrl;
}

export default function httpRequest(method, path, data) {
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
        reject(err);
      });
  });
}
