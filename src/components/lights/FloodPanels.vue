<template>
  <div class="">
    <q-card>
      <div class="row items-start">
        <q-card-section>
          <FloodPanel card-title="Left" path="FloodPanels:001" />
        </q-card-section>
        <q-card-section>
          <FloodPanel card-title="Right" path="FloodPanels:002" />
        </q-card-section>
      </div>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import FloodPanel from './FloodPanel.vue';
</script>
