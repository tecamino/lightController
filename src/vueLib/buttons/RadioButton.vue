<template>
  <q-btn style="border-radius: 8px" no-caps
    ><q-radio v-model="opt" :val="props.text"></q-radio>
    <div class="column items-start q-mx-sm">
      <div class="text-body1 text-black">{{ props.text }}</div>
      <div class="text-caption text-grey">{{ props.hint }}</div>
    </div>
  </q-btn>
</template>

<script setup lang="ts">
import { watch, ref } from 'vue';

const opt = defineModel('opt');

const props = defineProps({
  text: {
    type: String,
    required: true,
  },
  hint: {
    type: String,
  },
});

const localOption = ref('');

const emit = defineEmits(['update:option']);

watch(localOption, (val) => emit('update:option', val));
</script>
