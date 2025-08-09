import { boot } from 'quasar/wrappers';
import { createPinia } from 'pinia';
import { useUserStore } from 'src/vueLib/login/userStore';
import type { QVueGlobals } from 'quasar';

export default boot(({ app }) => {
  const $q = app.config.globalProperties.$q as QVueGlobals;
  const pinia = createPinia();
  app.use(pinia);
  const useStore = useUserStore();
  useStore.initStore($q);
  useStore.loadFromStorage();
});
