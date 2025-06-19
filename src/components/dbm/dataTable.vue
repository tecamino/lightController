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
    />
  </div>
</template>

<script setup lang="ts">
import type { QTableProps } from 'quasar';
import type { Subs } from 'src/models/Subscribe';
import { computed } from 'vue';

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
] as QTableProps['columns'];
</script>
