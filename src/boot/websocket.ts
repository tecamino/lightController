import { boot } from 'quasar/wrappers';
import type { QVueGlobals } from 'quasar';
import { initWebSocket } from '../vueLib/services/websocket';

export default boot(({ app }) => {
  const $q = app.config.globalProperties.$q as QVueGlobals;
  const host = window.location.hostname;
  const port = 8100;

  const randomId = Math.floor(Math.random() * 10001); // random number from 0 to 10000
  const ws = initWebSocket(`ws://${host}:${port}/ws?id=q${randomId}`, $q);

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
