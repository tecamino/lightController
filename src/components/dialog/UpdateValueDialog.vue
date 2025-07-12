<template>
  <DialogFrame ref="Dialog" :width="props.width">
    <q-card-section
      v-if="props.dialogLabel"
      class="text-bold text-left q-mb-none q-pb-none"
      :class="'text-' + props.labelColor"
      >{{ props.dialogLabel + ': ' + props.datapoint?.path }}</q-card-section
    >
    <q-card-section>
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
        @keyup.enter="write"
        v-model="writeValue as string | number"
      ></q-input>
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
        :label="props.buttonOkLabel"
        @click="write"
      >
      </q-btn>
    </q-card-actions>
  </DialogFrame>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import DialogFrame from 'src/vueLib/dialog/DialogFrame.vue';
import type { Subscribe } from 'src/models/Subscribe';
import type { PropType } from 'vue';
import { setValues } from 'src/services/websocket';
import { NotifyResponse } from 'src/composables/notify';
import { useQuasar } from 'quasar';

const $q = useQuasar();
const Dialog = ref();
const writeValue = ref();

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
  datapoint: Object as PropType<Subscribe>,
});

const inputValue = ref(props.datapoint?.value);

const open = (sub: Subscribe, type?: string) => {
  Dialog.value?.open();
  switch (type) {
    case 'driver':
      console.log(9, sub.drivers);
      writeValue.value = sub.drivers;
      break;
    default:
      writeValue.value = sub.value;
  }
};

watch(
  () => props.datapoint?.value,
  (newVal) => {
    inputValue.value = newVal;
  },
);

function write() {
  setValues([{ uuid: props.datapoint?.uuid ?? '', value: writeValue.value ?? undefined }])
    .then((resp) => {
      if (resp?.set) {
        resp.set.forEach((set) => {
          inputValue.value = set.value;
        });
      }
    })
    .catch((err) => NotifyResponse($q, err));
}

defineExpose({ open });
</script>

<style scoped>
.outercard {
  border-radius: 10px;
}
</style>
