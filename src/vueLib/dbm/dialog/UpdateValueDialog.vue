<template>
  <DialogFrame ref="Dialog" :width="props.width" :header-title="datapoint?.path">
    <q-card-section
      v-if="props.dialogLabel || localDialogLabel"
      class="text-bold text-left q-mb-none q-pb-none"
      :class="'text-' + props.labelColor"
      >{{ props.dialogLabel ? props.dialogLabel : localDialogLabel }}</q-card-section
    >
    <q-card-section v-if="drivers && drivers.length == 0">
      <q-input
        class="q-px-md q-ma-sm"
        label="current value"
        dense
        filled
        readonly
        v-model="inputValue as string | number"
      ></q-input>
      <q-input
        class="q-px-md q-mx-sm"
        label="new value"
        dense
        filled
        :readonly="onlyRead"
        @keyup.enter="write"
        :type="writeType"
        v-model="writeValue as string | number"
      ></q-input>
    </q-card-section>
    <q-card-section v-else>
      <q-table
        flat
        dense
        virtual-scroll
        :rows-per-page-options="[0]"
        :rows="drivers"
        :columns="columns"
      >
      </q-table>
    </q-card-section>
    <q-card-section v-if="props.text" class="text-center" style="white-space: pre-line">{{
      props.text
    }}</q-card-section>
    <q-card-actions align="left" class="text-primary">
      <q-btn v-if="props.buttonCancelLabel" flat :label="props.buttonCancelLabel" v-close-popup>
      </q-btn>
      <q-btn
        class="q-mb-xl q-ml-lg q-mt-none"
        v-if="props.buttonOkLabel"
        color="primary"
        no-caps
        :label="props.buttonOkLabel"
        @click="write"
      >
      </q-btn>
    </q-card-actions>
  </DialogFrame>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import DialogFrame from '../../dialog/DialogFrame.vue';
import type { Subscribe } from '../../models/Subscribe';
import type { Ref } from 'vue';
import { setValues } from '../../services/websocket';
import { useNotify } from '../../general/useNotify';
import type { QTableProps } from 'quasar';
import type { Driver } from '../../models/Drivers';
import { catchError } from 'src/vueLib/models/error';

const { NotifyResponse } = useNotify();
const Dialog = ref();
const writeValue = ref();
const onlyRead = ref(false);
const writeType = ref<'text' | 'number'>('text');

const props = defineProps({
  buttonOkLabel: {
    type: String,
    default: 'OK',
  },
  labelColor: {
    type: String,
    default: 'primary',
  },
  dialogLabel: {
    type: String,
    default: '',
  },
  text: {
    type: String,
    default: '',
  },
  buttonCancelLabel: {
    type: String,
    default: '',
  },
  width: {
    type: String,
    default: '300px',
  },
});

const datapoint = ref();
const inputValue = ref(datapoint?.value);
const localDialogLabel = ref('');
const drivers = ref<Driver[]>([]);
const columns = [
  { name: 'type', label: 'Driver Name', field: 'type', align: 'left' },
  { name: 'bus', label: 'Bus Name', field: 'bus', align: 'center' },
  { name: 'address', label: 'Address', field: 'address', align: 'center' },
] as QTableProps['columns'];

const open = (sub: Ref<Subscribe>, type?: string) => {
  datapoint.value = sub.value;
  if (datapoint.value.rights == 'R') onlyRead.value = true;
  drivers.value = [];
  switch (type) {
    case 'driver':
      localDialogLabel.value = 'Update Drivers';
      if (sub.value.drivers) drivers.value = Object.values(sub.value.drivers);
      writeValue.value = sub.value.drivers;
      break;
    default:
      localDialogLabel.value = 'Update Value';
      if (sub.value.type === 'STR') writeType.value = 'text';
      else if (sub.value.type === 'BIT') writeType.value = 'text';
      else writeType.value = 'number';
      writeValue.value = sub.value.value;
  }
  Dialog.value?.open();
};

watch(
  () => datapoint.value?.value,
  (newVal) => {
    inputValue.value = newVal;
  },
);

function write() {
  setValues([{ uuid: datapoint.value?.uuid ?? '', value: writeValue.value ?? undefined }])
    .then((resp) => {
      if (resp?.set) {
        resp.set.forEach((set) => {
          inputValue.value = set.value;
        });
      }
    })
    .catch((err) => NotifyResponse(catchError(err), 'error'));
}

defineExpose({ open });
</script>

<style scoped>
.outercard {
  border-radius: 10px;
}
</style>
