<template>
  <q-dialog
    ref="dialogRef"
    :maximized="minMaxState"
    :full-width="minMaxState"
    :no-focus="!minMaxState"
    :no-refocus="!minMaxState"
    :seamless="!minMaxState"
  >
    <q-card class="layout" :style="cardStyle" v-touch-pan.mouse.prevent.stop="handlePan">
      <div class="row justify-end q-mx-sm q-mt-xs">
        <q-btn dense flat :icon="minMaxIcon" size="md" @click="minMax()"></q-btn>
        <q-btn dense flat icon="close" size="md" v-close-popup></q-btn>
      </div>
      <q-separator color="black" class="q-my-none" />
      <slot />
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

const dialogRef = ref();
const open = () => dialogRef.value?.show();

const minMaxIcon = ref('fullscreen');
const minMaxState = ref(false);
function minMax() {
  if (minMaxState.value) {
    minMaxIcon.value = 'fullscreen';
  } else {
    minMaxIcon.value = 'fullscreen_exit';
  }
  minMaxState.value = !minMaxState.value;
}

const props = defineProps({
  width: {
    type: String,
    default: '300px',
  },
});

const position = ref({ x: 0, y: 0 });

// This makes the dialog draggable
const handlePan = (details: { delta: { x: number; y: number } }) => {
  position.value.x += details.delta.x;
  position.value.y += details.delta.y;
};

const cardStyle = computed(() => ({
  width: props.width,
  transform: `translate(${position.value.x}px, ${position.value.y}px)`,
}));

defineExpose({ open });
</script>

<style scoped>
.layout {
  border-radius: 10px;
}
</style>
