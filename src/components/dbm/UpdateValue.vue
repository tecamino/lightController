<template>
  <QCard v-if="props.display"> Test </QCard>
</template>

<script setup lang="ts">
const props = defineProps({
  display: {
    type: Boolean,
    default: true,
    required: true,
  },
});
</script>
