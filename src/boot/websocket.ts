import { boot } from 'quasar/wrappers';
import type { QVueGlobals } from 'quasar';
import { initWebSocket } from '../vueLib/services/websocket';

export default boot(({ app }) => {
  const $q = app.config.globalProperties.$q as QVueGlobals;

  const ws = initWebSocket(window.location.hostname, 8100, $q);

  app.config.globalProperties.$socket = ws;
  ws.connect();
});

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $socket: {
      connect: () => void;
      close: () => void;
      socket: WebSocket | null;
    };
  }
}
