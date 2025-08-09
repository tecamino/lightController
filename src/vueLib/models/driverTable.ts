import { reactive, ref } from 'vue';
import type { QTableColumn } from 'quasar';
import type { Subscribe } from './Subscribe';
import type { Bus } from './Bus';
import type { Topic } from './Topic';

export type DriverTableRow = {
  type: string;
  buses?: Bus[];
  topic?: Topic;
  bus: string;
  address?: number | undefined;
  subscribe?: string;
  publish?: string;
};

const driverTable = reactive<DriverTableRow[]>([]);
const columns = ref<QTableColumn[]>([]);
const baseColumns: QTableColumn[] = [
  { name: 'type', label: 'Driver Name', field: 'type', align: 'left' },
  { name: 'bus', label: 'Bus Name', field: 'bus', align: 'center' },
  { name: 'address', label: 'Address', field: 'address', align: 'center' },
  { name: 'settings', label: '', field: 'settings', align: 'center' },
];

export function updateDriverTable(sub: Subscribe) {
  driverTable.length = 0;
  let hasSubs = false;
  let hasPubs = false;

  if (sub.drivers)
    Object.entries(sub.drivers).forEach(([driverName, driverData]) => {
      driverData.buses?.forEach((bus) => {
        hasSubs = bus.topic?.subscribe !== undefined || hasSubs;
        hasPubs = bus.topic?.publish !== undefined || hasPubs;

        const subscribeList = bus.topic?.subscribe ?? [];
        const publishList = bus.topic?.publish ?? [];

        const addresses = bus.address?.length ? bus.address : [undefined];

        addresses.forEach((addr) => {
          driverTable.push({
            type: driverName,
            bus: bus.name,
            address: addr,
            subscribe: subscribeList.join(', '),
            publish: publishList.join(', '),
          });
        });
      });
    });
  reloadColumns(hasSubs, hasPubs);
}
export function useDriverTable() {
  function emptyTable() {
    driverTable.length = 0;
  }

  return {
    driverTable,
    emptyTable,
    columns,
  };
}

function reloadColumns(hasSubs: boolean, hasPubs: boolean) {
  columns.value = [...baseColumns];
  const settingsIndex = columns?.value.findIndex((col) => col.name === 'settings');

  if (hasSubs) {
    columns.value?.splice(settingsIndex ?? -1, 0, {
      name: 'subscribe',
      label: 'subscribe',
      field: 'subscribe',
      align: 'left',
    });
  }
  if (hasPubs) {
    columns.value?.splice(settingsIndex ?? -1, 0, {
      name: 'publish',
      label: 'publish',
      field: 'publish',
      align: 'left',
    });
  }
}
