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
        <q-slider
          class="q-mr-lg"
          vertical
          reverse
          v-model="light.Amber"
          :min="0"
          :max="100"
          :step="1"
          label
          color="amber"
          style="opacity: 0.8"
        />
        <q-slider
          class="q-mr-lg"
          vertical
          reverse
          v-model="light.Purple"
          :min="0"
          :max="100"
          :step="1"
          label
          color="purple"
          style="opacity: 0.8"
        />
        <div class="colums q-ma-xl">
          <q-btn color="secondary" @click="settings = !settings" icon="settings">Settings</q-btn>
          <SettingDialog :settings-dialog="settings"></SettingDialog>
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import { watch, reactive, ref } from 'vue';
import type { Light } from 'src/models/Light';
import { send } from 'src/services/websocket';
import SettingDialog from 'src/components/SettingDomeLight.vue';

const settings = ref(false);

const light = reactive<Light>({
  State: false,
  Brightness: 0,
  Red: 0,
  Green: 0,
  Blue: 0,
  White: 0,
  Amber: 0,
  Purple: 0,
});

watch(light, (newVal: Light) => {
  send({
    set: [
      {
        path: 'Light:001:001',
        value: Math.round((255 / 10000) * newVal.Red * newVal.Brightness * Number(newVal.State)),
      },
      {
        path: 'Light:001:002',
        value: Math.round((255 / 10000) * newVal.Green * newVal.Brightness * Number(newVal.State)),
      },
      {
        path: 'Light:001:003',
        value: Math.round((255 / 10000) * newVal.Blue * newVal.Brightness * Number(newVal.State)),
      },
      {
        path: 'Light:001:004',
        value: Math.round((255 / 10000) * newVal.White * newVal.Brightness * Number(newVal.State)),
      },
      {
        path: 'Light:001:005',
        value: Math.round((255 / 10000) * newVal.Amber * newVal.Brightness * Number(newVal.State)),
      },
      {
        path: 'Light:001:006',
        value: Math.round((255 / 10000) * newVal.Purple * newVal.Brightness * Number(newVal.State)),
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
