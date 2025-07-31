import type { Driver } from './Drivers';
import type { Gets } from './Get';
import type { Sets } from './Set';
import type { Subs } from './Subscribe';
import { api } from 'src/boot/axios';

export type Request = {
  get?: Gets;
  set?: Sets;
  subscribe?: Subs;
  unsubscribe?: Subs;
};

const query = '/json_data';

export async function getRequest(
  uuid: string,
  path: string = '',
  depth: number = 1,
): Promise<Gets> {
  let payload = {};
  if (uuid !== '') {
    payload = { uuid: uuid, path: path, query: { depth: depth } };
  } else {
    payload = { path: path, query: { depth: depth } };
  }

  const resp = await api.post(query, {
    get: [payload],
  });

  if (resp.data.get && resp.data.get.length > 0) {
    return resp.data.get;
  } else {
    throw new Error('No data returned');
  }
}

export async function getRequests(gets: Gets): Promise<Gets> {
  const resp = await api.post(query, {
    get: gets,
  });

  if (resp.data.get && resp.data.get.length > 0) {
    return resp.data.get;
  } else {
    throw new Error('No data returned');
  }
}

export async function rawSetsRequest(sets: Sets): Promise<Sets> {
  const resp = await api.post(query, {
    set: sets,
  });

  if (resp.data.set && resp.data.set.length > 0) {
    return resp.data.set;
  } else {
    throw new Error('No data returned');
  }
}

export async function setRequest(
  path: string,
  type?: string,
  value?: string | number | boolean,
  rights?: string,
  uuid?: string,
  driver?: Driver,
  rename?: boolean,
): Promise<Sets> {
  const payload = {
    path: path,
    type: type,
    value: value,
    rights: rights,
    uuid: uuid,
    driver: driver,
    rename: rename,
  };

  const resp = await api.post(query, {
    set: [payload],
  });

  if (resp.data.set && resp.data.set.length > 0) {
    return resp.data.set;
  } else {
    throw new Error('No data returned');
  }
}

export async function setsRequest(sets: Sets): Promise<Sets> {
  const resp = await api.post(query, {
    set: sets,
  });

  if (resp.data.set && resp.data.set.length > 0) {
    return resp.data.set;
  } else {
    throw new Error('No data returned');
  }
}

export async function deleteRequest(
  uuid?: string,
  path?: string,
  driver?: Driver,
  rename?: boolean,
): Promise<Sets> {
  let payload = {};
  if (uuid) {
    payload = { uuid: uuid, driver: driver, rename: rename };
  } else if (path) {
    payload = { path: path, driver: driver };
  }
  const resp = await api.delete('/json_data', {
    data: {
      set: [payload],
    },
  });

  if (resp.data.set && resp.data.set.length > 0) {
    return resp.data.set;
  } else {
    throw new Error('No data returned');
  }
}
