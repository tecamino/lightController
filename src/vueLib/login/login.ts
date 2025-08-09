import { appApi } from 'src/boot/axios';
import { useUserStore } from './userStore';

const useStore = useUserStore();

export function useLogin() {
  async function login(user: string, password: string) {
    await appApi
      .post('/login', { user: user, password: password })
      .then((resp) => {
        useStore.setToken(resp.data.token);
      })
      .catch((err) => {
        throw err;
      });
  }

  function logout() {
    useStore.logout();
  }

  function isTokenValid() {
    const token = localStorage.getItem('token');
    if (token === null) return false;
    const payload = JSON.parse(atob(token.split('.')[1] ?? ''));
    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp > currentTime;
  }

  return { login, logout, isTokenValid };
}
