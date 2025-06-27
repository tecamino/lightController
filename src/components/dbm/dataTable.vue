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
          <span :class="['cursor-pointer', open ? 'text-green' : '']"> {{ props.row.value }}</span>
        </q-td>
      </template>
    </q-table>
    <Dialog dialogLabel="Update Value" :show-dialog="open" />
  </div>
</template>

<script setup lang="ts">
import Dialog from 'src/components/dialog/UpdateValueDialog.vue';
import type { QTableProps } from 'quasar';
import type { Subs, Subscribe } from 'src/models/Subscribe';
import { computed, ref } from 'vue';

const open = ref(false);

// we generate lots of rows here
const props = defineProps<{
  rows: Subs;
}>();

const tableRows = computed(() => [...props.rows]);

const columns = [
  { name: 'path', label: 'Path', field: 'path', align: 'left' },
  {
    name: 'value',
    label: 'Value',
    field: 'value',
    align: 'left',
  },
  {
    name: 'test',
    label: '',
    field: 'test',
    align: 'left',
  },
] as QTableProps['columns'];

function openDialog(item: Subscribe) {
  console.log(77, item);
  open.value = true;
}
</script>
