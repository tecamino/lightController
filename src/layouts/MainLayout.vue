<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-img
          :src="logo"
          alt="Logo"
          style="width: 40px; height: 40px; background-color: var(--q-primary)"
          class="q-mr-sm"
        />
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" />

        <q-toolbar-title> Light Control </q-toolbar-title>

        <div>Version {{ version }}</div>
        <q-btn dense icon="refresh" square class="q-px-md q-ml-md" @click="refresh" />
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" bordered>
      <q-list>
        <q-item to="/" exact clickable v-ripple @click="closeDrawer">
          <q-item-section>Home</q-item-section>
        </q-item>
        <q-item to="/scenes" clickable v-ripple @click="closeDrawer">
          <q-item-section>Scenes</q-item-section>
        </q-item>
        <q-item to="/data" clickable v-ripple @click="closeDrawer">
          <q-item-section>Data</q-item-section>
        </q-item>
      </q-list>
    </q-drawer>
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import logo from 'src/assets/LOGO_CF-ICON_color.svg';
import { ref } from 'vue';
import { version } from '../..//package.json';

const leftDrawerOpen = ref(false);

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}

function closeDrawer() {
  leftDrawerOpen.value = false;
}

function refresh() {
  window.location.reload();
}
</script>
