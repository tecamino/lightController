<template>
  <div :class="'column items-center ' + props.class">
    <q-item-label :class="['text-bold', `text-${textColor}`]"><p v-html="title"></p></q-item-label>
    <q-btn
      size="sm"
      class="q-mb-sm"
      round
      color="positive"
      icon="add_circle_outline"
      @click="addOne"
      v-touch-repeat:300:300:300:300:50:50:50:50:20.mouse="addOne"
    />
    <div>
      <q-slider
        :vertical="vertical"
        :reverse="reverse"
        v-model="localValue"
        :min="props.min"
        :max="props.max"
        :step="props.step"
        :label="props.label"
        :color="props.color"
        :style="{ opacity: props.opacity }"
      />
    </div>
    <q-btn
      size="sm"
      class="q-my-md"
      round
      color="negative"
      icon="remove_circle_outline"
      @click="substractOne"
      v-touch-repeat:300:300:300:300:50:50:50:50:20.mouse="substractOne"
    />
  </div>
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar';
import { updateValue } from 'src/composables/dbm/dbmTree';

const $q = useQuasar();

const props = defineProps({
  title: {
    type: String,
    default: '',
  },
  dbmPath: {
    type: String,
    default: '',
    required: true,
  },
  dbmPath2: {
    type: String,
    default: '',
  },
  dbmPath3: {
    type: String,
    default: '',
  },
  dbmValue3: {
    type: Number,
    default: 0,
  },
  textColor: {
    type: String,
    default: 'black',
  },
  color: {
    type: String,
    default: 'black',
  },
  min: {
    type: Number,
    default: 0,
  },
  max: {
    type: Number,
    default: 100,
  },
  vertical: {
    type: Boolean,
    default: true,
  },
  reverse: {
    type: Boolean,
    default: true,
  },
  step: {
    type: Number,
    default: 1,
  },
  label: {
    type: Boolean,
    default: true,
  },
  class: {
    type: String,
    default: 'q-mr-sm',
  },
  opacity: {
    type: Number,
    default: 1,
  },
});

const localValue = updateValue(props.dbmPath, $q, props.dbmPath2, props.dbmPath3, props.dbmValue3);

function addOne() {
  if (localValue.value <= 255) {
    localValue.value++;
  }
}

function substractOne() {
  if (localValue.value >= 0) {
    localValue.value--;
  }
}
</script>
