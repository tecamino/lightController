<template>
  <DialogFrame ref="Dialog" :width="props.width">
    <q-card-section
      v-if="props.dialogLabel"
      class="text-bold text-left q-mb-none q-pb-none"
      :class="'text-' + props.labelColor"
      >{{ props.dialogLabel }}
    </q-card-section>
    <q-form ref="addForm" @submit="onSubmit" class="q-gutter-md">
      <q-input
        class="q-pa-md"
        filled
        v-model="path"
        label=""
        :rules="[(val) => !!val || 'Path is required']"
      >
        <template #prepend>
          <div class="column">
            <span class="text-caption text-primary non-editable-prefix">Path *</span>
            <span class="text-body2 text-grey-6 non-editable-prefix">{{ staticPrefix }}</span>
          </div>
        </template>
      </q-input>
      <DataTypes class="q-ma-md" flat></DataTypes>
      <q-btn no-caps class="q-ma-lg" type="submit" color="primary">{{ props.buttonOkLabel }}</q-btn>
    </q-form>
  </DialogFrame>
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar';
import { ref } from 'vue';
import DialogFrame from 'src/vueLib/dialog/DialogFrame.vue';
import { api } from 'boot/axios';
import { NotifyResponse } from 'src/composables/notify';
import DataTypes from 'src/vueLib/buttons/DataTypes.vue';
//import datatype from 'src/vueLib/buttons/DataType.vue';

const $q = useQuasar();
const Dialog = ref();
const path = ref('');
const staticPrefix = ref('');
//const radio = ref('bool');
const addForm = ref();

const open = (uuid: string) => {
  Dialog.value?.open();
  getDatapoint(uuid);
};

function validate() {
  addForm.value.validate().then((success: undefined) => {
    if (success) {
      console.log(909);
      // yay, models are correct
    } else {
      console.log(910);
      // oh no, user has filled in
      // at least one invalid value
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

function onSubmit() {
  validate();
  console.log('submit', props);
}

function getDatapoint(uuid: string) {
  api
    .post('/json_data', { get: [{ uuid: uuid, query: { depth: 1 } }] })
    .then((resp) => {
      if (resp.data.get) {
        staticPrefix.value = resp.data.get[0].path;
        if (staticPrefix.value !== '') staticPrefix.value += ':';
      }
    })
    .catch((err) => NotifyResponse($q, err, 'error'));
}

defineExpose({ open });
</script>
