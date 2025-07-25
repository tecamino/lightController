<template>
  <q-menu ref="contextMenuRef" context-menu>
    <q-list>
      <q-item :clickable="!disableAll" v-close-popup @click="handleAction('Add')">
        <q-item-section>
          <div class="row">
            <div class="col-5">
              <q-icon
                :color="disableAll ? 'grey-5' : 'primary'"
                class="q-pr-sm"
                name="add"
                size="xs"
                left
              />
            </div>
            <div :class="['col-7', disableAll ? 'text-grey-5' : 'text-primary']">Add</div>
          </div>
        </q-item-section>
      </q-item>
      <q-item
        :class="disable ? 'text-grey-5' : ''"
        :clickable="!disable"
        v-close-popup
        @click="handleAction('Rename')"
        ><q-item-section>
          <div class="row">
            <div class="col-5">
              <q-icon
                :color="disable ? 'grey-5' : 'primary'"
                class="q-pr-sm"
                name="edit"
                size="xs"
                left
              />
            </div>
            <div :class="['col-7', disable ? 'text-grey-5' : 'text-primary']">Rename</div>
          </div>
        </q-item-section>
      </q-item>
      <q-item
        :class="disable ? 'text-grey-5' : ''"
        :clickable="!disable"
        v-close-popup
        @click="handleAction('Delete')"
        ><q-item-section>
          <div class="row">
            <div class="col-5">
              <q-icon
                :color="disable ? 'grey-5' : 'primary'"
                class="q-pr-sm"
                name="delete"
                size="xs"
                left
              />
            </div>
            <div :class="['col-7', disable ? 'text-grey-5' : 'text-primary']">Delete</div>
          </div>
        </q-item-section>
      </q-item>
      <q-item
        :color="disable ? 'grey-5' : 'primary'"
        :clickable="!disable"
        v-close-popup
        @click="handleAction('Copy')"
      >
        <q-item-section>
          <div class="row">
            <div class="col-5">
              <q-icon
                :color="disable ? 'grey-5' : 'primary'"
                class="q-pr-sm"
                name="content_copy"
                size="xs"
                left
              />
            </div>
            <div :class="['col-7', disable ? 'text-grey-5' : 'text-primary']">Copy</div>
          </div>
        </q-item-section>
      </q-item>
      <q-item
        :color="disable ? 'grey-5' : 'primary'"
        :clickable="!disable"
        v-close-popup
        @click="handleAction('Datatype')"
      >
        <q-item-section>
          <div class="row">
            <div class="col-5">
              <q-icon
                :color="disable ? 'grey-5' : 'primary'"
                class="q-pr-sm"
                name="text_fields"
                size="xs"
                left
              />
            </div>
            <div :class="['col-7', disable ? 'text-grey-5' : 'text-primary']">Datatype</div>
          </div>
        </q-item-section>
      </q-item>
    </q-list>
  </q-menu>
  <RenameDatapoint :dialogLabel="label" width="700px" button-ok-label="Rename" ref="renameDialog" />
  <AddDialog :dialogLabel="label" width="700px" button-ok-label="Add" ref="addDialog" />
  <RemoveDialog :dialogLabel="label" width="350px" button-ok-label="Remove" ref="removeDialog" />
  <CopyDialog :dialogLabel="label" width="300px" button-ok-label="Copy" ref="copyDialog" />
  <UpdateDatapoint
    :dialogLabel="label"
    width="300px"
    button-ok-label="Update"
    ref="datatypeDialog"
  />
</template>

<script setup lang="ts">
import AddDialog from './dialog/AddDatapoint.vue';
import RemoveDialog from './dialog/RemoveDatapoint.vue';
import CopyDialog from './dialog/CopyDatapoint.vue';
import UpdateDatapoint from './dialog/UpdateDatatype.vue';
import { ref } from 'vue';
import { type TreeNode } from '../dbm/dbmTree';
import { findSubscriptionByUuid } from '../models/Subscriptions';
import RenameDatapoint from './dialog/RenameDatapoint.vue';

const ZERO_UUID = '00000000-0000-0000-0000-000000000000';
const renameDialog = ref();
const addDialog = ref();
const removeDialog = ref();
const copyDialog = ref();
const datatypeDialog = ref();
const datapointUuid = ref('');
const contextMenuRef = ref();
const label = ref('');
const disable = ref(false);
const disableAll = ref(false);

function handleAction(action: string) {
  switch (action) {
    case 'Rename':
      label.value = 'Rename Datapoint';
      renameDialog.value?.open(datapointUuid.value);
      break;
    case 'Add':
      label.value = 'Add New Datapoint';
      addDialog.value?.open(datapointUuid.value);
      break;
    case 'Delete':
      label.value = 'Remove Datapoint';
      removeDialog.value.open(datapointUuid.value);
      break;
    case 'Copy':
      label.value = 'Copy Datapoint';
      copyDialog.value.open(datapointUuid.value);
      break;
    case 'Datatype':
      label.value = 'Update Datatype';
      datatypeDialog.value.open(datapointUuid.value);
      break;
  }
}

const open = (event: MouseEvent, sub: TreeNode) => {
  disable.value = false;
  disableAll.value = false;

  if (findSubscriptionByUuid(sub.key ?? '')?.path?.includes('System')) {
    disable.value = true;
    disableAll.value = true;
  }
  if (sub.key === ZERO_UUID) disable.value = true;

  event.preventDefault();
  datapointUuid.value = sub.key ?? '';
  contextMenuRef.value?.show(event);
};

defineExpose({ open });
</script>
