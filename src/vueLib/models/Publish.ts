export type Publish = {
  event: string;
  uuid: string;
  path: string;
  type: string;
  value: string | number | boolean | null;
  hasChild: boolean;
};
export type Pubs = Publish[];

import { updateSubscriptionValue, removeRawSubscriptions } from './Subscriptions';
import { buildTree, buildTreeWithRawSubs, removeNodes } from '../dbm/dbmTree';
import type { RawSubs, RawSubscribe } from '../models/Subscribe';
import { ref } from 'vue';
import { UpdateTable } from '../dbm/updateTable';
import { pathIsExpanded } from '../dbm/dbmTree';

export function publishToSubscriptions(pubs: Pubs) {
  let event = '';
  const rawSubs = ref<RawSubs>([]);
  pubs.forEach((pub) => {
    switch (pub.event) {
      case 'onCreate':
        event = 'onCreate';
        if (!pathIsExpanded(pub.path)) break;
        pub.hasChild = pubs.length > 0;
        rawSubs.value.push(pub as RawSubscribe);
        break;
      case 'onChange':
        break;
      case 'onDelete':
        event = 'onDelete';
        rawSubs.value.push(pub as RawSubscribe);
        break;
    }
    updateSubscriptionValue(pub.uuid, pub.value);
  });

  switch (event) {
    case 'onCreate':
      buildTreeWithRawSubs(rawSubs.value);
      break;
    case 'onDelete':
      buildTree(null);
      removeRawSubscriptions(rawSubs.value);
      UpdateTable();
      removeNodes(pubs);
      break;
  }
}
