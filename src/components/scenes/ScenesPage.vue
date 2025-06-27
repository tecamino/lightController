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
        <q-btn flat :label="dialogLabel" @click="saveScene()" />
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
    v-if="scenes?.length > 0"
    class="q-mx-auto"
    style="max-width: 100%; max-width: 500px"
  >
    <q-btn
      rounded
      color="primary"
      :class="['q-ma-md', 'text-bold', 'text-white']"
      @click="openDialog('add')"
      >Add New Scene</q-btn
    >
    <q-item class="row">
      <q-item-section :class="['text-black', 'text-bold', 'col-5']">Name</q-item-section>
      <q-item-section :class="['text-black', 'text-left', 'text-bold', 'text-left']"
        >Description</q-item-section
      >
    </q-item>
    <q-item
      v-for="(item, index) in scenes"
      :key="item.name"
      bordered
      style="border: 0.1px solid lightgray; border-radius: 5px; margin-bottom: 1px"
    >
      <q-item-section
        @click="openDialog('load', item)"
        :class="['text-black', 'text-left', 'cursor-pointer']"
        style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis"
        >{{ item.name }}</q-item-section
      >
      <q-item-section
        @click="openDialog('load', item)"
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
            @click="openDialog('edit', item, index)"
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
      @click="openDialog('add')"
      >Add First Scene</q-btn
    >
  </div>
</template>

<script setup lang="ts">
import { NotifyDialog } from 'src/composables/notify';
import { onMounted, reactive, ref } from 'vue';
import { useQuasar } from 'quasar';
import type { Scene } from 'src/models/Scene';
import type { Set } from 'src/models/Set';
import axios from 'axios';
import { api } from 'boot/axios';
import { NotifyResponse } from 'src/composables/notify';
import Dialog from 'src/components/dialog/OkDialog.vue';
import { setValues } from 'src/services/websocket';
const $q = useQuasar();
const showDialog = ref(false);
const dialog = ref('');
const existsAlready = ref(false);
const editIndex = ref(-1);
const dialogLabel = ref('');
const newScene = reactive<Scene>({
  name: '',
  movingHead: false,
  lightBar: false,
});

const scenes = ref<Scene[]>([]);

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
        scenes.value = resp.data;
      }
    })
    .catch((err) => NotifyResponse($q, err.response.data.error, 'error'));
});

function removeScene(name: string) {
  dialog.value = '';
  NotifyDialog($q, 'Delete', 'Do you want to delete scene: ' + name, 'YES', 'NO')
    .then((res) => {
      if (res) {
        scenes.value = scenes.value.filter((s) => s.name !== name);

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

function openDialog(dialogType: string, scene?: Scene, index?: number) {
  switch (dialogType) {
    case 'add':
      dialog.value = 'add';
      dialogLabel.value = 'Add Scene';
      newScene.name = '';
      newScene.movingHead = true;
      newScene.lightBar = true;
      showDialog.value = true;
      break;
    case 'edit':
      if (!scene) return;
      if (index === undefined) return;
      dialog.value = 'edit';
      dialogLabel.value = 'Update Scene';
      editIndex.value = index;
      Object.assign(newScene, JSON.parse(JSON.stringify(scene)));
      showDialog.value = true;
      break;
    case 'load':
      if (!scene) return;
      dialog.value = 'load';
      dialogLabel.value = 'Load Scene';
      quasarApi
        .post('/api/loadScene', scene)
        .then((res) => {
          if (res.data) {
            Object.assign(newScene, JSON.parse(JSON.stringify(res.data)));
            showDialog.value = true;
          }
        })
        .catch((err) => NotifyResponse($q, err.response.data.error, 'error'));
      break;
    default:
      showDialog.value = false;
      break;
  }
}

const saveScene = async () => {
  const sendValues = [];

  if (!newScene.name) {
    return;
  }

  const exists = scenes.value.some(
    (item, index) => item.name === newScene.name && index !== editIndex.value,
  );

  switch (dialog.value) {
    case 'add':
      if (exists) {
        existsAlready.value = true;
        return;
      }

      if (newScene.movingHead) {
        sendValues.push({
          path: 'MovingHead',
          query: { depth: 0 },
        });
      }

      if (newScene.lightBar) {
        sendValues.push({
          path: 'LightBar',
          query: { depth: 0 },
        });
      }

      if (sendValues.length > 0) {
        try {
          const res = await api.post('/json_data', { get: sendValues });
          newScene.values = res.data.get;
        } catch (err) {
          NotifyResponse($q, err as Error, 'error');
        }
      } else {
        newScene.values = [];
      }

      scenes.value = [...scenes.value, JSON.parse(JSON.stringify(newScene))];

      // Sort alphabetically by scene name
      scenes.value.sort((a, b) => a.name.localeCompare(b.name));

      quasarApi
        .post('/api/saveScene', JSON.stringify(newScene))
        .then((res) => {
          if (res.data) {
            NotifyResponse($q, res.data);
          }
        })
        .catch((err) => {
          NotifyResponse($q, err.response.data.error, 'error');
        });
      scenes.value = [...scenes.value];
      break;
    case 'edit':
      if (exists) {
        existsAlready.value = true;
        return;
      }

      if (newScene.movingHead) {
        sendValues.push({
          path: 'MovingHead',
          query: { depth: 0 },
        });
      }

      if (newScene.lightBar) {
        sendValues.push({
          path: 'LightBar',
          query: { depth: 0 },
        });
      }

      if (sendValues.length > 0) {
        try {
          const res = await api.post('/json_data', { get: sendValues });
          newScene.values = res.data.get;
        } catch (err) {
          NotifyResponse($q, err as Error, 'error');
        }
      } else {
        newScene.values = [];
      }
      scenes.value.splice(editIndex.value, 1, JSON.parse(JSON.stringify(newScene)));
      scenes.value.sort((a, b) => a.name.localeCompare(b.name));
      scenes.value = [...scenes.value];

      quasarApi
        .post('/api/saveScene', JSON.stringify(newScene))
        .then((res) => {
          if (res.data) {
            NotifyResponse($q, res.data);
          }
        })
        .catch((err) => {
          NotifyResponse($q, err.response.data.error, 'error');
        });
      scenes.value = [...scenes.value];
      break;
    case 'load':
      {
        const setPaths = <Set[]>[];

        if (newScene.movingHead) {
          newScene.values?.forEach((element) => {
            if (element.path && element.path.includes('MovingHead')) {
              setPaths.push({ path: element.path, value: element.value });
            }
          });
        }

        if (newScene.lightBar) {
          newScene.values?.forEach((element) => {
            if (element.path && element.path.includes('LightBar')) {
              setPaths.push({ path: element.path, value: element.value });
            }
          });
        }
        setValues(setPaths)
          .then((response) => {
            NotifyResponse($q, response);
          })
          .catch((err) => console.error(`Failed to load scene ${newScene.name}`, err));
      }
      break;
  }

  dialog.value = '';
  showDialog.value = false;
};
</script>
