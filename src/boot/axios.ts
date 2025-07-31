import { boot } from 'quasar/wrappers';
import axios from 'axios';

const host = window.location.hostname;
const port = 8100;

const api = axios.create({
  baseURL: `http://${host}:${port}`,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default boot(({ app }) => {
  app.config.globalProperties.$axios = axios;
  app.config.globalProperties.$api = api;
});

export { axios, api };
