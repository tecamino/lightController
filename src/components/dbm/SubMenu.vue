<template>
  <q-menu ref="contextMenuRef" context-menu>
    <q-list>
      <q-item clickable v-close-popup @click="handleAction('Add')">
        <q-item-section>Add Datapoint</q-item-section>
      </q-item>
      <q-item
        :class="disable ? 'text-grey-5' : ''"
        :clickable="!disable"
        v-close-popup
        @click="handleAction('Delete')"
      >
        <q-item-section>Delete Datapoint</q-item-section>
      </q-item>
    </q-list>
  </q-menu>
  <AddDialog :dialogLabel="label" width="700px" button-ok-label="Add" ref="addDialog" />
</template>

<script setup lang="ts">
import AddDialog from 'src/components/dialog/AddDatapoint.vue';
import { ref } from 'vue';

const ZERO_UUID = '00000000-0000-0000-0000-000000000000';
const addDialog = ref();
const datapointUuid = ref('');
const contextMenuRef = ref();
const label = ref('');
const disable = ref(false);

function handleAction(action: string) {
  switch (action) {
    case 'Add':
      label.value = 'Add New Datapoint';
      addDialog.value?.open(datapointUuid.value);
      break;
    case 'Delete':
      label.value = 'Remove Datapoint';
      addDialog.value?.open(datapointUuid.value);
      break;
  }
}

const open = (event: MouseEvent, uuid: string) => {
  if (uuid === ZERO_UUID) disable.value = true;
  event.preventDefault();
  datapointUuid.value = uuid;
  contextMenuRef.value?.show(event);
};

defineExpose({ open });
</script>
