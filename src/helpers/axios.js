import Axios from "axios";
import store from "@/store";
import Configuration from "@/configuration";

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
  return new Promise((resolve, reject) => {
    Axios(path, {
      method: method,
      baseURL: apiConfig.apiURL,
      data: data,
      timeout: apiConfig.timeout,
      withCredentials: apiConfig.withCredentials,
      headers: {
        "content-type": "application/json",
        Authorization: "Bearer " + store.state.token,
      },
    })
      .then((response) => {
        resolve(response);
      })
      .catch((err) => {
        reject(err);
      });
  });
}
