import { boot } from 'quasar/wrappers';
import axios from 'axios';

const host = window.location.hostname;
const portDbm = 8100;
const portApp = 9500;

const dbmApi = axios.create({
  baseURL: `http://${host}:${portDbm}`,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

const appApi = axios.create({
  baseURL: `http://${host}:${portApp}/api`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default boot(({ app }) => {
  app.config.globalProperties.$axios = axios;
  app.config.globalProperties.$dbmApi = dbmApi;
  app.config.globalProperties.$appApi = appApi;
});

export { axios, dbmApi, appApi };
