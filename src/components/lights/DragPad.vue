<template>
  <div class="row items-start" style="height: auto; align-items: flex-start">
    <div class="row q-ma-xs">
      <div class="column items-center q-mr-md" :style="{ height: containerSize + 'px' }">
        <div class="column justify-between items-center" :style="{ height: containerSize + 'px' }">
          <q-item-label
            @click="toggleTilt = !toggleTilt"
            :class="[
              'cursor-pointer',
              'text-bold',
              'clickable-text-effect',
              'q-mb-none',
              `text-black`,
            ]"
          >
            {{ toggleTilt ? 'Tilt Fine' : 'Tilt' }}</q-item-label
          >
          <q-btn
            :size="buttonSize"
            round
            color="positive"
            icon="add_circle_outline"
            class="q-mb-md"
            @click="reverseTilt ? substractTilt : addTilt"
            v-touch-repeat:0:300:300:300:300:50:50:50:20.mouse="
              reverseTilt ? substractTilt : addTilt
            "
          />
          <q-slider
            vertical
            :reverse="!props.reverseTilt"
            v-model="tilt"
            :min="0"
            :max="255"
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
            @click="reverseTilt ? addTilt : substractTilt"
            v-touch-repeat:0:300:300:300:300:50:50:50:20.mouse="
              reverseTilt ? addTilt : substractTilt
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
        <q-item-label
          @click="togglePan = !togglePan"
          :class="['cursor-pointer', 'text-bold', 'clickable-text-effect', 'q-mt-lg', `text-black`]"
          >{{ togglePan ? 'Pan Fine' : 'Pan' }}</q-item-label
        >

        <div class="q-gutter-sm row items-center full-width">
          <q-btn
            :size="buttonSize"
            class="q-mr-sm"
            round
            color="negative"
            icon="remove_circle_outline"
            @click="reversePan ? addPan : substractPan"
            v-touch-repeat:0:300:300:300:300:50:50:50:50:20.mouse="
              reversePan ? addPan : substractPan
            "
          />
          <q-slider
            class="col"
            :reverse="props.reversePan"
            v-model="pan"
            :min="0"
            :max="255"
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
            @click="reversePan ? substractPan : addPan"
            v-touch-repeat:0:300:300:300:300:50:50:50:20.mouse="reversePan ? substractPan : addPan"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { addOne, substractOne } from 'src/utils/number-helpers';
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { updateValue } from 'src/vueLib/dbm/dbmTree';
import { useNotify } from 'src/vueLib/general/useNotify';

const props = defineProps({
  reversePan: {
    type: Boolean,
    default: false,
  },
  reverseTilt: {
    type: Boolean,
    default: false,
  },
  panPath: {
    type: String,
    default: '',
    required: true,
  },
  panPath2: {
    type: String,
    default: '',
  },
  tiltPath: {
    type: String,
    default: '',
    required: true,
  },
  tiltPath2: {
    type: String,
    default: '',
  },
});

const { NotifyResponse } = useNotify();
const togglePan = ref(false);
const toggleTilt = ref(false);
const pad = ref<HTMLElement | null>(null);
const dragging = ref(false);
const containerSize = ref(0);

const pan = updateValue(NotifyResponse, props.panPath, togglePan, props.panPath2);
const tilt = updateValue(NotifyResponse, props.tiltPath, toggleTilt, props.tiltPath2);

const scaleFactor = computed(() => containerSize.value / 255);
// 200px → 2, 400px → 4, etc.
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

const markerStyle = computed(() => {
  const scale = scaleFactor.value;
  return {
    position: 'absolute' as const,
    top: `${scale * (props.reverseTilt ? tilt.value : 255 - tilt.value)}px`,
    left: `${scale * (props.reversePan ? 255 - pan.value : pan.value)}px`,
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
  e.preventDefault();
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
    ? Math.round((1 - newX / rect.width) * 255)
    : Math.round((newX / rect.width) * 255);
  tilt.value = props.reverseTilt
    ? Math.round((newY / rect.height) * 255)
    : Math.round(255 - (newY / rect.height) * 255);
}

function addTilt() {
  addOne(tilt, 255);
}

function substractTilt() {
  substractOne(tilt, 0);
}

function addPan() {
  addOne(pan, 255);
}

function substractPan() {
  substractOne(pan, 0);
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
