<template>
  <div class="q-pa-md">
    <q-table
      v-if="props.rows.length > 0"
      style="height: 600px"
      flat
      bordered
      :title="props.rows[0]?.path"
      :rows="props.rows ?? []"
      :columns="columns"
      row-key="path"
      virtual-scroll
      :rows-per-page-options="[0]"
    />
  </div>
</template>

<script setup lang="ts">
import type { QTableProps } from 'quasar';
import type { Subscribe } from 'src/models/Subscribe';

// we generate lots of rows here
const props = defineProps<{
  rows: Subscribe[];
}>();

const columns = [
  { name: 'path', label: 'Path', field: 'path', align: 'left' },
  {
    name: 'value',
    label: 'Value',
    field: 'value',
    align: 'left',
  },
] as QTableProps['columns'];
</script>
