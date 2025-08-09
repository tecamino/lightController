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
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import LightSlider from './LightSlider.vue';
import { onMounted, onUnmounted } from 'vue';
import { unsubscribe, subscribeToPath } from 'src/vueLib/services/websocket';
import { useNotify } from 'src/vueLib/general/useNotify';
import { updateValue } from 'src/vueLib/dbm/dbmTree';
import { removeAllSubscriptions } from 'src/vueLib/models/Subscriptions';
import { catchError } from 'src/vueLib/models/error';

const { NotifyResponse } = useNotify();
const brightness = updateValue(NotifyResponse, 'LightBar:Brightness');
const state = updateValue(NotifyResponse, 'LightBar:State');
onMounted(() => {
  subscribeToPath(NotifyResponse, 'LightBar:.*');
});

onUnmounted(() => {
  unsubscribe([
    {
      path: 'LightBar',
      depth: 0,
    },
  ]).catch((err) => {
    NotifyResponse(catchError(err), 'error');
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
