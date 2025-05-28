<template>
  <div class="row items-start" style="height: auto; align-items: flex-start">
    <div class="row q-ma-xs">
      <div class="column items-center q-mr-md" :style="{ height: containerSize + 'px' }">
        <div class="column justify-between items-center" :style="{ height: containerSize + 'px' }">
          <q-item-label class="text-black text-bold q-mb-none">Tilt</q-item-label>
          <q-btn
            :size="buttonSize"
            round
            color="positive"
            icon="add_circle_outline"
            class="q-mb-md"
            @click="reverseTilt ? substractTiltOne : addTiltOne"
            v-touch-repeat:300:300:300:300:50.mouse="reverseTilt ? substractTiltOne : addTiltOne"
          />
          <q-slider
            vertical
            :reverse="!props.reverseTilt"
            v-model="tilt"
            :min="0"
            :max="100"
            :step="1"
            label
            class="col"
            color="black"
            style="opacity: 1"
          />
          <q-btn
            :size="buttonSize"
            class="q-mt-sm"
            round
            color="negative"
            icon="remove_circle_outline"
            @click="reverseTilt ? addTiltOne : substractTiltOne"
            v-touch-repeat:300:300:300:300:50:50:50:50:20.mouse="
              reverseTilt ? addTiltOne : substractTiltOne
            "
          />
        </div>
      </div>
      <div class="column items-center q-ml-sm">
        <div
          class="bg-grey-3 responsive-box"
          style="position: relative; border: 1px solid #ccc; border-radius: 8px; touch-action: none"
          @mousedown="startDrag"
          @touchstart="startTouch"
          @touchend="stopTouch"
          ref="pad"
        >
          <div class="marker" :style="markerStyle" :class="{ crosshair: dragging }"></div>
        </div>
        <q-item-label class="q-ma-sm text-black text-bold">Pan</q-item-label>

        <div class="q-gutter-sm row items-center full-width">
          <q-btn
            :size="buttonSize"
            class="q-mr-sm"
            round
            color="negative"
            icon="remove_circle_outline"
            @click="reversePan ? addPanOne : substractPanOne"
            v-touch-repeat:300:300:300:300:50:50:50:50:20.mouse="
              reversePan ? addPanOne : substractPanOne
            "
          />
          <q-slider
            class="col"
            :reverse="props.reversePan"
            v-model="pan"
            :min="0"
            :max="100"
            :step="1"
            label
            color="black"
            style="opacity: 1"
          />
          <q-btn
            :size="buttonSize"
            class="q-ml-sm"
            round
            color="positive"
            icon="add_circle_outline"
            @click="reversePan ? substractPanOne : addPanOne"
            v-touch-repeat:300:300:300:300:50.mouse="reversePan ? substractPanOne : addPanOne"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';

const pad = ref<HTMLElement | null>(null);
const dragging = ref(false);
const containerSize = ref(0);

const pan = defineModel<number>('pan', { default: 0 });
const tilt = defineModel<number>('tilt', { default: 0 });
const props = defineProps<{
  reversePan: boolean;
  reverseTilt: boolean;
}>();
const buttonSize = computed(() => (containerSize.value <= 200 ? 'sm' : 'md'));

onMounted(() => {
  const updateSize = () => {
    const el = pad.value;
    if (el) {
      containerSize.value = el.offsetWidth;
    }
  };

  window.addEventListener('resize', updateSize);
  updateSize();

  onUnmounted(() => {
    window.removeEventListener('resize', updateSize);
  });
});

const scaleFactor = computed(() => containerSize.value / 100);
// 200px → 2, 400px → 4, etc.

const markerStyle = computed(() => {
  const scale = scaleFactor.value;

  return {
    position: 'absolute' as const,
    top: `${scale * (props.reverseTilt ? tilt.value : 100 - tilt.value)}px`,
    left: `${scale * (props.reversePan ? 100 - pan.value : pan.value)}px`,
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    background: 'red',
    border: '2px solid white',
    cursor: 'pointer',
    transform: 'translate(-50%, -50%)',
  };
});

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

function addTiltOne() {
  if (tilt.value <= 255) {
    tilt.value++;
  }
}

function substractTiltOne() {
  if (tilt.value >= 0) {
    tilt.value--;
  }
}

function addPanOne() {
  if (pan.value <= 255) {
    pan.value++;
  }
}

function substractPanOne() {
  if (pan.value >= 0) {
    pan.value--;
  }
}
</script>

<style>
.responsive-box {
  width: 200px;
  height: 200px;
}

@media (min-width: 640px) {
  .responsive-box {
    width: 400px;
    height: 400px;
  }
}
</style>
