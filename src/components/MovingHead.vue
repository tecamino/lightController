// channel description // 1 Red // 2 Red fine // 3 Green // 4 Green fine // 5 Blue // 6 Blue fine //
7 White // 8 White fine // 9 Linear CTO ??? // 10 Macro Color ??? // 11 Strobe // 12 Dimmer // 13
Dimer fine // 14 Pan // 15 Pan fine // 16 Tilt // 17 Tilt fine // 18 Function // 19 Reset // 20 Zoom
// 21 Zoom rotation // 22 Shape selection // 23 Shape speed // 24 Shape fade // 25 Shape Red // 26
Shape Green // 27 Shape Blue // 28 Shape White // 29 Shape Dimmer // 30 Background dimmer // 31
Shape transition // 32 Shape Offset // 33 Foreground strobe // 34 Background strobe // 35 Background
select

<template>
  <div class="q-pa-md">
    <q-card>
      <q-card-section class="q-mt-md q-mr-sm row items-start">
        <div class="column justify-center q-mr-lg" style="height: 200px">
          <q-btn
            @click="light.State = !light.State"
            round
            :color="light.State ? 'yellow' : 'blue'"
            icon="lightbulb"
            style="position: relative"
          />
        </div>
        <q-item-label class="text-bold">Dimmer</q-item-label>
        <q-slider
          label
          class="q-mr-lg"
          vertical
          reverse
          v-model="light.Brightness"
          :min="0"
          :max="100"
          :step="1"
          color="black"
          style="opacity: 0.5"
        />
        <q-item-label class="text-bold">Red</q-item-label>
        <q-slider
          class="q-mr-lg"
          vertical
          reverse
          v-model="light.Red"
          :min="0"
          :max="100"
          :step="1"
          label
          color="red"
          style="opacity: 0.8"
        />
        <q-item-label class="text-bold">Green</q-item-label>
        <q-slider
          class="q-mr-lg"
          vertical
          reverse
          v-model="light.Green"
          :min="0"
          :max="100"
          :step="1"
          label
          color="green"
          style="opacity: 0.8"
        />
        <q-item-label class="text-bold">Blue</q-item-label>
        <q-slider
          class="q-mr-lg"
          vertical
          reverse
          v-model="light.Blue"
          :min="0"
          :max="100"
          :step="1"
          label
          color="blue"
          style="opacity: 0.8"
        />
        <q-item-label class="text-bold">White</q-item-label>
        <q-slider
          class="q-mr-lg"
          vertical
          reverse
          v-model="light.White"
          :min="0"
          :max="100"
          :step="1"
          label
          color="grey"
          style="opacity: 0.3"
        />
        <q-item-label class="text-bold">Zoom</q-item-label>
        <q-slider
          class="q-mr-lg"
          vertical
          reverse
          v-model="light.Zoom"
          :min="0"
          :max="100"
          :step="1"
          label
          color="black"
          style="opacity: 1"
        />
        <q-item-label class="text-bold">Tilt</q-item-label>
        <q-slider
          class="q-mr-sm"
          vertical
          reverse
          v-model="light.Tilt"
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
            "
            @mousedown="startDrag"
            @mousemove="onDrag"
            @mouseup="stopDrag"
            @mouseleave="stopDrag"
            @touchstart="startTouch"
            @touchmove="onTouch"
            @touchend="stopDrag"
            ref="pad"
          >
            <div class="marker" :style="markerStyle" :class="{ crosshair: dragging }"></div>
          </div>
          <q-item-label class="text-bold">Pan</q-item-label>
          <q-slider
            class="q-ml-sm"
            v-model="light.Pan"
            :min="0"
            :max="100"
            :step="1"
            label
            color="black"
            style="opacity: 1"
          />
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, reactive, computed } from 'vue';
import { useWebSocket } from 'src/composables/useWebSocket';
import type { MovingHead } from 'src/models/MovingHead';

const { connect, send } = useWebSocket('ws://127.0.0.1:8100/ws?id=quasar');
const pad = ref<HTMLElement | null>(null);
const dragging = ref(false);

