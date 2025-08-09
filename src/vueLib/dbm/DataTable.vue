<template>
  <div class="q-pa-md">
    <q-table
      v-if="tableRows.length > 0"
      style="height: 600px"
      flat
      bordered
      :title="tableRows[0]?.path"
      :rows="tableRows"
      :columns="columns"
      row-key="path"
      virtual-scroll
      :rows-per-page-options="[0]"
    >
      <template v-slot:body-cell-path="props">
        <q-td :props="props" @click="openDialog(props.row, 'rename')">
          <div
            :class="[
              'text-left',
              props.row.path?.split(':')[0] !== 'System' && props.row.path !== 'DBM'
                ? 'cursor-pointer'
                : '',
              'q-mx-sm',
            ]"
          >
            {{ props.row.path?.split(':').pop() ?? '' }}
          </div>
        </q-td>
      </template>
      <template v-slot:body-cell-type="props">
        <q-td :props="props" @click="openDialog(props.row, 'type')">
          <div
            :class="[
              'text-center',
              props.row.path?.split(':')[0] !== 'System' && props.row.path !== 'DBM'
                ? 'cursor-pointer'
                : '',
              'q-mx-sm',
            ]"
          >
            {{ convertFromType(props.row.type) }}
          </div>
        </q-td>
      </template>
      <template v-slot:body-cell-value="props">
        <q-td :props="props" @click="openDialog(props.row, 'value')">
          <div :class="['text-center', 'cursor-pointer', 'q-mx-sm']">
            {{ props.row.value }}
          </div>
        </q-td>
      </template>
      <template v-slot:body-cell-drivers="props">
        <q-td :props="props" @click="openDialog(props.row, 'drivers')">
          <div
            v-if="props.row.type !== 'NONE' || props.row.path?.split(':')[0] !== 'System'"
            :class="['cursor-pointer']"
          >
            <q-icon size="sm" name="cell_tower" :color="props.row.drivers ? 'blue-5' : 'grey-4'" />
          </div>
        </q-td>
      </template>
    </q-table>
    <RenameDialog
      dialogLabel="Rename Datapoint"
      width="400px"
      button-ok-label="Rename"
      ref="renameDialog"
    />
    <UpdateDialog width="400px" button-ok-label="Write" ref="updateDialog" />
    <UpdateDriver width="400px" ref="updateDriverDialog" />
    <UpdateDatatype
      width="400px"
      button-ok-label="Update"
      ref="updateDatatype"
      dialog-label="Update Datatype"
    />
  </div>
</template>

<script setup lang="ts">
import UpdateDialog from './dialog/UpdateValueDialog.vue';
import RenameDialog from './dialog/RenameDatapoint.vue';
import UpdateDatatype from './dialog/UpdateDatatype.vue';
import UpdateDriver from './dialog/UpdateDriverDialog.vue';
import type { QTableProps } from 'quasar';
import type { Subscribe } from '../models/Subscribe';
import { computed, ref } from 'vue';
import { TableSubs } from '../dbm/updateTable';
import { convertFromType } from './Datapoint';

const renameDialog = ref();
const updateDialog = ref();
const updateDriverDialog = ref();
const updateDatatype = ref();

const openDialog = (sub: Subscribe, type?: string) => {
  if (sub.path?.split(':')[0] === 'System' && sub.path !== 'DBM') return;
  switch (type) {
    case 'type':
      updateDatatype.value.open(sub.uuid);
      break;
    case 'rename':
      renameDialog.value.open(sub.uuid);
      break;
    case 'value':
      if (sub.type === 'NONE') return;
      updateDialog.value?.open(ref(sub), type);
      break;
    case 'drivers':
      if (sub.path === 'DBM' || sub.type === 'NONE') return;
      updateDriverDialog.value?.open(sub);
      break;
  }
};

const tableRows = computed(() => [...(TableSubs.value ?? [])]);

const columns = [
  { name: 'path', label: 'Path', field: 'path', align: 'left' },
  {
    name: 'type',
    label: 'Type',
    field: 'type',
    align: 'left',
  },
  {
    name: 'value',
    label: 'Value',
    field: 'value',
    align: 'left',
  },
  {
    name: 'drivers',
    label: 'Drivers',
    field: 'drivers',
    align: 'center',
  },
] as QTableProps['columns'];
</script>
