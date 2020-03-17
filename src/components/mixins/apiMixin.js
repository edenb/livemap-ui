import httpRequest from '@/helpers/axios';

export const apiMixin = {
  data() {
    return {
      response: {},
      errorResponseText: "",
      loading: false,
    }
  },
  created: function () {
    console.log('Axios instance created');
  },
  methods: {
    apiRequest: apiRequest,
    getErrorResponseText: getErrorResponseText,
  }
}

function apiRequest(method, path, data) {
  return new Promise ((resolve, reject) => {
    this.loading = true;
    httpRequest(method, path, data)
      .then((response) => {
        this.errorResponseText = "";
        this.response = response;
        resolve(response);
      })
      .catch((err) => {
        if (err.response && err.response.status) {
          this.errorResponseText = getErrorResponseText(err.response.status);
          if (err.response.status == 401) {
            //this.$store.dispatch('revokeUserToken');
          } 
        } else {
          this.errorResponseText = "No server connection";
        }
        this.response = {}
        reject(err)
      })
      .finally(() => {
        this.loading = false;
      });
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
