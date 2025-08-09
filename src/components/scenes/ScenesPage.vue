<template>
  <!-- new edit scene dialog-->
  <DialogFrame ref="sceneDialog" width="350px">
    <q-card>
      <q-card-section>
        <div class="text-primary text-h6">{{ dialogLabel }}</div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <q-input
          :readonly="dialog === 'load'"
          class="q-mb-md"
          dense
          v-model="newScene.name"
          placeholder="Name"
          autofocus
          :rules="[(val) => !!val || 'Field is required']"
          @keyup.enter="saveScene"
        />
        <q-input
          :readonly="dialog === 'load'"
          dense
          v-model="newScene.description"
          placeholder="Description"
          autofocus
          @keyup.enter="saveScene"
        />
        <div class="q-py-md">
          <div class="q-gutter-sm">
            <q-checkbox v-model="newScene.stageLights" label="Stage Lights" />
            <q-checkbox v-model="newScene.lightBar" label="Light Bar" />
            <q-checkbox v-model="newScene.floodPanels" label="Flood Panels" />
            <q-checkbox v-model="newScene.movingHead" label="Moving Head" />
          </div>
        </div>
      </q-card-section>

      <q-card-actions align="right" class="text-primary">
        <q-btn flat :label="dialogLabel" v-close-popup @click="saveScene()" />
      </q-card-actions>
    </q-card>
  </DialogFrame>
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
      no-caps
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
      no-caps
      color="primary"
      :class="['q-ma-md', 'text-bold', 'text-white']"
      @click="openDialog('add')"
      >Add First Scene</q-btn
    >
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import type { Scene } from 'src/models/Scene';
import type { Set } from 'src/vueLib/models/Set';
import { dbmApi } from 'src/boot/axios';
import { useNotify } from 'src/vueLib/general/useNotify';
import Dialog from 'src/components/dialog/OkDialog.vue';
import { setValues } from 'src/vueLib/services/websocket';
import DialogFrame from 'src/vueLib/dialog/DialogFrame.vue';
import { catchError } from 'src/vueLib/models/error';
import { appApi } from 'src/boot/axios';

const { NotifyResponse, NotifyDialog } = useNotify();
const sceneDialog = ref();
const dialog = ref('');
const existsAlready = ref(false);
const editIndex = ref(-1);
const dialogLabel = ref('');
const newScene = reactive<Scene>({
  name: '',
  stageLights: false,
  lightBar: false,
  floodPanels: false,
  movingHead: false,
});

const scenes = ref<Scene[]>([]);

onMounted(() => {
  appApi
    .get('/loadScenes')
    .then((resp) => {
      if (resp.data) {
        scenes.value = resp.data;
      }
    })
    .catch((err) => {
      NotifyResponse(catchError(err), 'error');
    });
});

function removeScene(name: string) {
  dialog.value = '';
  NotifyDialog('Delete', 'Do you want to delete scene: ' + name, 'YES', 'NO')
    .then((res) => {
      if (res) {
        scenes.value = scenes.value.filter((s) => s.name !== name);
        appApi
          .delete('/deleteScene', {
            data: { name },
          })
          .then((res) => {
            if (res.data) {
              NotifyResponse(res.data, 'warning');
            }
          })
          .catch((err) => {
            NotifyResponse(catchError(err), 'error');
          });
      }
    })
    .catch((err) => NotifyResponse(catchError(err), 'warning'));
}

