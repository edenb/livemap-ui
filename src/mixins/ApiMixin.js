import httpRequest from "@/helpers/axios.js";

export const ApiMixin = {
  data() {
    return {
      response: {},
      errorResponseText: "",
      loading: false,
    };
  },
  created: function () {
    console.log("Axios instance created");
  },
  methods: {
    apiRequest: apiRequest,
  },
};

function apiRequest(method, path, data) {
  return new Promise((resolve, reject) => {
    this.loading = true;
    httpRequest(method, path, data)
      .then((response) => {
        this.errorResponseText = "";
        this.response = response;
        resolve(response);
      })
      .catch((err) => {
        if (err.response && err.response.status) {
          if (err.response.data !== "") {
            this.errorResponseText = err.response.data;
          } else {
            this.errorResponseText = err.response.statusText;
          }
        } else {
          this.errorResponseText = "No server connection";
        }
        this.response = {};
        reject(err);
      })
      .finally(() => {
        this.loading = false;
      });
  });
}
