<template>
  <q-card>
    <div class="row">
      <q-card-section class="col-4">
        <q-tree
          class="text-blue text-bold"
          dense
          :nodes="dbmData"
          node-key="key"
          :default-expand-all="false"
          v-model:expanded="expanded"
        >
          <template v-slot:[`default-header`]="props">
            <div class="row items-center text-blue" @click="ClickNode(props.node)">
              <div
                class="row items-center text-blue"
                @contextmenu.prevent="openContextMenu($event, props.node)"
              ></div>
              <div>{{ props.node.path }}</div>
              <q-input
                v-if="props.node.value !== undefined"
                v-model="props.node.value"
                dense
                borderless
                class="q-ml-sm"
              />
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
        <sub-menu></sub-menu>
      </q-card-section>
      <q-card-section class="col-8 text-center"> Test </q-card-section>
    </div>
  </q-card>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import type { TreeNode } from 'src/composables/dbmTree';
import {
  dbmData,
  buildTree,
  // addChildrentoTree,
  getSubscriptionsByUuid,
  addChildrentoTree,
  removeSubtreeByParentKey,
} from 'src/composables/dbmTree';
import { openContextMenu } from 'src/composables/useContextMenu';
import SubMenu from 'src/components/SubMenu.vue';
import { QCard } from 'quasar';
import { send } from 'src/services/websocket';
import { onBeforeRouteLeave } from 'vue-router';

onMounted(() => {
  send({
    subscribe: [
      {
        path: '.*',
        depth: 1,
      },
    ],
  })
    .then((response) => {
      if (response?.subscribe) {
        dbmData.value = buildTree(response.subscribe ?? []);
      }
    })
    .catch((err) => {
      console.error('Error fetching data:', err);
    });
});

onBeforeRouteLeave((to, from, next) => {
  send({
    unsubscribe: [
      {
        path: '.*',
        depth: 0,
      },
    ],
  })
    .then((response) => {
      if (response?.subscribe) {
        dbmData.value = buildTree(response.subscribe ?? []);
      }
    })
    .catch((err) => {
      console.error('Error fetching data:', err);
    });
  next();
});

const expanded = ref<string[]>([]);

function ClickNode(node: TreeNode) {
  if (node.key === 'DBM') return;

  const nodeKey = node.key as string;

  const isExpanded = expanded.value.includes(nodeKey);

  if (isExpanded) {
    // Collapse the parent node and its children
    //expanded.value = expanded.value.filter((k) => k !== nodeKey && !k.startsWith(nodeKey));

    // 2. Send unsubscribe request
    send({
      unsubscribe: [
        {
          uuid: nodeKey,
          path: '.*',
          depth: 0,
        },
      ],
    })
      .then((response) => {
        if (response?.unsubscribe) {
          removeSubtreeByParentKey(nodeKey);
        }
        requestAnimationFrame(() => {
          expanded.value = expanded.value.filter((k) => k !== nodeKey && !k.startsWith(nodeKey));
        });
      })
      .catch((err) => {
        console.error('Error during unsubscribe:', err);
      });

    // 3. Do not continue further — important!
    return;
  }

  // 4. If not expanded, send subscribe and expand
  send({
    subscribe: [
      {
        uuid: nodeKey,
        path: '.*',
        depth: 1,
      },
    ],
  })
    .then((response) => {
      if (response?.subscribe) {
        addChildrentoTree(response.subscribe);

        // Delay to ensure reactive updates apply cleanly
        requestAnimationFrame(() => {
          if (!expanded.value.includes(nodeKey)) {
            expanded.value.push(nodeKey);
          }
        });
      }
    })
    .catch((err) => {
      console.error('Error during subscribe:', err);
    });
}

function onValueEdit(newValue: undefined, node: TreeNode) {
  console.log(node.value, node.value === undefined);
  const sub = getSubscriptionsByUuid(node.key);
  if (sub) {
    send({
      set: [
        {
          path: sub.path ?? '',
          value: newValue,
        },
      ],
    }).catch((err) => {
      console.error('Error fetching data:', err);
    });
  }
}
</script>
