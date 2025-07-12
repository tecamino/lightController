<template>
  <q-card>
    <div class="text-primary q-ma-md">Datatypes *</div>
    <div>
      <div class="row q-gutter-sm q-ml-sm">
        <q-card-section class="items-between">
          <RadioButton class="q-ma-xs" v-model:opt="datatype" text="None" hint="none">
          </RadioButton>
          <RadioButton class="q-ma-xs" v-model:opt="datatype" text="String" hint="Text">
          </RadioButton>
          <RadioButton class="q-ma-xs" v-model:opt="datatype" text="Bool" hint="On / Off">
          </RadioButton>
        </q-card-section>
        <RadioButton v-model:opt="datatype" text="Uint8" hint="0 - 255"> </RadioButton>
        <RadioButton v-model:opt="datatype" text="Uint16" hint="0 - 65535"> </RadioButton>
        <RadioButton v-model:opt="datatype" text="Uint32" hint="0 - 429496..."> </RadioButton>
        <RadioButton v-model:opt="datatype" text="Int8" hint="-128 - 127"> </RadioButton>
        <RadioButton v-model:opt="datatype" text="Int16" hint="-32768 - 3..."> </RadioButton>
        <RadioButton v-model:opt="datatype" text="Int32" hint="-21474836..."> </RadioButton>
        <RadioButton v-model:opt="datatype" text="Int32" hint="-2^63 - (2^...)"> </RadioButton>
        <RadioButton v-model:opt="datatype" text="double" hint="1.7E 1/- 3..."> </RadioButton>
      </div>
    </div>
  </q-card>
</template>

<script setup lang="ts">
import RadioButton from './RadioButton.vue';
import { ref } from 'vue';

const datatype = ref('none');
</script>
