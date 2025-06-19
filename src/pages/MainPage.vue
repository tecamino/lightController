<template>
  <q-page>
    <q-tabs v-model="tab">
      <q-tab name="movingHead" label="Moving Head" />
      <q-tab name="lightBar" label="Light Bar" />
    </q-tabs>
    <q-tab-panels v-model="tab" animated class="text-white">
      <q-tab-panel name="movingHead">
        <moving-head />
      </q-tab-panel>
      <q-tab-panel name="lightBar">
        <LightBar />
      </q-tab-panel>
    </q-tab-panels>
  </q-page>
</template>

<script setup lang="ts">
import MovingHead from 'src/components/lights/MovingHead.vue';
import LightBar from 'src/components/lights/LightBarCBL.vue';
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
