<template>
  <q-card>
    <div class="row">
      <q-card-section class="col-4 scroll tree-container">
        <q-tree
          class="text-blue text-bold"
          dense
          :nodes="dbmData"
          node-key="key"
          no-transition
          :default-expand-all="false"
          v-model:expanded="expanded"
          @update:expanded="onExpandedChange"
          @lazy-load="onLazyLoad"
        >
          <template v-slot:[`default-header`]="props">
            <div
              class="row items-center text-blue"
              @contextmenu.prevent.stop="openContextMenu($event, props.node)"
            >
              <div class="row items-center text-blue"></div>
              <div>{{ props.node.path }}</div>
            </div>
            <q-popup-edit
              v-if="props.node.value !== undefined && props.node.value !== ''"
              v-model="props.node.value"
              class="q-ml-xl bg-grey text-white"
              @save="(val) => onValueEdit(val, props.node)"
            >
              <template v-slot="scope">
                <q-input
                  dark
                  color="white"
                  v-model="scope.value"
                  dense
                  autofocus
                  counter
                  @keyup.enter="scope.set"
                >
                  <template v-slot:append>
                    <q-icon name="edit" />
                  </template>
                </q-input>
              </template>
            </q-popup-edit>
          </template>
        </q-tree>
        <sub-menu :node="selectedNode"></sub-menu>
      </q-card-section>
      <DataTable :rows="Subscriptions" class="col-8" />
    </div>
  </q-card>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import DataTable from './dataTable.vue';
import type { TreeNode } from 'src/composables/dbm/dbmTree';
import {
  dbmData,
  buildTree,
  getSubscriptionsByUuid,
  addChildrentoTree,
  getAllSubscriptions,
} from 'src/composables/dbm/dbmTree';
import { useQuasar } from 'quasar';
import { openContextMenu } from 'src/composables/dbm/useContextMenu';
import { NotifyResponse } from 'src/composables/notify';
import SubMenu from 'src/components/dbm/SubMenu.vue';
import { QCard } from 'quasar';
import { subscribe, unsubscribe, setValues } from 'src/services/websocket';
import { onBeforeRouteLeave } from 'vue-router';
import { api } from 'boot/axios';
import type { Subs } from 'src/models/Subscribe';
import { reactive } from 'vue';

const $q = useQuasar();
const expanded = ref<string[]>([]);
const selectedNode = ref<TreeNode | null>(null);
const ZERO_UUID = '00000000-0000-0000-0000-000000000000';
const Subscriptions = reactive<Subs>([]);
let lastExpanded: string[] = [];

onMounted(() => {
  const payload = {
    get: [
      {
        path: '.*',
        query: { depth: 1 },
      },
    ],
  };
  api
    .post('/json_data', payload)
    .then((res) => {
      if (res.data.get) {
        dbmData.splice(0, dbmData.length, ...buildTree(res.data.get));
      }
    })
    .catch((err) => {
      NotifyResponse($q, err, 'error');
    });
});

onBeforeRouteLeave(() => {
  unsubscribe([
    {
      path: '.*',
      depth: 0,
    },
  ]).catch((err) => {
    NotifyResponse($q, err, 'error');
  });
});

function onLazyLoad({
  node,
  done,
  fail,
}: {
  node: TreeNode;
  done: (children: TreeNode[]) => void;
  fail: () => void;
}): void {
  //first unsubsrice nodes
  unsubscribe([
    {
      path: '.*',
      depth: 0,
    },
  ])
    .then(() => {
      Subscriptions.length = 0;
    })
    .catch((err) => {
      NotifyResponse($q, err, 'error');
    });

  // now subscribe nodes
  subscribe([
    {
      uuid: node.key ?? ZERO_UUID,
      path: '',
      depth: 2,
    },
  ])
    .then((resp) => {
      if (resp?.subscribe) {
        // Optional: update your internal store too
        addChildrentoTree(resp?.subscribe);

        const toRemove = new Set(
          resp.subscribe.filter((sub) => sub.uuid !== ZERO_UUID).map((sub) => sub.uuid),
        );

        Subscriptions.splice(
          0,
          Subscriptions.length,
          ...getAllSubscriptions().filter((sub) => toRemove.has(sub.uuid)),
        );

        done(dbmData);
      } else {
        done([]); // no children returned
      }
    })
    .catch((err) => {
      NotifyResponse($q, err, 'error');
      fail(); // trigger the fail handler
    });
}

function onValueEdit(newValue: undefined, node: TreeNode) {
  console.log(node.value, node.value === undefined);
  if (!node.key) return;
  const sub = getSubscriptionsByUuid(node.key);
  if (sub) {
    setValues([
      {
        path: sub.value?.path ?? '',
        value: newValue,
      },
    ]).catch((err) => {
      NotifyResponse($q, err, 'error');
    });
  }
}

function onExpandedChange(newExpanded: readonly string[]) {
  const collapsed = lastExpanded.filter((k) => !newExpanded.includes(k));
  const newlyExpanded = newExpanded.filter((k) => !lastExpanded.includes(k));

  if (collapsed.length) {
    collapsed.forEach((key: string) => {
      subscribe([
        {
          uuid: key,
          path: '',
          depth: 2,
        },
      ])
        .then((resp) => {
          if (resp?.subscribe) {
            // Optional: update your internal store too
            addChildrentoTree(resp?.subscribe);

            const toRemove = new Set(
              resp.subscribe.filter((sub) => sub.uuid !== ZERO_UUID).map((sub) => sub.uuid),
            );

            Subscriptions.splice(
              0,
              Subscriptions.length,
              ...getAllSubscriptions().filter((sub) => toRemove.has(sub.uuid)),
            );
          }
        })
        .catch((err) => {
          NotifyResponse($q, err, 'error');
        });
    });
  } else if (newlyExpanded.length) {
    newlyExpanded.forEach((key: string) => {
      subscribe([
        {
          uuid: key,
          path: '',
          depth: 2,
        },
      ])
        .then((resp) => {
          if (resp?.subscribe) {
            // Optional: update your internal store too
            addChildrentoTree(resp?.subscribe);

            const toRemove = new Set(
              resp.subscribe.filter((sub) => sub.uuid !== ZERO_UUID).map((sub) => sub.uuid),
            );

            Subscriptions.splice(
              0,
              Subscriptions.length,
              ...getAllSubscriptions().filter((sub) => toRemove.has(sub.uuid)),
            );
          }
        })
        .catch((err) => {
          NotifyResponse($q, err, 'error');
        });
    });
  }

  lastExpanded = [...newExpanded];
}
</script>

<style scoped>
.tree-container {
  overflow-y: auto;
}

@media (max-width: 599px) {
  .tree-container {
    max-height: 50vh;
  }
}
@media (min-width: 600px) and (max-width: 1023px) {
  .tree-container {
    max-height: 60vh;
  }
}
@media (min-width: 1024px) and (max-width: 1439px) {
  .tree-container {
    max-height: 70vh;
  }
}
@media (min-width: 1440px) and (max-width: 1919px) {
  .tree-container {
    max-height: 80vh;
  }
}
@media (min-width: 1920px) {
  .tree-container {
    max-height: 90vh;
  }
}
</style>
