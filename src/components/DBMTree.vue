<template>
  <q-card>
    <div class="row">
      <q-card-section class="col-4">
        <q-tree
          class="text-blue text-bold"
          dense
          :nodes="dbmData"
          node-key="key"
          :default-expand-all="true"
        >
          <template v-slot:[`default-header`]="props">
            <div class="row items-center text-blue">
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
              v-if="props.node.value !== undefined"
              v-model="props.node.value"
              class="q-ml-xl bg-grey text-white"
              @save="onValueEdit(props.node)"
            >
              <template v-if="props.node.value !== undefined" v-slot="scope">
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
import { onMounted } from 'vue';
import { useWebSocket } from 'src/composables/useWebSocket';
import type { TreeNode } from 'src/composables/dbmTree';
import { subs, dbmData, buildTree } from 'src/composables/dbmTree';
import { openContextMenu } from 'src/composables/useContextMenu';
import SubMenu from 'src/components/SubMenu.vue';
import { QCard } from 'quasar';

const { connect, send } = useWebSocket('ws://127.0.0.1:8100/ws?id=quasar');

onMounted(() => {
  connect();
  send({
    subscribe: [
      {
        path: '.*',
        depth: 2,
      },
    ],
  })
    .then((response) => {
      if (response?.subscribe) {
        subs.value = response.subscribe;
        dbmData.value = buildTree(subs.value);
      } else {
        console.log('Response from server:', response);
      }
    })
    .catch((err) => {
      console.error('Error fetching data:', err);
    });
});

// function updateValue(uuid: string, newValue: string) {
//   const target = subs.value.find((s) => s.uuid === uuid);
//   if (target) {
//     target.value = newValue;
//     treeData.value = buildTree(subs.value);
//   }
// }

function onValueEdit(node: TreeNode) {
  console.log(88, node.value);

  const sub = subs.value.find((s) => s.path === node.key);
  if (sub) {
    sub.value = node.value;
    send({
      set: [
        {
          path: sub.path ?? '',
          value: Number(node.value),
        },
      ],
    })
      .then((response) => {
        if (response?.subscribe) {
          subs.value = response.subscribe;
          dbmData.value = buildTree(subs.value);
        } else {
          console.log('Response from server:', response);
        }
      })
      .catch((err) => {
        console.error('Error fetching data:', err);
      });
    // Optionally: push to server or log
  }
}
</script>
