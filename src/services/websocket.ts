import type { Response } from 'src/models/Response';
import type { Publish } from 'src/models/Publish';
import type { Request } from 'src/models/Request';
import type { QVueGlobals } from 'quasar';
import {
  getAllSubscriptions,
  buildTree,
  dbmData,
  getSubscriptionsByUuid,
} from 'src/composables/dbm/dbmTree';
import { ref, reactive } from 'vue';
import type { Subs } from 'src/models/Subscribe';
import type { Sets } from 'src/models/Set';

const pendingResponses = new Map<string, (data: Response | undefined) => void>();
export const lastKnownValues = reactive(new Map<string, string>());

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
        return;
      }

      if (message.publish) {
        let changed = false;

        (message.publish as Publish[]).forEach((pub) => {
          const uuid = pub.uuid;
          const value = pub.value ?? '';

          if (uuid === undefined) {
            return;
          }

          const oldValue = lastKnownValues.get(String(uuid));
          if (oldValue !== value) {
            lastKnownValues.set(uuid, value); // this is now reactive

            const existing = getSubscriptionsByUuid(pub.uuid);
            if (existing) {
              existing.value = value;
            } else {
              getAllSubscriptions()?.push({ value, uuid: uuid });
            }

            changed = true;
          }
        });

        if (changed) {
          dbmData.value = buildTree(getAllSubscriptions()); // rebuild reactive tree
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
