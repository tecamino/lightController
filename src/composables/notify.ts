import type { Response } from 'src/models/Response';
import type { QVueGlobals } from 'quasar';

export function NotifyResponse(
  $q: QVueGlobals,
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
      color = 'orange';
      icon = 'error';
      break;
  }

  if (response) {
    const message = typeof response === 'string' ? response : (response.message ?? '');
    if (message === '') {
      return;
    }
    color = typeof response === 'string' ? response : response?.error ? 'red' : color;
    icon = typeof response === 'string' ? response : response?.error ? 'error' : icon;
    $q?.notify({
      message: message,
      color: color,
      position: 'bottom-right',
      icon: icon,
      timeout: timeout,
    });
  }
}
