<template>
  <div class="">
    <q-card>
      <div class="row items-start">
        <q-card-section>
          <StageLight card-title="Left" path="StageLights:001" />
        </q-card-section>
        <q-card-section>
          <StageLight card-title="Right" path="StageLights:002" />
        </q-card-section>
      </div>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import StageLight from './StageLight.vue';
</script>
