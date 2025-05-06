import type { Response } from 'src/models/Response';
import type { Publish } from 'src/models/Publish';
import type { Request } from 'src/models/Request';
import type { QVueGlobals } from 'quasar';
import { subs, buildTree, dbmData } from 'src/composables/dbmTree';
import { ref } from 'vue';

const pendingResponses = new Map<string, (data: Response | undefined) => void>();

export let socket: WebSocket | null = null;
const isConnected = ref(false);

export function initWebSocket(url: string, $q?: QVueGlobals) {
  const connect = () => {
    socket = new WebSocket(url);

    socket.onopen = () => {
      console.log('WebSocket connected');
      isConnected.value = true;
    };
    socket.onclose = () => {
      isConnected.value = false;
      console.log('WebSocket disconnected');
      $q?.notify({
        message: 'WebSocket disconnected',
        color: 'orange',
        position: 'bottom-right',
        icon: 'warning',
        timeout: 10000,
      });
    };
    socket.onerror = (err) => {
      console.log(`WebSocket error: ${err.type}`);
      isConnected.value = false;
      $q?.notify({
        message: `WebSocket error: ${err.type}`,
        color: 'red',
        position: 'bottom-right',
        icon: 'error',
        timeout: 10000,
      });
    };
    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      const id = message.id;

      if (id && pendingResponses.has(id)) {
        pendingResponses.get(id)?.(message); // resolve the promise
        pendingResponses.delete(id);
      } else if (message.publish) {
        message.publish.forEach((pub: Publish) => {
          const target = subs.value.find((s) => s.path === pub.path);
          if (target) {
            target.value = pub.value ?? '';
            dbmData.value = buildTree(subs.value);
          }
        });
      } else {
        console.warn('Unmatched message:', message);
      }
    };
  };

  const close = () => {
    if (socket) {
      socket.close();
    }
  };

  // onBeforeUnmount(() => {
  //   close();
  // });

  return {
    connect,
    close,
    socket,
  };
}

function waitForSocketConnection(): Promise<void> {
  return new Promise((resolve, reject) => {
    const maxWait = 5000; // timeout after 5 seconds
    const interval = 50;
    let waited = 0;

    const check = () => {
      if (socket && socket.readyState === WebSocket.OPEN) {
        resolve();
      } else {
        waited += interval;
        if (waited >= maxWait) {
          reject(new Error('WebSocket connection timeout'));
        } else {
          setTimeout(check, interval);
        }
      }
    };

    check();
  });
}

export function send(data: Request): Promise<Response | undefined> {
  const id = generateId();
  const payload = { ...data, id };

  return new Promise((resolve) => {
    pendingResponses.set(id, resolve);

    waitForSocketConnection()
      .then(() => {
        socket?.send(JSON.stringify(payload));
      })
      .catch((err) => {
        console.warn('WebSocket send failed:', err);
        pendingResponses.delete(id);
        resolve(undefined); // or reject(err) if strict failure is desired
      });
  });
}

function generateId(): string {
  return Math.random().toString(36).substr(2, 9); // simple unique ID
}
