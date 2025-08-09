<template>
  <DialogFrame ref="Dialog" width="300px" height="380px" header-title="Login">
    <div class="text-black"></div>
    <q-form ref="refForm">
      <q-item-section class="q-gutter-md q-pa-md">
        <q-card :class="['q-gutter-xs q-items-center q-pa-lg', { shake: shake }]">
          <div class="text-h5 text-primary text-center">{{ productName }}</div>
          <q-input
            ref="refUserInput"
            dense
            filled
            type="text"
            label="User"
            v-model="user"
            :rules="[(val) => !!val || 'User is required']"
          ></q-input>
          <q-input
            dense
            filled
            type="password"
            label="Password"
            v-model="password"
            @keyup.enter="onSubmit"
            :rules="[(val) => !!val || 'Password is required']"
          ></q-input>
          <div class="q-pt-sm q-mr-md row justify-end">
            <q-btn color="primary" label="Login" @click="onSubmit"></q-btn>
          </div>
        </q-card>
      </q-item-section>
    </q-form>
  </DialogFrame>
</template>

<script setup lang="ts">
import { productName } from '../../../package.json';
import { ref, nextTick } from 'vue';
import DialogFrame from '../dialog/DialogFrame.vue';
import { useNotify } from '../general/useNotify';
import { useLogin } from './login';

const { NotifyResponse } = useNotify();
const Dialog = ref();
const refForm = ref();
const refUserInput = ref();
const user = ref('');
const password = ref('');
const { login } = useLogin();

const shake = ref(false);

const open = () => {
  Dialog.value?.open();
  nextTick(() => {
    refUserInput.value?.focus();
  }).catch((err) => console.error(err));
};

const onSubmit = () => {
  refForm.value?.validate().then((success: boolean) => {
    if (success) {
      login(user.value, password.value)
        .then(() => {
          NotifyResponse("logged in as '" + user.value + "'");
          Dialog.value.close();
        })
        .catch((err) => {
          NotifyResponse(err, 'error');
          shake.value = true;
          setTimeout(() => {
            shake.value = false;
          }, 500);
        });
    } else {
      NotifyResponse('error submitting login form', 'error');
    }
  });
};

defineExpose({ open });
</script>

<style scoped>
@keyframes shake {
  0% {
    transform: translateX(0);
  }
  20% {
    transform: translateX(-8px);
  }
  40% {
    transform: translateX(8px);
  }
  60% {
    transform: translateX(-6px);
  }
  80% {
    transform: translateX(6px);
  }
  100% {
    transform: translateX(0);
  }
}

.shake {
  animation: shake 0.4s ease;
  border: 2px solid #f44336;
}
</style>
