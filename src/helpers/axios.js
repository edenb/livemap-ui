import Axios from 'axios'
import store from '@/store'

const apiConfig = {
  //baseURL: process.env.API_URL || '/api/v1',
  apiURL: 'http://localhost:3000/api/v1',
  baseURL: 'http://localhost:3000',
  timeout: 8000,
  withCredentials: false
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
