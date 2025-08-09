<template>
  <q-dialog
    ref="dialogRef"
    :maximized="minMaxState"
    :full-width="minMaxState"
    :no-focus="!minMaxState"
    :no-refocus="!minMaxState"
    :seamless="!minMaxState"
  >
    <q-card class="layout" :style="cardStyle">
      <!-- Draggable Header -->
      <div
        class="dialog-header row items-center justify-between bg-grey-1"
        v-touch-pan.mouse.prevent.stop="handlePan"
      >
        <div v-if="headerTitle" class="text-left text-bold text-caption q-mx-sm">
          {{ headerTitle }}
        </div>
        <div class="row justify-end q-mx-sm">
          <q-btn dense flat :icon="minMaxIcon" size="md" @click="minMax" />
          <q-btn dense flat icon="close" size="md" v-close-popup />
        </div>
      </div>

      <q-separator color="black" />

      <!-- Content Slot -->
      <div class="scrollArea">
        <slot />
      </div>

      <!-- Resize Handle -->
      <div v-if="!minMaxState" class="resize-handle" @mousedown.prevent="startResizing" />
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

const dialogRef = ref();
const open = () => dialogRef.value?.show();
const close = () => dialogRef.value?.hide();
defineExpose({ open, close });

const props = defineProps({
  headerTitle: { type: String, default: '' },
  width: { type: String, default: '400' },
  height: { type: String, default: '250' },
});

// Fullscreen toggle
const minMaxIcon = ref('fullscreen');
const minMaxState = ref(false);
function minMax() {
  minMaxState.value = !minMaxState.value;
  minMaxIcon.value = minMaxState.value ? 'fullscreen_exit' : 'fullscreen';
}

// Position and Size
const position = ref({ x: 0, y: 0 });
const width = ref(parseInt(props.width));
const height = ref(parseInt(props.height));

// Dragging (only from header)
const handlePan = (details: { delta: { x: number; y: number } }) => {
  if (!minMaxState.value) {
    position.value.x += details.delta.x;
    position.value.y += details.delta.y;
  }
};

// Resizing
const isResizing = ref(false);
function startResizing(e: MouseEvent) {
  isResizing.value = true;
  const startX = e.clientX;
  const startY = e.clientY;
  const startWidth = width.value;
  const startHeight = height.value;

  function onMouseMove(e: MouseEvent) {
    width.value = Math.max(200, startWidth + e.clientX - startX);
    height.value = Math.max(200, startHeight + e.clientY - startY);
  }

  function onMouseUp() {
    isResizing.value = false;
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('mouseup', onMouseUp);
  }

  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('mouseup', onMouseUp);
}

// Styles
const cardStyle = computed(() => {
  if (minMaxState.value) {
    return {};
  }

  return {
    width: `${width.value}px`,
    height: `${height.value}px`,
    transform: `translate(${position.value.x}px, ${position.value.y}px)`,
  };
});
</script>

<style scoped>
.layout {
  position: relative;
  display: flex;
  flex-direction: column;
  border-radius: 10px;
  background-color: white;
}

/* Draggable header */
.dialog-header {
  padding: 8px 0;
  background: #f5f5f5;
  cursor: move;
  user-select: none;
}

/* Scrollable content */
.scrollArea {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  padding: 16px;
}

/* Resize handle in bottom right */
.resize-handle {
  position: absolute;
  width: 16px;
  height: 16px;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.1);
  cursor: nwse-resize;
  z-index: 10;
}
</style>
