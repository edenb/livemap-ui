import Axios from 'axios'
import store from '@/store'

const apiConfig = {
  apiURL: (process.env.VUE_APP_SERVER_URL || 'http://localhost:3000') + 
          (process.env.VUE_APP_API_PATH || '/api/v1'),
  timeout: 8000,
  withCredentials: true
}

export default function httpRequest(method, path, data) {
  return new Promise ((resolve, reject) => {
    Axios(path, {
      method: method,
      baseURL: apiConfig.apiURL,
      data: data,
      timeout: apiConfig.timeout,
      withCredentials: apiConfig.withCredentials,
      headers: {
        'content-type': 'application/json',
        'Authorization': 'Bearer ' + store.state.token
      }
    })
    .then((response) => {
      resolve(response);
    })
    .catch((err) => {
      reject(err)
    });
  });
}
