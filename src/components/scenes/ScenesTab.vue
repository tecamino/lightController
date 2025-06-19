<template>
  <!-- new edit scene dialog-->
  <q-dialog v-model="showDialog" persistent>
    <q-card style="min-width: 350px">
      <q-card-section>
        <div class="text-primary text-h6">{{ dialogLabel }}</div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <q-input
          class="q-mb-md"
          dense
          v-model="newScene.name"
          placeholder="Name"
          autofocus
          :rules="[(val) => !!val || 'Field is required']"
          @keyup.enter="saveScene"
        />
        <q-input
          dense
          v-model="newScene.description"
          placeholder="Description"
          autofocus
          @keyup.enter="saveScene"
        />
        <div class="q-py-md">
          <div class="q-gutter-sm">
            <q-checkbox v-model="newScene.movingHead" label="Moving Head" />
            <q-checkbox v-model="newScene.lightBar" label="Light Bar" />
          </div>
        </div>
      </q-card-section>

      <q-card-actions align="right" class="text-primary">
        <q-btn flat label="Cancel" v-close-popup />
        <q-btn flat :label="dialogLabel" @click="saveScene" />
      </q-card-actions>
    </q-card>
  </q-dialog>
  <Dialog
    dialogLabel="Duplicate Scene"
    :text="`Scene '${newScene.name}' exists already`"
    :show-dialog="existsAlready"
    v-on:update:show-dialog="existsAlready = $event"
  />
  <q-list
    bordered
    v-if="items.length > 0"
    class="q-mx-auto"
    style="max-width: 100%; max-width: 500px"
  >
    <q-btn
      rounded
      color="primary"
      :class="['q-ma-md', 'text-bold', 'text-white']"
      @click="openAddDialog"
      >Add New Scene</q-btn
    >
    <q-item class="row">
      <q-item-section :class="['text-black', 'text-bold', 'col-5']">Name</q-item-section>
      <q-item-section :class="['text-black', 'text-left', 'text-bold', 'text-left']"
        >Description</q-item-section
      >
    </q-item>
    <q-item
      v-for="(item, index) in items"
      :key="item.name"
      bordered
      style="border: 0.1px solid lightgray; border-radius: 5px; margin-bottom: 1px"
    >
      <q-item-section
        @click="openLoadDialog(item.name)"
        :class="['text-black', 'text-left', 'cursor-pointer']"
        style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis"
        >{{ item.name }}</q-item-section
      >
      <q-item-section
        @click="openLoadDialog(item.name)"
        :class="['text-black', 'text-left', 'cursor-pointer']"
        left
        style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis"
        >{{ item.description }}</q-item-section
      >
      <q-item-section top side>
        <div class="text-grey-8 q-gutter-xs">
          <q-btn size="12px" flat dense round icon="delete" @click="removeScene(item.name)" />
          <q-btn
            size="12px"
            flat
            dense
            round
            icon="more_vert"
            @click="openEditDialog(item, index)"
          />
        </div>
      </q-item-section>
    </q-item>
  </q-list>
  <!-- Fallback if list is empty -->
  <div v-else class="q-pa-md text-grey text-center">
    <div>No scenes available</div>
    <q-btn
      rounded
      color="primary"
      :class="['q-ma-md', 'text-bold', 'text-white']"
      @click="openAddDialog"
      >Add First Scene</q-btn
    >
  </div>
</template>

<script setup lang="ts">
import { NotifyDialog } from 'src/composables/notify';
import { onMounted, ref } from 'vue';
import { useQuasar } from 'quasar';
import type { Scene } from 'src/models/Scene';
import type { Set } from 'src/models/Set';
import axios from 'axios';
import { api } from 'boot/axios';
import { NotifyResponse } from 'src/composables/notify';
import Dialog from 'src/components/dialog/okDialog.vue';
import { setValues } from 'src/services/websocket';
const $q = useQuasar();
const showDialog = ref(false);
const isEdit = ref(false);
const isLoad = ref(false);
const existsAlready = ref(false);
const editIndex = ref(-1);
const dialogLabel = ref('');
const newScene = ref<Scene>({
  name: '',
  movingHead: false,
  lightBar: false,
});

