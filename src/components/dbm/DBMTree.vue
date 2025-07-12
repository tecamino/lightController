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
              @contextmenu.prevent.stop="openSubMenu($event, props.node.key)"
            >
              <div class="row items-center text-blue"></div>
              <div>{{ props.node.path }}</div>
            </div>
          </template>
        </q-tree>
        <!-- not implemented yet <sub-menu ref="subMenuRef"></sub-menu> -->
      </q-card-section>
      <dataTable class="col-8" :rows="getRows()" />
    </div>
  </q-card>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import {
  type TreeNode,
  buildTree,
  dbmData,
  removeSubtreeByParentKey,
} from 'src/composables/dbm/dbmTree';
import DataTable from './DataTable.vue';
import { useQuasar } from 'quasar';
import { NotifyResponse } from 'src/composables/notify';
import { QCard } from 'quasar';
import { subscribe, unsubscribe } from 'src/services/websocket';
import { onBeforeRouteLeave } from 'vue-router';
import { api } from 'boot/axios';
// not implemented yet import SubMenu from './SubMenu.vue';
import { type Subs, type RawSubs, convertToSubscribes } from 'src/models/Subscribe';
import { addSubscriptions, getRows, removeAllSubscriptions } from 'src/models/Subscriptions';

const $q = useQuasar();
const expanded = ref<string[]>([]);
const ZERO_UUID = '00000000-0000-0000-0000-000000000000';
let lastExpanded: string[] = [];
const postQuery = '/json_data';

onMounted(() => {
  api
    .post(postQuery, { get: [{ path: '.*', query: { depth: 1 } }] })
    .then((res) => {
      if (res.data.get) buildTree(convertToSubscribes(res.data.get as RawSubs));
    })
    .catch((err) => NotifyResponse($q, err, 'error'));
});

onBeforeRouteLeave(() => {
  unsubscribe([{ path: '.*', depth: 0 }]).catch((err) => NotifyResponse($q, err, 'error'));
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
  api
    .post(postQuery, { get: [{ uuid: node.key ?? ZERO_UUID, path: '', query: { depth: 2 } }] })
    .then((resp) => {
      if (resp?.data.get) done(buildTree(convertToSubscribes(resp?.data.get as RawSubs)));
      else done([]); // no children returned
    })
    .catch((err) => {
      NotifyResponse($q, err, 'error');
      fail(); // trigger the fail handler
    });
}

async function onExpandedChange(newExpanded: readonly string[]) {
  const collapsed = lastExpanded.filter((k) => !newExpanded.includes(k));
  const newlyExpanded = newExpanded.filter((k) => !lastExpanded.includes(k));

  try {
    await unsubscribe([{ path: '.*', depth: 0 }])
      .then(() => {
        removeAllSubscriptions();
      })
      .catch((err) => NotifyResponse($q, err, 'error'));

    if (collapsed.length) {
      collapsed.forEach((key) => {
        removeSubtreeByParentKey(key);
        api
          .post(postQuery, { get: [{ uuid: key, path: '', query: { depth: 2 } }] })
          .then((resp) => {
            if (resp?.data.get) {
              buildTree(resp?.data.get as Subs);
              subscribe([{ uuid: key, path: '', depth: 2 }]).catch((err) =>
                NotifyResponse($q, err, 'error'),
              );
              addSubscriptions(resp?.data.get as RawSubs);
            }
          })
          .catch((err) => NotifyResponse($q, err, 'error'));
      });
    }
    if (newlyExpanded.length) {
      newlyExpanded.forEach((key) => {
        api
          .post(postQuery, { get: [{ uuid: key, path: '', query: { depth: 2 } }] })
          .then((resp) => {
            if (resp?.data.get) {
              buildTree(resp?.data.get as Subs);
              subscribe([{ uuid: key, path: '', depth: 2 }]).catch((err) =>
                NotifyResponse($q, err, 'error'),
              );
              addSubscriptions(resp?.data.get as RawSubs);
            }
          })
          .catch((err) => NotifyResponse($q, err, 'error'));
      });
    }

    lastExpanded = [...newExpanded];
  } catch {
    console.error('error in expand function');
  }
}

const subMenuRef = ref();

function openSubMenu(event: MouseEvent, uuid: string) {
  subMenuRef.value?.open(event, uuid);
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
