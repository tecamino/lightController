<template>
  <DialogFrame ref="Dialog" :width="props.width" :header-title="props.dialogLabel">
    <q-card-section
      v-if="props.dialogLabel"
      class="text-bold text-left q-mb-none q-pb-none"
      :class="'text-' + props.labelColor"
    >
    </q-card-section>
    <q-form ref="addForm" class="q-gutter-md">
      <q-input
        class="q-mt-lg q-mb-none q-pl-lg q-pr-xl"
        filled
        v-model="path"
        label=""
        :rules="[(val) => !!val || 'Path is required']"
      >
        <template #prepend>
          <div class="column">
            <span class="text-caption text-primary non-editable-prefix">Path *</span>
            <span class="text-body2 text-grey-6 non-editable-prefix"
              >{{ prefix }}{{ staticPrefix }}</span
            >
          </div>
        </template>
      </q-input>
      <DataTypes class="q-mt-lg q-pl-md q-pr-xl" flat v-model:datatype="datatype"></DataTypes>
      <div class="q-pl-lg">
        <div class="text-grey text-bold">Read Write Access</div>
        <q-checkbox v-model="read">Read</q-checkbox>
        <q-checkbox v-model="write">Write</q-checkbox>
      </div>
      <q-input
        :type="valueType"
        stack-label
        label="Value"
        class="q-pl-md q-pr-xl"
        filled
        v-model="value"
      ></q-input>
      <q-btn no-caps class="q-mb-xl q-mx-xl q-px-lg" @click="onSubmit" color="primary">{{
        props.buttonOkLabel
      }}</q-btn>
    </q-form>
  </DialogFrame>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import DialogFrame from '../../dialog/DialogFrame.vue';
import { useNotify } from '../../general/useNotify';
import DataTypes from '../../buttons/DataTypes.vue';
import { addRawSubscription } from '../../models/Subscriptions';
import { UpdateTable } from '../../dbm/updateTable';
import { getRequest, setRequest } from 'src/vueLib/models/Request';
import { convertToType } from '../Datapoint';
import { catchError } from 'src/vueLib/models/error';

const { NotifyResponse } = useNotify();
const Dialog = ref();
const path = ref('');
const staticPrefix = ref('');
const value = ref('');
const valueType = ref<'text' | 'number'>('text');
const read = ref(true);
const write = ref(true);
const datatype = ref('None');
const addForm = ref();
const prefix = 'DBM:';

const open = (uuid: string) => {
  Dialog.value?.open();
  getDatapoint(uuid);
};

watch(datatype, (newVal) => {
  if (newVal === 'String') valueType.value = 'text';
  else valueType.value = 'number';
});

function onSubmit() {
  let type = 'NONE';
  let access = '';
  addForm.value.validate().then((success: undefined) => {
    if (success) {
      type = convertToType(datatype.value);

      if (read.value) access = 'R';
      if (write.value) access += 'W';
      if (access == '') access = 'R';

      setRequest(staticPrefix.value + path.value, type, value.value, access)
        .then((respond) => {
          if (respond) {
            respond.forEach((set) => {
              NotifyResponse("Datapoint '" + prefix + set.path + "' added");
            });
            addRawSubscription(respond[0]);
            UpdateTable();
          }
        })
        .catch((err) => {
          NotifyResponse(catchError(err), 'error');
        });
    } else {
      if (path.value === '') {
        NotifyResponse("Field 'Path' is requierd", 'error');
        return;
      } else NotifyResponse('Form not validated', 'error');
    }
  });
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

function getDatapoint(uuid: string) {
  getRequest(uuid, '', 1)
    .then((resp) => {
      if (resp[0]) {
        staticPrefix.value = resp[0].path ?? '';
        if (staticPrefix.value !== '') staticPrefix.value += ':';
      }
    })
    .catch((err) => NotifyResponse(catchError(err), 'error'));
}

defineExpose({ open });
</script>
