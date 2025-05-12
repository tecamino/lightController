<template>
  <q-dialog v-model="settingsDialog">
    <q-card style="min-width: 300px">
      <q-card-section>
        <div class="text-h6">Settings</div>
      </q-card-section>

      <q-card-section>
        <q-btn
          :icon="!reverseTilt ? 'swap_vert' : undefined"
          :icon-right="reverseTilt ? 'swap_vert' : undefined"
          @click="reverseTilt = !reverseTilt"
          >{{ reverseTilt ? 'Reversed Tilt' : 'Normal Tilt' }}</q-btn
        >
      </q-card-section>
      <q-card-section>
        <q-btn
          :icon="!reversePan ? 'swap_vert' : undefined"
          :icon-right="reversePan ? 'swap_vert' : undefined"
          @click="reversePan = !reversePan"
          >{{ reversePan ? 'Reversed Pan' : 'Normal Pan' }}</q-btn
        >
      </q-card-section>
      <q-card-section>
        <q-input type="number" label="Start Address" v-model:model-value="startAddress"></q-input>
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
const settingsDialog = defineModel<boolean>('settingsDialog', { default: false, required: true });
const reversePan = defineModel<boolean>('reversePan', { default: false, required: true });
const reverseTilt = defineModel<boolean>('reverseTilt', { default: false, required: true });
const startAddress = defineModel<number>('startAddress', { default: 0 });

function saveSettings() {
  LocalStorage.set('reversePan', reversePan.value);
  LocalStorage.set('reverseTilt', reverseTilt.value);

  console.log(88, startAddress.value);

  settingsDialog.value = false;
}
</script>
