const environment = process.env.REACT_APP_ENV;
const configs = {
  local: {
    apiUrl: "http://localhost:3011",
  },
  staging: {
    apiUrl: "https://stage.faceesign.com/backend",
  },
  production: {
    apiUrl: "https://backend.faceesign.com",
  },
};

export default configs[environment]?.apiUrl;