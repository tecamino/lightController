<template>
  <DialogFrame ref="Dialog" :width="props.width" :header-title="props.dialogLabel">
    <q-card-section
      v-if="props.dialogLabel"
      class="text-bold text-left q-mb-none q-pb-none"
      :class="'text-' + props.labelColor"
    >
    </q-card-section>
    <q-form ref="copyForm" class="q-gutter-md">
      <q-input
        class="q-mt-lg q-mb-none q-pl-md q-mx-lg"
        filled
        v-model="path"
        label="Current Path"
        label-color="primary"
        readonly
      >
      </q-input>
      <q-input
        class="q-mt-lg q-mt-none q-pl-md q-mx-lg"
        filled
        v-model="copyPath"
        label="New Path *"
        label-color="primary"
        @keyup.enter="onSubmit"
        :rules="[(val) => !!val || 'Path is required']"
      >
      </q-input>
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
import { getRequest, setsRequest } from 'src/vueLib/models/Request';
import { datapointRequestForCopy } from '../Datapoint';
import { catchError } from 'src/vueLib/models/error';

const { NotifyResponse } = useNotify();
const Dialog = ref();
const path = ref('');
const copyPath = ref('');
const copyForm = ref();
const prefix = 'DBM:';

const open = (uuid: string) => {
  Dialog.value?.open();
  getDatapoint(uuid);
};

function onSubmit() {
  copyForm.value.validate().then((success: undefined) => {
    if (success) {
      if (copyPath.value === path.value) {
        NotifyResponse('copy path can not be the same as current path', 'error');
        return;
      }

      const absolutePath = path.value.slice(prefix.length);
      const absolutecopyPath = copyPath.value.slice(prefix.length);

      getRequest('', absolutecopyPath, 1)
        .then((response) => {
          if (response?.length > 0) {
            NotifyResponse("path '" + copyPath.value + "' already exists", 'warning');
            return;
          }
        })
        .catch((err) => {
          if (err instanceof Error && err.message === 'No data returned') {
            getRequest('', absolutePath, 0)
              .then((response) => {
                setsRequest(
                  datapointRequestForCopy(response, absolutePath, absolutecopyPath),
                ).catch((err) => console.error(err));
                NotifyResponse(copyPath.value + ' copied');
              })
              .catch((err) => NotifyResponse(catchError(err), 'error'));
          } else {
            NotifyResponse(catchError(err), 'error');
          }
          return;
        });
    } else {
      if (copyPath.value === '') {
        NotifyResponse("Field 'New Path' is requierd", 'error');
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
  getRequest(uuid)
    .then((resp) => {
      if (resp[0]) {
        path.value = prefix + resp[0].path;
        copyPath.value = prefix + resp[0].path;
      }
    })
    .catch((err) => NotifyResponse(catchError(err), 'error'));
}

defineExpose({ open });
</script>
