import Axios from 'axios'

export const axiosMixin = {
  data() {
    return {
      response: "",
      error: "",
      errorResponseText: "",
      loading: false,
    }
  },
  created: function () {
    //console.log('Axios instance created');
  },
  methods: {
    getAutorization: getAutorization,
    apiLogin: apiLogin,
    apiLogout: apiLogout,
    apiRequest: apiRequest
  }
}

const apiConfig = {
  baseURL: '/api/v1',
  timeout: 8000,
}

function apiLogin(path, data) {
  this.loading = true;
  this.errorResponseText = "";
  Axios(path, {
    method: 'post',
    baseURL: apiConfig.baseURL,
    data: data,
    timeout: apiConfig.timeout,
    headers: {
      'content-type': 'application/json'
    }
  })
  .then((response) => {
    this.loading = false;
    let token = response.data.access_token;
    localStorage.setItem("jwt", token);
    if (token) {
      this.$router.push("/worldmap");
    }
  })
  .catch((err) => {
    this.loading = false;
    if (err.response && err.response.status) {
      this.errorResponseText = getErrorResponseText(err.response.status);
      if (err.response.status == 401) {
        localStorage.removeItem("jwt");
      } 
    } else {
      this.errorResponseText = "No server connection";
    }
  });
}

function apiLogout() {
  localStorage.removeItem("jwt");
  this.$router.push("/");
}

function apiRequest(method, path, data) {
  this.loading = true;
  this.errorResponseText = "";
  Axios(path, {
    method: method,
    baseURL: apiConfig.baseURL,
    data: data,
    timeout: apiConfig.timeout,
    headers: {
      'content-type': 'application/json',
      'Authorization': 'Bearer ' + localStorage.getItem('jwt')
    }
  })
  .then((response) => {
    this.loading = false;
    this.response = response;
  })
  .catch((err) => {
    this.loading = false;
    this.error = err;
  });
}

function getErrorResponseText(status) {
  let errorResponseText = "";
  switch(status) {
    case 401:
      errorResponseText = "Login failed"
      break;
    default:
      errorResponseText = "Server busy";
  }
  return errorResponseText;
}

function getAutorization() {
  // Only return authorization if present in local storage
  let authHeaderField = '';
  if (localStorage.getItem('jwt')) {
    authHeaderField = 'Bearer ' + localStorage.getItem('jwt');
  }
  return authHeaderField;
}
