<template>
  <q-card>
    <q-card-section>
      <div class="text-bold text-primary">Services</div>
    </q-card-section>
    <q-card-section>
      <q-table v-if="driverRows?.length > 0" :rows="driverRows" :columns="columns"> </q-table>
      <div v-else class="q-pa-md text-grey text-center">
        <div>No services available</div>
        <q-btn
          no-caps
          rounded
          color="primary"
          :class="['q-ma-md', 'text-bold', 'text-white']"
          :disable="userStore.user?.role !== 'admin'"
          @click="addNewDriver"
          >Add First Service</q-btn
        >
      </div>
    </q-card-section>
  </q-card>
  <service-dialog ref="refServiceDialog"></service-dialog>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import type { QTableProps } from 'quasar';
import { useUserStore } from 'src/vueLib/login/userStore';
import ServiceDialog from 'src/vueLib/services/dialog/ServiceDialog.vue';

const userStore = useUserStore();
const refServiceDialog = ref();
const driverRows = reactive([]);

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

function addNewDriver() {
  refServiceDialog.value.open();
}
</script>
