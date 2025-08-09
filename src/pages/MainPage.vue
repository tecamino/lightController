<template>
  <q-page>
    <q-tabs v-model="tab">
      <q-tab no-caps name="stageLights" label="Stage Lights" />
      <q-tab no-caps name="movingHead" label="Moving Head" />
      <q-tab no-caps name="lightBar" label="Light Bar" />
      <q-tab no-caps name="floodPanels" label="Flood Panels" />
    </q-tabs>
    <q-tab-panels v-model="tab" animated class="text-white">
      <q-tab-panel name="stageLights">
        <stage-lights />
      </q-tab-panel>
      <q-tab-panel name="lightBar">
        <LightBar />
      </q-tab-panel>
      <q-tab-panel name="floodPanels">
        <FloodPanels />
      </q-tab-panel>
      <q-tab-panel name="movingHead">
        <moving-head />
      </q-tab-panel>
    </q-tab-panels>
  </q-page>
</template>

<script setup lang="ts">
import MovingHead from 'src/components/lights/MovingHead.vue';
import LightBar from 'src/components/lights/LightBarCBL.vue';
import FloodPanels from 'src/components/lights/FloodPanels.vue';
import StageLights from 'src/components/lights/StageLights.vue';
import { ref, onMounted, watch } from 'vue';
const tab = ref('movingHead');
const STORAGE_KEY = 'lastTabUsed';

// Load last tab on mount
onMounted(() => {
  const savedTab = sessionStorage.getItem(STORAGE_KEY);
  if (savedTab) {
    tab.value = savedTab;
  }
});

// Save tab on change
watch(tab, (newVal) => {
  sessionStorage.setItem(STORAGE_KEY, newVal);
});
</script>