const items = ref<Scene[]>([]);

const quasarApi = axios.create({
  baseURL: `http://localhost:9500`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

onMounted(() => {
  quasarApi
    .get('/api/loadScenes')
    .then((resp) => {
      if (resp.data) {
        items.value = resp.data as Scene[];
      }
    })
    .catch((err) => NotifyResponse($q, err.response.data.error, 'error'));
});

function removeScene(name: string) {
  NotifyDialog($q, 'Delete', 'Do you want to delete scene: ' + name, 'YES', 'NO')
    .then((res) => {
      if (res) {
        items.value = items.value.filter((s) => s.name !== name);
        quasarApi
          .delete('/api/deleteScene', {
            data: { name },
          })
          .then((res) => {
            if (res.data) {
              NotifyResponse($q, res.data, 'warning');
            }
          })
          .catch((err) => {
            NotifyResponse($q, err.response.data.error, 'error');
          });
      }
    })
    .catch((err) => NotifyResponse($q, err.resp, 'warning'));
}
function openAddDialog() {
  isEdit.value = false;
  dialogLabel.value = 'Add Scene';

  newScene.value = {
    name: '',
    movingHead: true,
    lightBar: true,
  };
  showDialog.value = true;
}

function openEditDialog(scene: Scene, index: number) {
  isEdit.value = true;
  dialogLabel.value = 'Update Scene';
  console.log(76, scene);
  newScene.value = { ...scene };
  editIndex.value = index;
  showDialog.value = true;
}

const saveScene = async () => {
  if (!newScene.value.name) {
    return;
  }
  const exists = items.value.some(
    (item, index) => item.name === newScene.value.name && index !== editIndex.value,
  );

  if (exists) {
    if (isLoad.value) {
      console.log(44, 'load');
      const setPaths = <Set[]>[];

      newScene.value.values?.forEach((element) => {
        setPaths.push({ path: element.path, value: element.value });
      });

      setValues(setPaths)
        .then((response) => NotifyResponse($q, response))
        .catch((err) => console.error(`Failed to load scene ${newScene.value.name}`, err));
      isLoad.value = false;
      showDialog.value = false;
      return;
    }
    existsAlready.value = true;
    return;
  }

  if (isEdit.value && editIndex.value !== -1) {
    items.value[editIndex.value] = { ...newScene.value };
  } else {
    items.value.push(newScene.value);
  }

  // Sort alphabetically by scene name
  items.value.sort((a, b) => a.name.localeCompare(b.name));

  const sendValues = [];
  if (newScene.value.movingHead) {
    sendValues.push({
      path: 'MovingHead',
      query: { depth: 0 },
    });
  }

  if (newScene.value.lightBar) {
    sendValues.push({
      path: 'LightBar',
      query: { depth: 0 },
    });
  }
  console.log(33, sendValues);
  if (sendValues.length > 0) {
    try {
      const res = await api.post('/json_data', { get: sendValues });
      newScene.value.values = res.data.get;
    } catch (err) {
      NotifyResponse($q, err as Error, 'error');
    }
  } else {
    newScene.value.values = [];
  }

  quasarApi
    .post('/api/saveScene', JSON.stringify(newScene.value))
    .then((res) => {
      if (res.data) {
        NotifyResponse($q, res.data);
      }
    })
    .catch((err) => {
      NotifyResponse($q, err.response.data.error, 'error');
    });

  showDialog.value = false;
};

function openLoadDialog(name: string) {
  isLoad.value = true;
  quasarApi
    .post('/api/loadScene', { name })
    .then((res) => {
      if (res.data) {
        const scene = res.data as Scene;
        newScene.value = scene;
        newScene.value.name = name;
        showDialog.value = true;
        isEdit.value = true;
        dialogLabel.value = 'Load Scene';
      }
    })
    .catch((err) => NotifyResponse($q, err.response.data.error, 'error'));
}
</script>
