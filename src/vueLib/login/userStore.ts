import { defineStore } from 'pinia';
import { jwtDecode } from 'jwt-decode';
import type { QVueGlobals } from 'quasar';

interface JwtPayload {
  id: string;
  role: string;
  username: string;
  exp?: number;
  iat?: number;
}

interface UserState {
  token: string | null;
  user: JwtPayload | null;
}

let $q = <QVueGlobals>{};

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    token: null,
    user: null,
  }),
  getters: {
    isAuthenticated: (state): boolean => !!state.token && !!state.user,
  },
  actions: {
    isAuthorizedAs(roles: string[]) {
      return !!this.token && !!this.user && roles.includes(this.user.role);
    },
    setToken(token: string) {
      try {
        const decoded = jwtDecode<JwtPayload>(token);
        this.token = token;
        this.user = decoded;
        localStorage.setItem('token', token);

        if (decoded.exp) {
          const timeUntilExpiry = decoded.exp * 1000 - Date.now();
          if (timeUntilExpiry > 0) {
            setTimeout(() => {
              this.logout();
            }, timeUntilExpiry);
          } else {
            this.logout();
          }
        }
      } catch (err) {
        console.error('Invalid token:', err);
        this.logout();
      }
    },
    logout() {
      $q?.notify({
        message: "user '" + this.user?.username + "' logged out",
        color: 'orange',
        position: 'bottom-right',
        icon: 'warning',
        timeout: 5000,
      });
      this.token = null;
      this.user = null;
      localStorage.removeItem('token');

      setTimeout(() => {
        window.location.href = '/';
      }, 5000);
    },
    loadFromStorage() {
      const token = localStorage.getItem('token');
      if (token) {
        this.setToken(token);
      }
    },
    initStore(q: QVueGlobals) {
      $q = q;
    },
  },
});
