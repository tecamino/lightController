<template>
  <q-card>
    <div class="text-primary q-ma-md">Datatypes *</div>
    <div>
      <div class="row q-gutter-sm q-ml-sm">
        <div>
          <div class="text-grey text-bold">General</div>
          <RadioButton
            class="q-my-xs q-px-lg q-mr-sm"
            v-model:opt="datatype"
            text="None"
            hint="none"
          >
          </RadioButton>
          <RadioButton
            class="q-my-xs q-px-lg q-mr-sm"
            v-model:opt="datatype"
            text="String"
            hint="Text"
          >
          </RadioButton>
          <RadioButton class="q-my-xs q-px-lg" v-model:opt="datatype" text="Bool" hint="On / Off">
          </RadioButton>
        </div>
        <div>
          <div class="text-grey text-bold">Numbers</div>
          <div>
            <RadioButton
              class="q-my-xs q-px-lg q-mr-sm"
              v-model:opt="datatype"
              text="Uint8"
              hint="0 - 255"
            >
            </RadioButton>
            <RadioButton
              class="q-my-xs q-px-lg q-mr-sm"
              v-model:opt="datatype"
              text="Uint16"
              hint="0 - 65535"
            >
            </RadioButton>
            <RadioButton
              class="q-my-xs q-px-sm"
              v-model:opt="datatype"
              text="Uint32"
              hint="0 - 429496..."
            >
            </RadioButton>
          </div>
          <div>
            <RadioButton
              class="q-my-xs q-mr-sm"
              v-model:opt="datatype"
              text="Int8"
              hint="-128 - 127"
            >
            </RadioButton>
            <RadioButton
              class="q-my-xs q-mr-sm"
              v-model:opt="datatype"
              text="Int16"
              hint="-32768 - 3..."
            >
            </RadioButton>
            <RadioButton
              class="q-my-xs q-px-sm"
              v-model:opt="datatype"
              text="Int32"
              hint="-21474836..."
            >
            </RadioButton>
          </div>
          <div>
            <RadioButton
              class="q-my-xs q-px-sm q-mr-sm"
              v-model:opt="datatype"
              text="Int"
              hint="-2^63 - (2^...)"
            >
            </RadioButton>
            <RadioButton
              class="q-my-xs q-px-md"
              v-model:opt="datatype"
              text="Double"
              hint="1.7E 1/- 3..."
            >
            </RadioButton>
          </div>
        </div>
      </div>
    </div>
  </q-card>
</template>

<script setup lang="ts">
import RadioButton from './RadioButton.vue';
import { ref, watch } from 'vue';

const emit = defineEmits(['update:datatype']);
const datatype = ref('None');

watch(datatype, (newVal) => emit('update:datatype', newVal));
</script>
