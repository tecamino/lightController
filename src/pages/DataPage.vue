<template>
  <q-btn class="q-ma-md" label="Save DBM" color="primary" push @click="saveDBM"></q-btn>
  <DBMTree></DBMTree>
</template>

<script setup lang="ts">
import DBMTree from 'src/components/dbm/DBMTree.vue';
import { api } from 'src/boot/axios';
import { NotifyResponse } from 'src/composables/notify';
import { useQuasar } from 'quasar';

const $q = useQuasar();

function saveDBM() {
  api
    .get('saveData')
    .then((resp) => NotifyResponse($q, resp.data))
    .catch((err) => NotifyResponse($q, err));
}
</script>
