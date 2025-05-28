<template>
  <q-dialog v-model="settingsDialog">
    <q-card style="min-width: 300px">
      <q-card-section>
        <div class="text-h6">Settings</div>
      </q-card-section>

      <q-card-section>
        <q-btn>Normal</q-btn>
      </q-card-section>
      <q-card-section> </q-card-section>
      <q-card-actions align="right">
        <q-btn flat label="Cancel" v-close-popup />
        <q-btn flat label="Save" @click="saveSettings" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
const settingsDialog = defineModel<boolean>('settingsDialog', { default: false, required: true });

function saveSettings() {
  // Save logic here
  settingsDialog.value = false;
}
</script>
