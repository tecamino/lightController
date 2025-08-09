<template>
  <DialogFrame ref="refDialog" width="500px" header-title="Add new Service">
    <div class="row justify-center">
      <q-select class="col-4" :options="opts" v-model="option"></q-select>
    </div>
    <!-- <q-table :rows="driverRows"> </q-table> -->
  </DialogFrame>
</template>

<script setup lang="ts">
import DialogFrame from 'src/vueLib/dialog/DialogFrame.vue';
import { ref } from 'vue';
import { useNotify } from 'src/vueLib/general/useNotify';
import { appApi } from 'src/boot/axios';

const { NotifyResponse } = useNotify();

const refDialog = ref();
const driverRows = ref([]);
const opts = ref();
const option = ref('Choose new service');

interface conf {
  name: string;
}
function open() {
  appApi
    .get('/allDrivers')
    .then((resp) => {
      driverRows.value = resp.data;
      opts.value = resp.data.map((item: conf) => item.name);
    })
    .catch((err) => NotifyResponse(err, 'error'));
  refDialog.value.open();
}

defineExpose({ open });
</script>
