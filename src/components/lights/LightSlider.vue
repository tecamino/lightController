<template>
  <div :class="'column items-center ' + props.class">
    <q-item-label v-if="!toggleHighLow" :class="['text-bold', `text-${textColor}`]"
      ><p v-html="mainTitle"></p>
    </q-item-label>
    <q-item-label
      v-else
      @click="toggle = !toggle"
      :class="['cursor-pointer', 'text-bold', 'clickable-text-effect', `text-${textColor}`]"
      ><p v-html="toggle ? secondTitle : mainTitle"></p>
    </q-item-label>
    <q-btn
      size="sm"
      class="q-mb-md"
      round
      color="positive"
      icon="add_circle_outline"
      @click="reverse ? add : substract"
      v-touch-repeat:0:300:300:300:300:50:50:50:50:20.mouse="reverse ? add : substract"
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
      @click="reverse ? substract : add"
      v-touch-repeat:0:300:300:300:300:50:50:50:50:20.mouse="reverse ? substract : add"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { updateValue } from 'src/vueLib/dbm/dbmTree';
import { addOne, substractOne } from 'src/utils/number-helpers';
import { useNotify } from 'src/vueLib/general/useNotify';

const props = defineProps({
  toggleHighLow: {
    type: Boolean,
    default: false,
  },
  mainTitle: {
    type: String,
    default: '',
  },
  secondTitle: {
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
    default: 255,
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

const { NotifyResponse } = useNotify();
const toggle = ref(false);
const localValue = updateValue(
  NotifyResponse,
  props.dbmPath,
  toggle,
  props.dbmPath2,
  props.dbmPath3,
  props.dbmValue3,
);

function add() {
  addOne(localValue, 255);
}

function substract() {
  substractOne(localValue, 0);
}
</script>

<style>
.clickable-text-effect {
  cursor: pointer;
  color: #040303; /* Static text color */
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.6);
  /* Add hover effect here if you want it part of this class */
  transition: text-shadow 0.2s ease-in-out;
}

.clickable-text-effect:hover {
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}
</style>
