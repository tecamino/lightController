<template>
  <div class="q-pa-md">
    <q-table
      v-if="tableRows.length > 0"
      style="height: 600px"
      flat
      bordered
      :title="props.rows[0]?.path"
      :rows="rows"
      :columns="columns"
      row-key="path"
      virtual-scroll
      :rows-per-page-options="[0]"
    >
      <template v-slot:body-cell-value="props">
        <q-td :props="props" @click="openDialog(props.row)">
          <div :class="['cursor-pointer', 'q-mx-sm']">
            {{ props.row.value }}
          </div>
        </q-td>
      </template>
      <template v-slot:body-cell-drivers="props">
        <q-td :props="props" @click="openDialog(props.row, 'driver')">
          <div v-if="props.row.type !== 'none'" :class="['cursor-pointer']">
            <q-icon size="sm" name="cell_tower" :color="props.row.drivers ? 'blue-5' : 'grey-4'" />
          </div>
        </q-td>
      </template>
    </q-table>
    <UpdateDialog
      dialogLabel="Update Value"
      width="400px"
      button-ok-label="Write"
      ref="updateDialog"
      v-model:datapoint="dialogValue"
    />
  </div>
</template>

<script setup lang="ts">
import UpdateDialog from 'src/components/dialog/UpdateValueDialog.vue';
import type { QTableProps } from 'quasar';
import type { Subscribe } from 'src/models/Subscribe';
import { computed, ref } from 'vue';
import type { Subs } from 'src/models/Subscribe';

const updateDialog = ref();
const dialogValue = ref();

const openDialog = (sub: Subscribe, type?: string) => {
  updateDialog.value?.open(sub, type);
};

// we generate lots of rows here
const props = defineProps<{
  rows: Subs;
}>();

const tableRows = computed(() => [...props.rows]);

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
  // {.   not implemented yet
  //   name: 'drivers',
  //   label: 'Drivers',
  //   field: 'drivers',
  //   align: 'center',
  // },
] as QTableProps['columns'];
</script>
