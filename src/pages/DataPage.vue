<template>
  <q-btn class="q-ma-md" label="Save DBM" color="primary" push @click="saveDBM"></q-btn>
  <DBMTree></DBMTree>
</template>

<script setup lang="ts">
import DBMTree from 'src/vueLib/dbm/DBMTree.vue';
import { dbmApi } from 'src/boot/axios';
import { useNotify } from 'src/vueLib/general/useNotify';
import { catchError } from 'src/vueLib/models/error';

const { NotifyResponse } = useNotify();

function saveDBM() {
  dbmApi
    .get('saveData')
    .then((resp) => NotifyResponse(resp.data))
    .catch((err) => NotifyResponse(catchError(err), 'error'));
}
</script>
