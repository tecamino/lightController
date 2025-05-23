<template>
  <div class="row q-ma-xs">
    <q-item-label class="text-bold">Tilt</q-item-label>
    <q-slider
      class="q-mr-sm"
      vertical
      :reverse="!props.reverseTilt"
      v-model="tilt"
      :min="0"
      :max="100"
      :step="1"
      label
      color="black"
      style="opacity: 1"
    />
    <div class="column items-center q-ml-sm">
      <div
        class="bg-grey-3"
        style="
          width: 200px;
          height: 200px;
          position: relative;
          border: 1px solid #ccc;
          border-radius: 8px;
          touch-action: none;
        "
        @mousedown="startDrag"
        @touchstart="startTouch"
        @touchend="stopTouch"
        ref="pad"
      >
        <div class="marker" :style="markerStyle" :class="{ crosshair: dragging }"></div>
      </div>
      <q-item-label class="text-bold">Pan</q-item-label>
      <q-slider
        :reverse="props.reversePan"
        class="q-ml-sm"
        v-model="pan"
        :min="0"
        :max="100"
        :step="1"
        label
        color="black"
        style="opacity: 1"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';

const pad = ref<HTMLElement | null>(null);
const dragging = ref(false);

const pan = defineModel<number>('pan', { default: 0 });
const tilt = defineModel<number>('tilt', { default: 0 });
const props = defineProps<{
  reversePan: boolean;
  reverseTilt: boolean;
}>();

const markerStyle = computed(() => ({
  position: 'absolute' as const,
  top: `${2 * (props.reverseTilt ? tilt.value : 100 - tilt.value)}px`,
  left: `${2 * (props.reversePan ? 100 - pan.value : pan.value)}px`,
  width: '12px',
  height: '12px',
  borderRadius: '50%',
  background: 'red',
  border: '2px solid white',
  cursor: 'pointer',
  transform: 'translate(-50%, -50%)',
}));

function startDrag(e: MouseEvent) {
  dragging.value = true;
  updatePosition(e);
  window.addEventListener('mousemove', onDrag);
  window.addEventListener('mouseup', stopDrag);
}

function stopDrag() {
  dragging.value = false;
  window.removeEventListener('mousemove', onDrag);
  window.removeEventListener('mouseup', stopDrag);
}

function startTouch(e: TouchEvent) {
  e.preventDefault(); // ✅ block scroll
  const touch = e.touches[0];
  if (!touch) return;
  dragging.value = true;
  updatePosition(touch);
  window.addEventListener('touchmove', onTouch, { passive: false });
  window.addEventListener('touchend', stopTouch);
}

function onTouch(e: TouchEvent) {
  e.preventDefault(); // ✅ block scroll
  if (!dragging.value) return;
  const touch = e.touches[0];
  if (!touch) return;
  updatePosition(touch);
}

function onDrag(e: MouseEvent) {
  e.preventDefault(); // optional, for extra safety
  if (!dragging.value) return;
  updatePosition(e);
}

function stopTouch() {
  dragging.value = false;
  window.removeEventListener('touchmove', onTouch);
  window.removeEventListener('touchend', stopTouch);
}

function updatePosition(e: MouseEvent | Touch) {
  if (!pad.value) return;

  const rect = pad.value.getBoundingClientRect();
  const newX = Math.min(Math.max(0, e.clientX - rect.left), rect.width);
  const newY = Math.min(Math.max(0, e.clientY - rect.top), rect.height);

  pan.value = props.reversePan
    ? Math.round((1 - newX / rect.width) * 100)
    : Math.round((newX / rect.width) * 100);
  tilt.value = props.reverseTilt
    ? Math.round((newY / rect.height) * 100)
    : Math.round(100 - (newY / rect.height) * 100);
}
</script>
