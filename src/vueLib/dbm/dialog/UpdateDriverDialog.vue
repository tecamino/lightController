<template>
  <DialogFrame
    ref="Dialog"
    :width="props.width"
    :height="props.height"
    :header-title="'DBM:' + datapoint?.path"
  >
    <q-card-section
      v-if="props.dialogLabel || localDialogLabel"
      class="text-bold text-left q-mb-none q-pb-none"
      :class="'text-' + props.labelColor"
      >{{ props.dialogLabel || localDialogLabel }}</q-card-section
    >
    <q-card-section>
      <q-table
        flat
        dense
        virtual-scroll
        :rows-per-page-options="[0]"
        :rows="drivers"
        :columns="columns"
        row-key="type"
      >
        <!-- add symbol on top right of table-->
        <template v-slot:top-right>
          <q-btn
            size="sm"
            ripple
            rounded
            color="primary"
            icon="add"
            round
            dense
            @click="handleRow(driver, 'add')"
          />
        </template>
        <template v-slot:body-cell-settings="props">
          <q-td :props="props" class="cursor-pointer">
            <q-btn
              dense
              flat
              size="sm"
              icon="more_vert"
              @click="(evt) => openSubMenu(evt, props.row)"
            ></q-btn>
          </q-td>
        </template>
      </q-table>
      <q-menu ref="contextMenuRef" context-menu>
        <q-list>
          <q-item>
            <q-item-section v-close-popup class="cursor-pointer" @click="handleRow(driver, 'edit')">
              Edit
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section
              v-close-popup
              class="text-negative cursor-pointer"
              @click="deleteDriver(driver)"
            >
              Delete
            </q-item-section>
          </q-item>
        </q-list>
      </q-menu>
    </q-card-section>
    <q-card-section v-if="props.text" class="text-center" style="white-space: pre-line">{{
      props.text
    }}</q-card-section>
    <q-card-actions align="right" class="text-primary">
      <q-btn v-if="props.buttonCancelLabel" flat :label="props.buttonCancelLabel" v-close-popup>
      </q-btn>
      <q-btn
        class="q-mb-xl q-ml-lg q-mt-none"
        v-if="props.buttonOkLabel"
        color="primary"
        no-caps
        :label="props.buttonOkLabel"
        v-close-popup
      >
      </q-btn>
    </q-card-actions>
  </DialogFrame>
  <DriverDialog :button-ok-label="driverOkLabel" ref="driverDialog"></DriverDialog>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import DialogFrame from '../../dialog/DialogFrame.vue';
import DriverDialog from './DriverDialog.vue';
import { convertToSubscribe, type Subscribe } from '../../models/Subscribe';
import type { Driver } from '../../models/Drivers';
import { driverDefault } from '../../models/Drivers';
import type { DriverTableRow } from 'src/vueLib/models/driverTable';
import { updateDriverTable, useDriverTable } from 'src/vueLib/models/driverTable';
import { deleteRequest } from 'src/vueLib/models/Request';
import { useNotify } from 'src/vueLib/general/useNotify';
import type { Bus } from 'src/vueLib/models/Bus';

const { NotifyResponse } = useNotify();
const Dialog = ref();
const driverDialog = ref();
const writeValue = ref();
const onlyRead = ref(false);

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
    default: '500px',
  },
});

const datapoint = ref();
const localDialogLabel = ref('');
const contextMenuRef = ref();
const table = useDriverTable();
const drivers = table.driverTable;
const driver: Driver = { type: '' };
const driverOkLabel = ref('');
const columns = table.columns;

const open = (sub: Subscribe) => {
  datapoint.value = sub;
  if (datapoint.value.rights == 'R') onlyRead.value = true;
  table.emptyTable();

  localDialogLabel.value = 'Update Drivers';
  updateDriverTable(sub);

  writeValue.value = sub.drivers;
  Dialog.value?.open();
};

function openSubMenu(evt: Event, d: DriverTableRow) {
  if (d) {
    const bus: Bus = {
      name: d.bus,
    };
    bus.name = d.bus;
    if (d.address) bus.address = d.address !== undefined ? [d.address] : [];
    if (d.subscribe || d.publish)
      bus.topic = {
        subscribe:
          typeof d.subscribe === 'string' ? d.subscribe.split(',').map((s) => s.trim()) : [],
        publish: typeof d.publish === 'string' ? d.publish.split(',').map((s) => s.trim()) : [],
      };

    driver.type = d.type;
    driver.buses = [bus];
  }
  const mouseEvent = evt as MouseEvent;
  contextMenuRef.value?.show(mouseEvent);
}

function handleRow(driver: Driver | undefined, type: 'add' | 'edit') {
  driverOkLabel.value = 'Add';
  switch (type) {
    case 'add':
      driver = driverDefault;
      break;
    case 'edit':
      driverOkLabel.value = 'Update';
      break;
  }
  driverDialog.value?.open(datapoint.value.uuid, driver, type);
}

function deleteDriver(driver: Driver | undefined) {
  deleteRequest(datapoint.value.uuid, '', driver)
    .then((resp) => {
      resp.forEach((set) => {
        updateDriverTable(convertToSubscribe(set));
      });
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
