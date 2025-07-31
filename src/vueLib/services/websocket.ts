import type { Response } from '../models/Response';
import { publishToSubscriptions } from '../models/Publish';
import type { Request } from '../models/Request';
import type { QVueGlobals } from 'quasar';
import { ref } from 'vue';
import { type Subs } from '../models/Subscribe';
import type { Sets } from '../models/Set';
import { addRawSubscriptions } from '../models/Subscriptions';
const pendingResponses = new Map<string, (data: Response | undefined) => void>();

export let socket: WebSocket | null = null;

const isConnected = ref(false);

export function initWebSocket(host: string, port: number = 8100, $q?: QVueGlobals) {
  const randomId = Math.floor(Math.random() * 10001); // random number from 0 to 10000

  const connect = () => {
    socket = new WebSocket(`ws://${host}:${port}/ws?id=q${randomId}`);

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
      if (typeof event.data === 'string') {
        const message = JSON.parse(event.data);

        const id = message.id;
        if (id && pendingResponses.has(id)) {
          pendingResponses.get(id)?.(message); // resolve the promise
          pendingResponses.delete(id);
          return;
        }

        if (message.publish) {
          publishToSubscriptions(message.publish);
        }
      }
    };
  };

  const close = () => {
    if (socket) {
      socket.close();
    }
  };

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

export function subscribeToPath(
  NotifyResponse: (
    resp: Response | string | undefined,
    type?: 'warning' | 'error',
    timeout?: 5000,
  ) => void,
  path: string,
) {
  subscribe([
    {
      path: path,
      depth: 0,
    },
  ])
    .then((response) => {
      if (response?.subscribe) {
        addRawSubscriptions(response.subscribe);
      } else {
        NotifyResponse(response);
      }
    })
    .catch((err) => {
      NotifyResponse(err, 'error');
    });
}

export function subscribe(data: Subs): Promise<Response | undefined> {
  return send({ subscribe: data });
}

export function unsubscribe(data: Subs): Promise<Response | undefined> {
  return send({ unsubscribe: data });
}

export function setValues(data: Sets): Promise<Response | undefined> {
  return send({ set: data });
}

function send(data: Request): Promise<Response | undefined> {
  const id = Math.random().toString(36).substring(2, 9); // simple unique ID;
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
