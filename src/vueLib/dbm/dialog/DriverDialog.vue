<template>
  <DialogFrame ref="Dialog" :width="props.width" :header-title="localDialogLabel">
    <q-card-section
      v-if="props.dialogLabel || localDialogLabel"
      class="text-bold text-left q-mb-none q-pb-none"
      :class="'text-' + props.labelColor"
      >{{ props.dialogLabel || localDialogLabel }}</q-card-section
    >
    <q-card-section v-if="props.text" class="text-center" style="white-space: pre-line">{{
      props.text
    }}</q-card-section>
    <q-form ref="form">
      <q-card-section class="q-gutter-xs row q-col-gutter-xs">
        <div>
          <q-select
            class="col-8"
            filled
            label="Driver Name"
            type="text"
            name="Type"
            dense
            :options="options"
            :rules="[(val) => !!val || 'Name is required']"
            v-model="driverForm.type"
          />
          <q-input
            class="col-8"
            filled
            label="Bus"
            type="text"
            name="Bus"
            dense
            :rules="[(val) => !!val || 'Bus is required']"
            v-model="driverForm.bus"
          />
          <q-input
            v-if="driverForm.isAddress"
            class="col-8"
            filled
            dense
            label="Address"
            type="number"
            name="Address"
            v-model.number="driverForm.address"
          />
        </div>
        <div v-if="!driverForm.isAddress" class="q-gutter-xs row q-col-gutter-xs">
          <q-input
            class="col-8"
            filled
            dense
            label="Subscribe"
            type="text"
            name="Address"
            v-model="driverForm.subscribe"
          />
          <q-input
            class="col-8"
            filled
            dense
            label="Publish"
            type="text"
            name="Address"
            v-model="driverForm.publish"
          />
        </div>
      </q-card-section>
    </q-form>
    <q-card-actions class="text-primary">
      <q-btn v-if="props.buttonCancelLabel" flat :label="props.buttonCancelLabel" v-close-popup />
      <q-btn
        class="q-mb-xl q-ml-lg q-px-lg"
        v-if="props.buttonOkLabel"
        color="primary"
        no-caps
        :label="props.buttonOkLabel"
        @click="updateDriver"
      >
      </q-btn>
    </q-card-actions>
  </DialogFrame>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue';
import DialogFrame from '../../dialog/DialogFrame.vue';
import type { Driver } from '../../models/Drivers';
import { setRequest } from 'src/vueLib/models/Request';
import { addRawSubscriptions } from 'src/vueLib/models/Subscriptions';
import { convertToSubscribe, type RawSubs } from 'src/vueLib/models/Subscribe';
import { useNotify } from 'src/vueLib/general/useNotify';
import { UpdateTable } from '../updateTable';
import { updateDriverTable, type DriverTableRow } from 'src/vueLib/models/driverTable';

const { NotifyResponse } = useNotify();

const Dialog = ref();
const options = ['ArtNetDriver', 'OSCDriver'];
const driverForm = reactive({
  type: 'ArtNetDriver',
  bus: '',
  isAddress: true,
  address: 0,
  subscribe: '',
  publish: '',
});

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

const localDialogLabel = ref('');
const driver = ref<Driver>();
let dpUuid = '';
const form = ref();
const address = ref();
const topic = ref();

watch(
  () => driverForm.type,
  (val) => {
    driverForm.isAddress = val === options[0];
    if (driverForm.isAddress) {
      driverForm.subscribe = '';
      driverForm.publish = '';
      topic.value = undefined;
    } else {
      driverForm.address = -1;
      address.value = undefined;
    }
  },
);

const open = (uuid: string, drvs: DriverTableRow, type: 'add' | 'edit') => {
  switch (type) {
    case 'add':
      localDialogLabel.value = 'Add Driver';
      driverForm.type = 'ArtNetDriver';
      driverForm.isAddress = true;
      break;
    case 'edit':
      localDialogLabel.value = 'Edit Driver';
      driverForm.type = drvs.type;
      driverForm.bus = drvs.bus;
  }

  dpUuid = uuid;
  driver.value = drvs;

  if (drvs.address) driverForm.address = drvs.address;
  if (drvs.subscribe) driverForm.subscribe = drvs.subscribe;
  if (drvs.publish) driverForm.publish = drvs.publish;

  Dialog.value?.open();
};

function updateDriver() {
  form.value?.validate();
  if (!driverForm.type || !driverForm.bus) {
    NotifyResponse('Please fill in all required fields', 'warning');
    return;
  }

  if (driverForm.address > -1) {
    address.value = [driverForm.address];
  }
  if (driverForm.subscribe !== '' || driverForm.publish !== '') {
    topic.value = { subscribe: [driverForm.subscribe], publish: [driverForm.publish] };
  }

  setRequest('', undefined, undefined, undefined, dpUuid, {
    type: driverForm.type,
    buses: [
      {
        name: driverForm.bus,
        address: address.value,
        topic: topic.value,
      },
    ],
  })
    .then((resp) => {
      addRawSubscriptions(resp as RawSubs);

      resp.forEach((set) => {
        updateDriverTable(convertToSubscribe(set));
      });

      UpdateTable();
      Dialog.value.close();
    })
    .catch((err) => {
      NotifyResponse(err, 'error');
    });
}

defineExpose({ open });
</script>

<style scoped>
.outercard {
  border-radius: 10px;
}
</style>
