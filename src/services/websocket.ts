import type { Response } from 'src/models/Response';
import { publishToSubscriptions } from 'src/models/Publish';
import type { Request } from 'src/models/Request';
import type { QVueGlobals } from 'quasar';
import { ref } from 'vue';
import { NotifyResponse } from 'src/composables/notify';
import { type Subs } from 'src/models/Subscribe';
import type { Sets } from 'src/models/Set';
import type { PongMessage } from 'src/models/Pong';
import { addSubscriptions } from 'src/models/Subscriptions';
const pendingResponses = new Map<string, (data: Response | undefined) => void>();
//const lastKnownValues: Record<string, string> = reactive({});

export let socket: WebSocket | null = null;
const isConnected = ref(false);
let lastPongTime = Date.now();

function pingLoop(interval: number = 5000) {
  // Start sending ping every 5 seconds
  setInterval(() => {
    if (!socket || socket.readyState !== WebSocket.OPEN) return;

    // If no pong received in last 10 seconds, close
    if (Date.now() - lastPongTime > interval + 10000) {
      console.warn('No pong response, closing socket...');
      socket.close();
      return;
    }
    socket.send(JSON.stringify({ type: 'ping' }));
  }, interval);
}

function isPong(msg: PongMessage | undefined | null) {
  if (msg?.type === 'pong') {
    lastPongTime = Date.now();
    return true;
  }
  return false;
}

export function initWebSocket(url: string, $q?: QVueGlobals) {
  const connect = () => {
    socket = new WebSocket(url);

    socket.onopen = () => {
      console.log('WebSocket connected');
      isConnected.value = true;
      // Start sending ping every 5 seconds
      pingLoop(5000);
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

        // Handle pong
        if (isPong(message)) return;

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

export function subscribeToPath(q: QVueGlobals, path: string) {
  subscribe([
    {
      path: path,
      depth: 0,
    },
  ])
    .then((response) => {
      if (response?.subscribe) {
        addSubscriptions(response.subscribe);
      } else {
        NotifyResponse(q, response);
      }
    })
    .catch((err) => {
      NotifyResponse(q, err, 'error');
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
