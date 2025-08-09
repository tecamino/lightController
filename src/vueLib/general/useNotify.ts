import type { Response } from '../models/Response';
import { useQuasar } from 'quasar';

export function useNotify() {
  const $q = useQuasar();
  function NotifyResponse(
    response: Response | string | undefined,
    type?: 'warning' | 'error',
    timeout: number = 5000,
  ) {
    let color = 'green';
    let icon = 'check_circle';

    switch (type) {
      case 'warning':
        color = 'orange';
        icon = 'warning';
        break;
      case 'error':
        color = 'red';
        icon = 'error';
        break;
    }

    if (response instanceof Error) {
      const resp = response as Response;
      if (resp.response?.data?.error) {
        $q?.notify({
          message: resp.response.data.message as string,
          color: color,
          position: 'bottom-right',
          icon: icon,
          timeout: timeout,
        });
        return;
      }
    }
    if (response) {
      const message = typeof response === 'string' ? response : (response.message ?? '');
      if (message === '') {
        return;
      }

      color = typeof response === 'string' ? color : response?.error ? 'red' : color;
      icon = typeof response === 'string' ? icon : response?.error ? 'error' : icon;
      $q?.notify({
        message: message,
        color: color,
        position: 'bottom-right',
        icon: icon,
        timeout: timeout,
      });
    }
  }

  function NotifyDialog(title: string, text: string, okText?: string, cancelText?: string) {
    return new Promise((resolve) => {
      $q.dialog({
        title: title,
        message: text,
        persistent: true,
        ok: okText ?? 'OK',
        cancel: cancelText ?? 'CANCEL',
      })
        .onOk(() => {
          resolve(true);
        })
        .onCancel(() => {
          resolve(false);
        })
        .onDismiss(() => {
          resolve(false);
        });
    });
  }
  return {
    NotifyDialog,
    NotifyResponse,
  };
}
