<template>
  <div class="q-gutter-md">
    <q-btn dense flat round icon="person" :color="userStore.user ? 'green' : ''">
      <q-menu ref="refLoginMenu">
        <q-list style="min-width: 100px">
          <q-item v-if="userStore.user" class="text-primary">{{ userStore.user?.username }}</q-item>
          <q-item clickable v-close-popup @click="openLogin">
            <q-item-section class="text-primary">{{ loginText }}</q-item-section>
          </q-item>
        </q-list>
      </q-menu>
    </q-btn>
  </div>
  <LoginForm ref="refLoginForm"></LoginForm>
</template>

<script setup lang="ts">
import LoginForm from './LoginForm.vue';
import { computed, ref } from 'vue';
import { useLogin } from './login';
import { useUserStore } from './userStore';
import { useNotify } from '../general/useNotify';

const userStore = useUserStore();
const userLogin = useLogin();
const { NotifyResponse } = useNotify();

const loginText = computed(() => {
  return userStore.user ? 'Logout' : 'Login';
});

const refLoginForm = ref();

function openLogin() {
  if (userStore.user) {
    const username = userStore.user.username;
    userLogin.logout();
    NotifyResponse("user '" + username + "' logged out", 'warning');
    return;
  }
  refLoginForm.value?.open();
}
</script>
