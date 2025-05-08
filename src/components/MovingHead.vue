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
        <div class="column justify-center q-ma-lg" style="height: 200px">
          <q-btn
            @click="changeState"
            round
            :color="brightness > 0 ? 'yellow' : 'blue'"
            icon="lightbulb"
            style="position: relative"
          />
        </div>
        <q-item-label class="text-bold">Dimmer</q-item-label>
        <q-slider
          label
          class="q-ma-lg"
          vertical
          reverse
          v-model="brightness"
          :min="0"
          :max="100"
          :step="1"
          color="black"
          style="opacity: 0.5"
        />
        <q-item-label class="text-bold">Red</q-item-label>
        <q-slider
          class="q-ma-lg"
          vertical
          reverse
          v-model="red"
          :min="0"
          :max="100"
          :step="1"
          label
          color="red"
          style="opacity: 0.8"
        />
        <q-item-label class="text-bold">Green</q-item-label>
        <q-slider
          class="q-ma-lg"
          vertical
          reverse
          v-model="green"
          :min="0"
          :max="100"
          :step="1"
          label
          color="green"
          style="opacity: 0.8"
        />
        <q-item-label class="text-bold">Blue</q-item-label>
        <q-slider
          class="q-ma-lg"
          vertical
          reverse
          v-model="blue"
          :min="0"
          :max="100"
          :step="1"
          label
          color="blue"
          style="opacity: 0.8"
        />
        <q-item-label class="text-bold items-center">White</q-item-label>
        <q-slider
          class="q-ma-lg"
          vertical
          reverse
          v-model="white"
          :min="0"
          :max="100"
          :step="1"
          label
          color="grey"
          style="opacity: 0.3"
        />
        <q-item-label class="text-bold">Zoom</q-item-label>
        <q-slider
          class="q-ma-lg"
          vertical
          reverse
          v-model="zoom"
          :min="0"
          :max="100"
          :step="1"
          label
          color="black"
          style="opacity: 1"
        />

        <div class="column items-center q-ml-sm">
          <DragPad v-model:pan="pan" v-model:tilt="tilt" />
          {{ pan }} {{ tilt }}
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { send } from 'src/services/websocket';
import { subs, buildTree, dbmData } from 'src/composables/dbmTree';
import DragPad from './DragPad.vue';

const red = updateValue('MovingHead:Red', true);
const green = updateValue('MovingHead:Green', true);
const blue = updateValue('MovingHead:Blue', true);
const white = updateValue('MovingHead:White', true);
const brightness = updateBrightnessValue('MovingHead:Brightness');
const pan = updateValue('MovingHead:Pan', true);
const tilt = updateValue('MovingHead:Tilt', true);
const zoom = updateValue('MovingHead:Zoom');
const state = updateValue('MovingHead:State');

onMounted(() => {
  send({
    subscribe: [
      {
        path: '.*',
        depth: 2,
      },
    ],
  })
    .then((response) => {
      if (response?.subscribe) {
        subs.value = response.subscribe;
        dbmData.value = buildTree(subs.value);
      } else {
        console.log('Response from server:', response);
      }
    })
    .catch((err) => {
      console.error('Error fetching data:', err);
    });
});

function changeState() {
  if (brightness.value === 0) {
    if (state.value === 0) {
      brightness.value = 100;
      return;
    }
    brightness.value = state.value;
    return;
  }
  state.value = brightness.value;
  brightness.value = 0;
}

function updateValue(path: string, isDouble = false) {
  return computed({
    get() {
      const sub = subs.value.find((s) => s.path === path);
      const value = sub ? Number(sub.value ?? 0) : 0;
      return isDouble ? Math.round((100 / 255) * value) : Math.round((100 / 255) * value);
    },
    set(val) {
      const baseValue = Math.round((255 / 100) * val);
      const setPaths = [{ path, value: baseValue }];

      if (isDouble) {
        setPaths.push({ path: `${path}Fine`, value: baseValue });
      }

      send({
        set: setPaths,
      }).catch((err) => console.error(`Failed to update ${path.split(':')[1]}:`, err));
    },
  });
}

function updateBrightnessValue(path: string) {
  return computed({
    get() {
      const sub = subs.value.find((s) => s.path === path);
      const value = sub ? Number(sub.value ?? 0) : 0;
      return Math.round((100 / 255) * value);
    },
    set(val) {
      const baseValue = Math.round((255 / 100) * val);
      const setPaths = [{ path, value: baseValue }];
      setPaths.push({ path: `${path}Fine`, value: baseValue });
      setPaths.push({ path: `MovingHead:Strobe`, value: 255 });

      send({
        set: setPaths,
      }).catch((err) => console.error(`Failed to update ${path.split(':')[1]}:`, err));
    },
  });
}
</script>
