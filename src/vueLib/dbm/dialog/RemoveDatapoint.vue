<template>
  <DialogFrame ref="Dialog" :width="props.width" :header-title="props.dialogLabel">
    <q-card-section
      v-if="props.dialogLabel"
      class="text-bold text-left q-mb-none q-pb-none"
      :class="'text-' + props.labelColor"
    >
    </q-card-section>
    <div class="text-center text-bold text-primary">
      Do you want to remove Datapoint
      <br /><br />
      '{{ datapoint.path ?? '' }}'
    </div>
    <div class="row justify-end">
      <q-btn no-caps class="q-ma-lg q-mr-xl" filled color="negative" @click="remove">{{
        props.buttonOkLabel
      }}</q-btn>
    </div>
  </DialogFrame>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import DialogFrame from '../../dialog/DialogFrame.vue';
import { useNotify } from '../../general/useNotify';
import { subscribe } from '../../services/websocket';
import { findParentKey, buildTree } from '../../dbm/dbmTree';
import { addRawSubscriptions } from '../../models/Subscriptions';
import { UpdateTable } from '../../dbm/updateTable';
import { convertToSubscribes } from '../../models/Subscribe';
import { deleteRequest, getRequest } from 'src/vueLib/models/Request';
import { catchError } from 'src/vueLib/models/error';

const { NotifyResponse } = useNotify();
const Dialog = ref();
const datapoint = ref();
const prefix = 'DBM:';

const open = (uuid: string) => {
  getDatapoint(uuid)
    .then(() => Dialog.value?.open())
    .catch((err) => NotifyResponse(catchError(err), 'error'));
};

function remove() {
  deleteRequest(datapoint.value.uuid)
    .then((respond) => {
      const sub = respond[respond.length - 1];
      if (sub) NotifyResponse("Datapoint '" + prefix + sub.path + "' removed", 'warning');

      Dialog.value.close();
      {
        const parentKey = findParentKey(datapoint.value.uuid);

        if (parentKey) {
          subscribe([{ uuid: parentKey, path: '', depth: 2 }])
            .then((res) => {
              if (res?.subscribe) {
                addRawSubscriptions(res.subscribe);
                buildTree(convertToSubscribes(res.subscribe));
                UpdateTable();
              }
            })
            .catch((err) => NotifyResponse('Subscribe failed ' + catchError(err), 'error'));
        }
      }
    })
    .catch((err) => {
      if (err.response) {
        NotifyResponse(err.response.data.message, 'error');
      } else console.error(err);
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

async function getDatapoint(uuid: string) {
  await getRequest(uuid, '', 1)
    .then((resp) => {
      if (resp) {
        datapoint.value = resp[0];
      }
    })
    .catch((err) => NotifyResponse(catchError(err), 'error'));
}
defineExpose({ open, close });
</script>
