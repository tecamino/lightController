<template>
  <q-page>
    <q-tabs v-model="tab">
      <q-tab name="movingHead" label="Moving Head" />
      <q-tab name="dome" label="Dome" />
    </q-tabs>
    <q-tab-panels v-model="tab" animated class="text-white">
      <q-tab-panel name="movingHead">
        <moving-head />
      </q-tab-panel>
      <q-tab-panel name="dome">
        <Dome />
      </q-tab-panel>
    </q-tab-panels>
  </q-page>
</template>

<script setup lang="ts">
import MovingHead from 'src/components/MovingHead.vue';
import Dome from 'src/components/DomeLight.vue';
import { ref } from 'vue';
const tab = ref('movingHead');
</script>
