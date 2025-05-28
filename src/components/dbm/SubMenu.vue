<template>
  <q-menu ref="contextMenuRef" context-menu>
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
//import { useQuasar } from 'quasar';
//import { NotifyResponse, NotifyError } from 'src/composables/notify';
import { contextMenuState, contextMenuRef } from 'src/composables/dbm/useContextMenu';
//import AddDatapoint from 'src/components/dbm/AddDatapoint.vue';
//import { send } from 'src/services/websocket';

//const $q = useQuasar();

function handleAction(action: string) {
  console.log(`Action '${action}' on node:`, contextMenuState.value);

  // Add your actual logic here
  switch (action) {
    case 'Add':
      // send({
      //   set: [
      //     {
      //       uuid: contextMenuState.value?.key,
      //       path: 'New',
      //       type: 'BIT',
      //       value: true,
      //       create: true,
      //     },
      //   ],
      // })
      //   .then((response) => {
      //     if (response?.set) {
      //       console.log(response);
      //     } else {
      //       NotifyResponse($q, response);
      //     }
      //   })
      //   .catch((err) => {
      //     NotifyError($q, err);
      //   });
      console.log(4);
  }
}
</script>
