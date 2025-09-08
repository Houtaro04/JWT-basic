import axios from "axios";
axios.defaults.withCredentials = true; // nếu bạn chuyển sang cookie
// axios.defaults.baseURL = "http://localhost:8000"; // nếu cần

axios.interceptors.request.use((config) => {
  if (config?.data?.password) {
    // nếu bạn có console.debug ở nơi nào đó, hãy log 'copy' đã che
    const copy = { ...config, data: { ...config.data, password: "***" } };
    // console.debug("REQ", copy);
  }
  return config;
});
export default axios;