function openDialog(dialogType: string, scene?: Scene, index?: number) {
  switch (dialogType) {
    case 'add':
      dialog.value = 'add';
      dialogLabel.value = 'Add Scene';
      newScene.name = '';
      newScene.stageLights = true;
      newScene.lightBar = true;
      newScene.floodPanels = true;
      newScene.movingHead = true;

      break;
    case 'edit':
      if (!scene) return;
      if (index === undefined) return;
      dialog.value = 'edit';
      dialogLabel.value = 'Update Scene';
      editIndex.value = index;
      Object.assign(newScene, JSON.parse(JSON.stringify(scene)));
      break;
    case 'load':
      if (!scene) return;
      dialog.value = 'load';
      dialogLabel.value = 'Load Scene';
      appApi
        .post('/loadScene', scene)
        .then((res) => {
          if (res.data) {
            Object.assign(newScene, JSON.parse(JSON.stringify(res.data)));
          }
        })
        .catch((err) => NotifyResponse(catchError(err), 'error'));
      break;
  }
  sceneDialog.value.open();
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

      if (newScene.stageLights) {
        sendValues.push({
          path: 'StageLights',
          query: { depth: 0 },
        });
      }

      if (newScene.lightBar) {
        sendValues.push({
          path: 'LightBar',
          query: { depth: 0 },
        });
      }

      if (newScene.floodPanels) {
        sendValues.push({
          path: 'FloodPanels',
          query: { depth: 0 },
        });
      }

      if (newScene.movingHead) {
        sendValues.push({
          path: 'MovingHead',
          query: { depth: 0 },
        });
      }

      if (sendValues.length > 0) {
        try {
          const res = await dbmApi.post('/json_data', { get: sendValues });
          newScene.values = res.data.get;
        } catch (err) {
          NotifyResponse(err as Error, 'error');
        }
      } else {
        newScene.values = [];
      }

      scenes.value = [...scenes.value, JSON.parse(JSON.stringify(newScene))];

      // Sort alphabetically by scene name
      scenes.value.sort((a, b) => a.name.localeCompare(b.name));

      appApi
        .post('/saveScene', JSON.stringify(newScene))
        .then((res) => {
          if (res.data) {
            NotifyResponse(res.data);
          }
        })
        .catch((err) => {
          NotifyResponse(catchError(err), 'error');
        });
      scenes.value = [...scenes.value];
      break;

    case 'edit':
      if (exists) {
        existsAlready.value = true;
        return;
      }

      if (newScene.stageLights) {
        sendValues.push({
          path: 'StageLights',
          query: { depth: 0 },
        });
      }

      if (newScene.lightBar) {
        sendValues.push({
          path: 'LightBar',
          query: { depth: 0 },
        });
      }

      if (newScene.floodPanels) {
        sendValues.push({
          path: 'FloodPanels',
          query: { depth: 0 },
        });
      }

      if (newScene.movingHead) {
        sendValues.push({
          path: 'MovingHead',
          query: { depth: 0 },
        });
      }

      if (sendValues.length > 0) {
        try {
          const res = await dbmApi.post('/json_data', { get: sendValues });
          newScene.values = res.data.get;
        } catch (err) {
          NotifyResponse(err as Error, 'error');
        }
      } else {
        newScene.values = [];
      }
      scenes.value.splice(editIndex.value, 1, JSON.parse(JSON.stringify(newScene)));
      scenes.value.sort((a, b) => a.name.localeCompare(b.name));
      scenes.value = [...scenes.value];

      appApi
        .post('/saveScene', JSON.stringify(newScene))
        .then((res) => {
          if (res.data) {
            NotifyResponse(res.data);
          }
        })
        .catch((err) => {
          NotifyResponse(catchError(err), 'error');
        });
      scenes.value = [...scenes.value];
      break;

    case 'load':
      {
        const setPaths = <Set[]>[];

        newScene.values?.forEach((element) => {
          if (!element.path) return;

          if (newScene.stageLights && element.path.includes('StageLights'))
            setPaths.push({ uuid: element.uuid, path: element.path, value: element.value });

          if (newScene.lightBar && element.path.includes('LightBar'))
            setPaths.push({ uuid: element.uuid, path: element.path, value: element.value });

          if (newScene.floodPanels && element.path.includes('FloodPanels'))
            setPaths.push({ uuid: element.uuid, path: element.path, value: element.value });

          if (newScene.movingHead && element.path.includes('MovingHead'))
            setPaths.push({ uuid: element.uuid, path: element.path, value: element.value });
        });

        setValues(setPaths)
          .then((response) => {
            NotifyResponse(response);
          })
          .catch((err) => {
            NotifyResponse(`Failed to load scene ${newScene.name}`, 'warning');
            NotifyResponse(catchError(err), 'error');
          });
      }
      break;
  }

  dialog.value = '';
};
</script>
