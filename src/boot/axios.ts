import { boot } from 'quasar/wrappers';
import axios from 'axios';

const host = window.location.hostname;
const port = 8100;
const baseURL = `http://${host}:${port}`;

const api = axios.create({
  baseURL: baseURL,
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
