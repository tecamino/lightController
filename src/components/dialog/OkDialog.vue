<template>
  <q-dialog v-model="internalShowDialog">
    <q-card :style="'width:' + props.width">
      <q-card-section
        v-if="props.dialogLabel"
        class="text-h6 text-center"
        :class="'text-' + props.labelColor"
        >{{ props.dialogLabel }}</q-card-section
      >
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
});

const emit = defineEmits(['update:showDialog', 'confirmed', 'cancel']);
const internalShowDialog = ref(props.showDialog);

watch(
  () => props.showDialog,
  (newValue) => {
    internalShowDialog.value = newValue;
  },
);
watch(internalShowDialog, (newValue) => {
  emit('update:showDialog', newValue);
  if (!newValue) {
    emit('cancel');
  } else {
    emit('confirmed');
  }
});

function closeDialog() {
  internalShowDialog.value = false;
  emit('update:showDialog', false);
}
</script>
