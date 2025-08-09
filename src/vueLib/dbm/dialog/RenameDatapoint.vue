<template>
  <DialogFrame
    ref="Dialog"
    :width="props.width"
    :height="props.height"
    :header-title="props.dialogLabel"
  >
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
        v-model="removeData.path"
        label="Current Path"
        label-color="primary"
        readonly
      >
      </q-input>
      <q-input
        class="q-mt-lg q-mt-none q-pl-md q-mx-lg"
        filled
        v-model="removeData.newPath"
        label="New Path *"
        label-color="primary"
        @keyup.enter="onSubmit"
        :rules="[(val) => !!val || 'Path is required']"
      >
      </q-input>
      <div class="row justify-end q-mr-lg">
        <q-btn no-caps class="q-mb-xl q-ml-lg q-px-lg" @click="onSubmit" color="primary">{{
          props.buttonOkLabel
        }}</q-btn>
      </div>
    </q-form>
  </DialogFrame>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import DialogFrame from '../../dialog/DialogFrame.vue';
import { useNotify } from '../../general/useNotify';
import { getRequest, setRequest } from 'src/vueLib/models/Request';
import { catchError } from 'src/vueLib/models/error';
import { convertToSubscribes, type RawSubs } from 'src/vueLib/models/Subscribe';
import { UpdateTable } from '../updateTable';
import { addRawSubscriptions } from 'src/vueLib/models/Subscriptions';
import { buildTree } from '../dbmTree';

const { NotifyResponse } = useNotify();
const Dialog = ref();
const datapoint = ref();
const removeData = reactive({
  path: '',
  newPath: '',
  prefix: 'DBM:',
});

const copyForm = ref();

const open = (uuid: string) => {
  Dialog.value?.open();
  getDatapoint(uuid);
};

function onSubmit() {
  copyForm.value.validate().then((success: undefined) => {
    if (success) {
      if (removeData.newPath === removeData.path) {
        NotifyResponse('same name', 'warning');
        return;
      }

      getRequest('', removeData.newPath.slice(removeData.prefix.length), 1)
        .then((response) => {
          if (response?.length > 0) {
            NotifyResponse("path '" + response[0]?.path + "' already exists", 'warning');
            return;
          }
        })
        .catch((err) => {
          const error = catchError(err);
          if (error !== 'No data returned') {
            NotifyResponse(error, 'error');
            return;
          }

          setRequest(
            removeData.newPath.slice(removeData.prefix.length),
            datapoint.value.type,
            datapoint.value.value,
            datapoint.value.rights,
            datapoint.value.uuid,
            undefined,
            true,
          )
            .then((res) => {
              addRawSubscriptions(res as RawSubs);
              buildTree(convertToSubscribes(res as RawSubs));
              UpdateTable();
            })
            .catch((err) => NotifyResponse(err, 'error'));
        });
    } else {
      if (removeData.newPath === '') {
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
  height: {
    type: String,
    default: '400px',
  },
});

function getDatapoint(uuid: string) {
  getRequest(uuid)
    .then((resp) => {
      if (resp[0]) {
        datapoint.value = resp[0];
        removeData.path = removeData.prefix + resp[0].path;
        removeData.newPath = removeData.prefix + resp[0].path;
      }
    })
    .catch((err) => NotifyResponse(catchError(err), 'error'));
}

defineExpose({ open });
</script>
