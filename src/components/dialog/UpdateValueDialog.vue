<template>
  <q-dialog v-model="internalShowDialog">
    <q-card :style="'width:' + props.width">
      <q-card-section
        v-if="props.dialogLabel"
        class="text-h6 text-center"
        :class="'text-' + props.labelColor"
        >{{ props.dialogLabel }}</q-card-section
      >
      <q-card-section>
        <q-input v-model="inputValue"></q-input>
      </q-card-section>
      <q-card-section v-if="props.text" class="text-center" style="white-space: pre-line">{{
        props.text
      }}</q-card-section>
      <q-card-actions align="right" class="text-primary">
        <q-btn v-if="props.buttonCancelLabel" flat :label="props.buttonCancelLabel" v-close-popup>
        </q-btn>
        <q-btn
          v-if="props.buttonOkLabel"
          flat
          :label="props.buttonOkLabel"
          v-close-popup
          @click="closeDialog"
        >
        </q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

const props = defineProps({
  showDialog: {
    type: Boolean,
    required: true,
  },
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
  value: {
    type: [String, Number],
  },
});

const inputValue = ref(props.value);

const emit = defineEmits(['update:showDialog', 'update:value', 'confirmed', 'cancel']);
const internalShowDialog = ref(props.showDialog);

watch(inputValue, (val) => {
  emit('update:value', val);
});

watch(
  () => props.showDialog,
  (newValue) => {
    console.log('watch showDialog', newValue);
    internalShowDialog.value = newValue;
  },
);
watch(internalShowDialog, (newValue) => {
  console.log('watch internalShowDialog', newValue);
  emit('update:showDialog', newValue);
  if (!newValue) {
    console.log('emit cancel');
    emit('cancel');
  } else {
    console.log('emit confirmed');
    emit('confirmed');
  }
});

function closeDialog() {
  internalShowDialog.value = false;
  emit('update:showDialog', false);
}
</script>
