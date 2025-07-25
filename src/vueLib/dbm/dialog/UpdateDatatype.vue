<template>
  <DialogFrame ref="Dialog" :width="props.width" :header-title="props.dialogLabel">
    <q-card-section
      v-if="props.dialogLabel"
      class="text-bold text-left q-mb-none q-pb-none"
      :class="'text-' + props.labelColor"
      >DBM:{{ datapoint.path }}
    </q-card-section>
    <q-form ref="datatypeForm" class="q-gutter-md">
      <q-input
        class="q-mt-lg q-mb-none q-pl-md q-mx-lg"
        filled
        dense
        v-model="currentDatatype"
        label="Current Path"
        label-color="primary"
        readonly
      >
      </q-input>
      <q-select
        class="q-mt-lg q-mt-none q-pl-md q-mx-lg"
        popup-content-class="small-dropdown"
        filled
        dense
        v-model="selectedDatatype"
        :options="options"
        option-label="label"
      >
      </q-select>
      <div class="q-mx-sm">
        <q-btn no-caps class="q-mb-xl q-ml-lg q-px-lg" @click="onSubmit" color="primary">{{
          props.buttonOkLabel
        }}</q-btn>
      </div>
    </q-form>
  </DialogFrame>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import DialogFrame from '../../dialog/DialogFrame.vue';
import { useNotify } from '../../general/useNotify';
import { getRequest, setRequest } from 'src/vueLib/models/Request';
import { UpdateTable } from '../updateTable';
import { updateSubscription } from 'src/vueLib/models/Subscriptions';
import { convertToSubscribe } from 'src/vueLib/models/Subscribe';
import { convertFromType } from '../Datapoint';
import { catchError } from 'src/vueLib/models/error';

const { NotifyResponse } = useNotify();
const Dialog = ref();
const datapoint = ref();
const currentDatatype = ref('');
const datatypeForm = ref();
const selectedDatatype = ref({ label: 'None', value: 'NONE' });
const options = [
  { label: 'None', value: 'NONE' },
  { label: 'String (Text)', value: 'STR' },
  { label: 'Bool (On/Off)', value: 'BIT' },
  { label: 'Uint8 (0 - 256)', value: 'BYU' },
  { label: 'Uint16 (0 - 65535)', value: 'WOU' },
  { label: 'Uint32 (0 - 429496...)', value: 'DWU' },
  { label: 'Int8 (-128 - 127)', value: 'BYS' },
  { label: 'Int16 (-32768 -3...)', value: 'WOS' },
  { label: 'Int32 (-21474836...)', value: 'DWS' },
  { label: 'Int64 (-2^63 -(2^...))', value: 'DWS' },
  { label: 'Double (1.7E 1/-3...)', value: 'F64' },
];

const open = async (uuid: string) => {
  await getDatapoint(uuid);
  Dialog.value?.open();
};

async function onSubmit() {
  const success = await datatypeForm.value.validate();
  if (!success) {
    NotifyResponse('Form not validated', 'error');
    return;
  }

  const datatype = options.find((s) => s.label === selectedDatatype.value.label)?.value;
  if (datatype === undefined) return;
  try {
    const response = await setRequest(datapoint.value.path, datatype, datapoint.value.value);
    if (response[0]) updateSubscription(convertToSubscribe(response[0]));
    NotifyResponse(
      'new datatype: ' +
        convertFromType(response[0]?.type ?? '') +
        ' for datapoint :DBM:' +
        response[0]?.path,
    );
    UpdateTable();
    return;
  } catch (err) {
    console.error(err);
  }
}

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
  width: {
    type: String,
    default: '300px',
  },
});

async function getDatapoint(uuid: string) {
  await getRequest(uuid)
    .then((resp) => {
      if (resp[0]) {
        datapoint.value = resp[0];
        const type = options.find((s) => s.value === (resp[0]?.type ?? 'NONE'))?.label ?? 'None';
        currentDatatype.value = type;
        selectedDatatype.value.value = type;
      }
    })
    .catch((err) => NotifyResponse(catchError(err), 'error'));
}

defineExpose({ open });
</script>

<style scope>
.small-dropdown .q-item {
  min-height: 28px; /* default is 48px */
  padding: 4px 8px;
}
</style>
