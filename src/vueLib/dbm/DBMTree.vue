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
          @update:expanded="onExpandedChange(expanded)"
          @lazy-load="onLazyLoad"
        >
          <template v-slot:[`default-header`]="props">
            <div
              class="row items-center text-blue"
              @contextmenu.prevent.stop="openSubMenu($event, props.node)"
            >
              <div class="row items-center text-blue"></div>
              <div>{{ props.node.path }}</div>
            </div>
          </template>
        </q-tree>
        <sub-menu ref="subMenuRef"></sub-menu>
      </q-card-section>
      <dataTable class="col-8" />
    </div>
  </q-card>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import {
  type TreeNode,
  dbmData,
  onExpandedChange,
  expanded,
  buildTree,
} from '../../vueLib/dbm/dbmTree';
import DataTable from './DataTable.vue';
import { useNotify } from '../general/useNotify';
import { QCard } from 'quasar';
import { unsubscribe } from '../services/websocket';
import { onBeforeRouteLeave } from 'vue-router';
import SubMenu from './SubMenu.vue';
import { convertToSubscribes, type RawSubs } from '../models/Subscribe';
import { getRequest } from '../models/Request';
import { catchError } from '../models/error';

const { NotifyResponse } = useNotify();
const ZERO_UUID = '00000000-0000-0000-0000-000000000000';

onMounted(() => {
  getRequest('', '.*', 1)
    .then((res) => {
      const test = res;
      if (res) buildTree(convertToSubscribes(test as RawSubs));
    })
    .catch((err) => NotifyResponse(catchError(err), 'error'));
});

onBeforeRouteLeave(() => {
  unsubscribe([{ path: '.*', depth: 0 }]).catch((err) => NotifyResponse(catchError(err), 'error'));
});

function onLazyLoad({
  node,
  done,
  fail,
}: {
  node: TreeNode;
  done: (children: TreeNode[]) => void;
  fail: () => void;
}) {
  getRequest(node.key ?? ZERO_UUID, '', 2)
    .then((resp) => {
      if (resp) done(buildTree(convertToSubscribes(resp as RawSubs)));
      else done([]); // no children returned
    })
    .catch((err) => {
      NotifyResponse(err, 'error');
      fail(); // trigger the fail handler
    });
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
