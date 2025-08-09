<template>
  <DialogFrame
    ref="Dialog"
    :width="props.width"
    :height="props.height"
    :header-title="localDialogLabel"
  >
    <q-card-section
      v-if="dialogLabel"
      class="text-bold text-left q-mb-none q-pb-none"
      :class="'text-' + props.labelColor"
      >{{ dialogLabel }}
    </q-card-section>
    <q-card-section v-if="props.text" class="text-center" style="white-space: pre-line">{{
      props.text
    }}</q-card-section>
    <q-form ref="form">
      <q-card-section class="q-gutter-xs row q-col-gutter-xs q-ml-sm">
        <div>
          <q-select
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
            filled
            dense
            label="Address"
            type="number"
            name="Address"
            @keyup.enter="updateDriver"
            v-model.number="driverForm.address"
          />
        </div>
        <div v-if="!driverForm.isAddress" class="q-gutter-xs row q-col-gutter-xs">
          <q-input
            filled
            dense
            label="Subscribe"
            type="text"
            name="Address"
            v-model="driverForm.subscribe"
          />
          <q-input
            filled
            dense
            label="Publish"
            type="text"
            name="Address"
            @keyup.enter="updateDriver"
            v-model="driverForm.publish"
          />
        </div>
      </q-card-section>
    </q-form>
    <q-card-actions align="right" class="text-primary">
      <q-btn v-if="props.buttonCancelLabel" flat :label="props.buttonCancelLabel" v-close-popup />
      <q-btn
        class="q-mb-xl q-mr-lg"
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
import { reactive, ref, watch, computed } from 'vue';
import DialogFrame from '../../dialog/DialogFrame.vue';
import type { Driver } from '../../models/Drivers';
import { deleteRequest, setRequest } from 'src/vueLib/models/Request';
import { addRawSubscriptions } from 'src/vueLib/models/Subscriptions';
import { convertToSubscribe, type RawSubs } from 'src/vueLib/models/Subscribe';
import { useNotify } from 'src/vueLib/general/useNotify';
import { UpdateTable } from '../updateTable';
import { updateDriverTable, type DriverTableRow } from 'src/vueLib/models/driverTable';

const { NotifyResponse } = useNotify();

const Dialog = ref();
const dialogLabel = computed(() => props.dialogLabel || localDialogLabel.value);
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
  height: {
    type: String,
    default: '480px',
  },
});

const localDialogLabel = ref('');
const driver = ref<Driver>();
let dpUuid = '';
const form = ref();
const address = ref();
const topic = ref();
const edit = ref(false);

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
      edit.value = false;
      Object.assign(driverForm, {
        type: 'ArtNetDriver',
        bus: '',
        isAddress: true,
        address: 0,
        subscribe: '',
        publish: '',
      });
      break;
    case 'edit':
      localDialogLabel.value = 'Edit Driver';
      edit.value = true;
      fillDriverFormFromRow(drvs);
  }

  dpUuid = uuid;
  driver.value = drvs;

  if (drvs.address) driverForm.address = drvs.address;
  if (drvs.subscribe) driverForm.subscribe = drvs.subscribe;
  if (drvs.publish) driverForm.publish = drvs.publish;

  Dialog.value?.open();
};

async function updateDriver() {
  const valid = await form.value?.validate();
  if (!valid) {
    NotifyResponse('Please fill in all required fields', 'warning');
    return;
  }

  if (driverForm.address > -1) {
    address.value = [driverForm.address];
  }
  if (driverForm.subscribe !== '' || driverForm.publish !== '') {
    topic.value = { subscribe: [driverForm.subscribe], publish: [driverForm.publish] };
  }

  if (edit.value) {
    deleteRequest(dpUuid, '', driver.value)
      .then((resp) => {
        resp.forEach((set) => {
          updateDriverTable(convertToSubscribe(set));
        });
      })
      .catch((err) => NotifyResponse(err, 'error'));
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

function fillDriverFormFromRow(drvs: DriverTableRow) {
  driverForm.type = drvs.type;
  driverForm.bus = drvs.buses?.[0]?.name ?? '';
  driverForm.address = drvs.buses?.[0]?.address?.[0] ?? -1;
  driverForm.subscribe = drvs.topic?.subscribe?.[0] ?? '';
  driverForm.publish = drvs.topic?.publish?.[0] ?? '';
}

defineExpose({ open });
</script>

<style scoped>
.outercard {
  border-radius: 10px;
}
</style>
