import type { Gets } from '../models/Get';
import type { Sets } from '../models/Set';

export function datapointRequestForCopy(response: Gets, oldPath: string, newPath: string): Sets {
  const copySet = <Sets>[];

  response.forEach((get) => {
    copySet.push({
      path: typeof get.path === 'string' ? get.path.replace(oldPath, newPath) : '',
      type: get.type ? get.type : '',
      value: get.value,
      rights: get.rights ? get.rights : '',
    });
  });
  return copySet;
}

export function convertFromType(type: string): string {
  switch (type) {
    case 'STR':
      return 'string';
    case 'BIT':
      return 'bool';
    case 'BYU':
      return 'uint8';
    case 'WOU':
      return 'uint16';
    case 'DWU':
      return 'uint32';
    case 'BYS':
      return 'int8';
    case 'WOS':
      return 'int16';
    case 'DWS':
      return 'int32';
    case 'LOU':
      return 'uint64';
    case 'LOS':
      return 'int64';
    case 'F64':
      return 'double';
    default:
      return 'none';
  }
}

export function convertToType(type: string): string {
  switch (type) {
    case 'String':
      return 'STR';
    case 'Bool':
      return 'BIT';
    case 'Uint8':
      return 'BYU';
    case 'Int8':
      return 'BYS';
    case 'Uint16':
      return 'WOU';
    case 'Int16':
      return 'WOS';
    case 'Uint32':
      return 'DWU';
    case 'Int32':
      return 'DWS';
    case 'Int':
      return 'LOS';
    case 'Double':
      return 'F64';
    default:
      return 'NONE';
  }
}
