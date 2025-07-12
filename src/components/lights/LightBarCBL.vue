<template>
  <div class="q-pa-md">
    <q-card>
      <q-card-section class="q-mt-md q-mr-sm row items-start">
        <div class="column justify-center q-mr-lg" style="height: 200px">
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
          dbm-path="LightBar:Brightness"
          :opacity="0.5"
          class="q-ma-sm"
        ></LightSlider>
        <LightSlider
          mainTitle="Strobe"
          dbm-path="LightBar:Strobe"
          :opacity="0.5"
          class="q-ma-sm"
        ></LightSlider>
        <LightSlider
          mainTitle="Program"
          dbm-path="LightBar:Program"
          :opacity="0.5"
          class="q-ma-sm"
        ></LightSlider>
        <LightSlider
          mainTitle="Program Speed"
          dbm-path="LightBar:Program:Speed"
          :opacity="0.8"
          class="q-ma-sm"
        ></LightSlider>
        <LightSlider
          mainTitle="Red"
          dbm-path="LightBar:Red"
          color="red"
          :opacity="0.8"
          class="q-ma-sm"
        ></LightSlider>
        <LightSlider
          mainTitle="Green"
          dbm-path="LightBar:Green"
          :opacity="0.8"
          color="green"
          class="q-ma-sm"
        ></LightSlider>
        <LightSlider
          mainTitle="Blue"
          dbm-path="LightBar:Blue"
          :opacity="0.8"
          color="blue"
          class="q-ma-sm"
        ></LightSlider>
        <div class="colums q-ma-xl">
          <q-btn color="secondary" @click="settings = !settings" icon="settings">Settings</q-btn>
          <SettingDialog :settings-dialog="settings"></SettingDialog>
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar';
import LightSlider from './LightSlider.vue';
import { ref, onMounted, onUnmounted } from 'vue';
import { unsubscribe, subscribeToPath } from 'src/services/websocket';
import SettingDialog from 'src/components/lights/SettingDomeLight.vue';
import { NotifyResponse } from 'src/composables/notify';
import { updateValue } from 'src/composables/dbm/dbmTree';
import { removeAllSubscriptions } from 'src/models/Subscriptions';

const $q = useQuasar();
const settings = ref(false);
const brightness = updateValue('LightBar:Brightness', $q);
const state = updateValue('LightBar:State', $q);
onMounted(() => {
  subscribeToPath($q, 'LightBar:.*');
});

onUnmounted(() => {
  unsubscribe([
    {
      path: 'LightBar',
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
</script>
