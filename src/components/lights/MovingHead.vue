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

        <LightSlider
          mainTitle="Dimmer"
          second-title="Dimmer Fine"
          :toggle-high-low="true"
          dbm-path="MovingHead:Brightness"
          dbm-path2="MovingHead:BrightnessFine"
          dbm-path3="MovingHead:Strobe"
          :dbm-value3="255"
          :opacity="0.5"
          class="q-ma-md"
        />
        <LightSlider
          mainTitle="Red"
          second-title="Red Fine"
          :toggle-high-low="true"
          dbm-path="MovingHead:Red"
          dbm-path2="MovingHead:RedFine"
          :opacity="0.8"
          color="red"
          class="q-ma-md"
        />
        <LightSlider
          mainTitle="Green"
          second-title="Green Fine"
          :toggle-high-low="true"
          dbm-path="MovingHead:Green"
          dbm-path2="MovingHead:GreenFine"
          :opacity="0.8"
          color="green"
          class="q-ma-md"
        />
        <LightSlider
          mainTitle="Blue"
          second-title="Blue Fine"
          :toggle-high-low="true"
          dbm-path="MovingHead:Blue"
          dbm-path2="MovingHead:BlueFine"
          :opacity="0.8"
          color="blue"
          class="q-ma-md"
        />
        <LightSlider
          mainTitle="White"
          second-title="White Fine"
          :toggle-high-low="true"
          dbm-path="MovingHead:White"
          dbm-path2="MovingHead:WhiteFine"
          :opacity="0.3"
          color="grey"
          class="q-ma-md"
        />
        <LightSlider
          mainTitle="Zoom"
          dbm-path="MovingHead:Zoom"
          :opacity="1"
          color="black"
          class="q-ma-md"
        />
        <div>
          <DragPad
            class="q-ma-md"
            pan-path="MovingHead:Pan"
            pan-path2="MovingHead:PanFine"
            v-model:reverse-pan="settings.reversePan"
            tilt-path="MovingHead:Tilt"
            tilt-path2="MovingHead:TiltFine"
            v-model:reverse-tilt="settings.reverseTilt"
          />
        </div>
        <div class="colums q-ma-xl">
          <q-btn color="secondary" @click="settings.show = !settings.show" icon="settings"
            >Settings</q-btn
          >
          <SettingDialog v-model:settings="settings"></SettingDialog>
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar';
import LightSlider from './LightSlider.vue';
import { NotifyResponse } from 'src/composables/notify';
import { onBeforeUpdate, computed, onMounted, onUnmounted, ref } from 'vue';
import { subscribeToPath, unsubscribe, setValues } from 'src/services/websocket';
import { LocalStorage } from 'quasar';
import { updateValue } from 'src/composables/dbm/dbmTree';
import DragPad from 'src/components/lights/DragPad.vue';
import SettingDialog from './SettingMovingHead.vue';
import type { Settings } from 'src/models/MovingHead';
import { findSubscriptionByPath, removeAllSubscriptions } from 'src/models/Subscriptions';

const $q = useQuasar();
const brightness = updateBrightnessValue('MovingHead:Brightness');
const state = updateValue('MovingHead:State', $q);
const settings = ref<Settings>({
  show: false,
  reversePan: false,
  reverseTilt: false,
  startAddress: 0,
});

onMounted(() => {
  settings.value.reversePan = LocalStorage.getItem('reversePan') ?? false;
  settings.value.reverseTilt = LocalStorage.getItem('reverseTilt') ?? false;
  subscribeToPath($q, 'MovingHead:.*');
});

onBeforeUpdate(() => {
  subscribeToPath($q, 'MovingHead:.*');
});

onUnmounted(() => {
  unsubscribe([
    {
      path: 'MovingHead',
      depth: 0,
    },
  ]).catch((err) => {
    NotifyResponse($q, err, 'error');
  });
  removeAllSubscriptions();
});

function changeState() {
  if (brightness.value === 0) {
    if (state.value === 0) {
      brightness.value = 255;
      return;
    }
    brightness.value = state.value;
    return;
  }
  state.value = brightness.value;
  brightness.value = 0;
}

function updateBrightnessValue(path: string) {
  return computed({
    get() {
      const sub = findSubscriptionByPath(path);
      if (!sub) return 0;
      if (!sub.value) return 0;
      return Number(sub.value);
    },
    set(val) {
      const setPaths = [{ path, value: val }];
      setPaths.push({ path: `${path}Fine`, value: val });
      setPaths.push({ path: `MovingHead:Strobe`, value: 255 });

      setValues(setPaths)
        .then((response) => NotifyResponse($q, response))
        .catch((err) => console.error(`Failed to update ${path.split(':')[1]}:`, err));
    },
  });
}
</script>
