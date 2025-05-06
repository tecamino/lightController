import { boot } from 'quasar/wrappers';
import type { QVueGlobals } from 'quasar';
import { initWebSocket } from 'src/services/websocket';

export default boot(({ app }) => {
  const $q = app.config.globalProperties.$q as QVueGlobals;

  const ws = initWebSocket('ws://127.0.0.1:8100/ws?id=quasar', $q);
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
