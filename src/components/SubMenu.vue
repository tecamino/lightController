<template>
  <q-menu v-model="contextMenu.show" :offset="[contextMenu.x, contextMenu.y]" context-menu>
    <q-list>
      <q-item clickable v-close-popup @click="handleAction('Add')">
        <q-item-section>Add Datapoint</q-item-section>
      </q-item>
      <q-item clickable v-close-popup @click="handleAction('Delete')">
        <q-item-section>Delete Datapoint</q-item-section>
      </q-item>
    </q-list>
  </q-menu>
</template>

<script setup lang="ts">
import { contextMenu } from 'src/composables/useContextMenu';
import { send } from 'src/services/websocket';

function handleAction(action: string) {
  console.log(`Action '${action}' on node:`, contextMenu.value.node);

  // Add your actual logic here
  switch (action) {
    case 'Add':
      console.log(2);
      send({
        get: [
          {
            path: '.*',
            query: {
              depth: 1,
            },
          },
        ],
      })
        .then((response) => {
          if (response?.get) {
            console.log(response);
          } else {
            console.log('Response from server:', response);
          }
        })
        .catch((err) => {
          console.error('Error fetching data:', err);
        });
      console.log(4);
  }
}
</script>
