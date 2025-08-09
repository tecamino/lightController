<template>
  <div>
    <q-card>
      <div class="q-pt-md text-black text-bold text-center">{{ cardTitle }}</div>
      <q-card-section class="row items-start">
        <div class="column justify-center q-mr-xs" style="height: 200px">
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
          :dbm-path="props.path + ':Brightness'"
          :opacity="0.5"
          class="q-ma-sm"
        ></LightSlider>
        <LightSlider
          mainTitle="Red"
          :dbm-path="props.path + ':Red'"
          color="red"
          :opacity="0.8"
          class="q-ma-sm"
        ></LightSlider>
        <LightSlider
          mainTitle="Green"
          :dbm-path="props.path + ':Green'"
          :opacity="0.8"
          color="green"
          class="q-ma-sm"
        ></LightSlider>
        <LightSlider
          mainTitle="Blue"
          :dbm-path="props.path + ':Blue'"
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

const props = defineProps({
  cardTitle: {
    type: String,
    default: '',
  },
  path: {
    type: String,
    required: true,
  },
});
const { NotifyResponse } = useNotify();
const brightness = updateValue(NotifyResponse, props.path + ':Brightness');
const state = updateValue(NotifyResponse, props.path + ':State');

onMounted(() => {
  subscribeToPath(NotifyResponse, props.path + ':.*');
});

onUnmounted(() => {
  unsubscribe([
    {
      path: props.path,
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
