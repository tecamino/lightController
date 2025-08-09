<template>
  <q-dialog v-model="settings.show">
    <q-card style="min-width: 300px">
      <q-card-section>
        <div class="text-h6">Settings</div>
      </q-card-section>

      <q-card-section>
        <q-btn
          :icon="!settings.reverseTilt ? 'swap_vert' : undefined"
          :icon-right="settings.reverseTilt ? 'swap_vert' : undefined"
          @click="settings.reverseTilt = !settings.reverseTilt"
          >{{ settings.reverseTilt ? 'Reversed Tilt' : 'Normal Tilt' }}</q-btn
        >
      </q-card-section>
      <q-card-section>
        <q-btn
          :icon="!settings.reversePan ? 'swap_vert' : undefined"
          :icon-right="settings.reversePan ? 'swap_vert' : undefined"
          @click="settings.reversePan = !settings.reversePan"
          >{{ settings.reversePan ? 'Reversed Pan' : 'Normal Pan' }}</q-btn
        >
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat label="Cancel" v-close-popup />
        <q-btn flat label="Save" @click="saveSettings" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { LocalStorage } from 'quasar';
import type { Settings } from 'src/models/MovingHead';

const settings = defineModel<Settings>('settings', {
  default: {
    show: false,
    reversePan: false,
    reverseTilt: false,
  },
  required: true,
});

function saveSettings() {
  LocalStorage.set('reversePan', settings.value.reversePan);
  LocalStorage.set('reverseTilt', settings.value.reverseTilt);
  settings.value.show = false;
}
</script>