const light = reactive<MovingHead>({
  State: false,
  Brightness: 0,
  Red: 0,
  Green: 0,
  Blue: 0,
  White: 0,
  Zoom: 0,
  Pan: 50,
  Tilt: 50,
});

onMounted(() => {
  connect();
});

const markerStyle = computed(() => ({
  position: 'absolute' as const,
  top: `${2 * (100 - light.Tilt)}px`,
  left: `${2 * light.Pan}px`,
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
}

function onDrag(e: MouseEvent) {
  if (!dragging.value) return;
  updatePosition(e);
}

function stopDrag() {
  dragging.value = false;
}

function startTouch(e: TouchEvent) {
  const touch = e.touches[0];
  if (!touch) return;
  dragging.value = true;
  updatePosition(touch);
}

function onTouch(e: TouchEvent) {
  if (!dragging.value) return;
  const touch = e.touches[0];
  if (!touch) return;
  updatePosition(touch);
}

function updatePosition(e: MouseEvent | Touch) {
  if (!pad.value) return;
  const rect = pad.value.getBoundingClientRect();
  const newX = Math.min(Math.max(0, e.clientX - rect.left), rect.width);
  const newY = Math.min(Math.max(0, e.clientY - rect.top), rect.height);

  light.Pan = Math.round((newX / rect.width) * 100);
  light.Tilt = Math.round(100 - (newY / rect.height) * 100);
  console.log(light.Pan, light.Tilt);
}

watch(light, (newVal: MovingHead) => {
  send({
    set: [
      {
        // Red
        path: 'MovingHead:001:Red',
        value: Math.round((255 / 100) * newVal.Red * Number(newVal.State)),
      },
      {
        //Red fine
        path: 'MovingHead:001:RedFine',
        value: Math.round((255 / 100) * newVal.Red * Number(newVal.State)),
      },
      {
        // Green
        path: 'MovingHead:001:Green',
        value: Math.round((255 / 100) * newVal.Green * Number(newVal.State)),
      },
      {
        // Green fine
        path: 'MovingHead:001:GreenFine',
        value: Math.round((255 / 100) * newVal.Green * Number(newVal.State)),
      },
      {
        // Blue
        path: 'MovingHead:001:Blue',
        value: Math.round((255 / 100) * newVal.Blue * Number(newVal.State)),
      },
      {
        // Blue fine
        path: 'MovingHead:001:BlueFine',
        value: Math.round((255 / 100) * newVal.Blue * Number(newVal.State)),
      },
      {
        // White
        path: 'MovingHead:001:White',
        value: Math.round((255 / 100) * newVal.White * Number(newVal.State)),
      },
      {
        // White fine
        path: 'MovingHead:001:WhiteFine',
        value: Math.round((255 / 100) * newVal.White * newVal.Brightness * Number(newVal.State)),
      },
      {
        // Dimmer
        path: 'MovingHead:001:Dimmer',
        value: Math.round((255 / 100) * newVal.Brightness * Number(newVal.State)),
      },
      {
        // Dimmer fine
        path: 'MovingHead:001:DimmerFine',
        value: Math.round((255 / 100) * newVal.Brightness * Number(newVal.State)),
      },
      {
        // Zoom
        path: 'MovingHead:001:Zoom',
        value: Math.round((255 / 100) * newVal.Zoom),
      },
      {
        // Pan
        path: 'MovingHead:001:Pan',
        value: Math.round((255 / 100) * newVal.Pan),
      },
      {
        // Pan fine
        path: 'MovingHead:001:PanFine',
        value: Math.round((255 / 100) * newVal.Pan),
      },
      {
        // Tilt
        path: 'MovingHead:001:Tilt',
        value: Math.round((255 / 100) * newVal.Tilt),
      },
      {
        // Tilt fine
        path: 'MovingHead:001:TiltFine',
        value: Math.round((255 / 100) * newVal.Tilt),
      },
    ],
  })
    .then((response) => {
      console.log('Response from server:', response);
    })
    .catch((err) => {
      console.error('Error fetching data:', err);
    });
});
</script>
