export type Publish = {
  event: string;
  uuid: string;
  path: string;
  type: string;
  value: string | number | boolean | null;
};
export type Pubs = Publish[];

import { updateSubscriptionValue } from './Subscriptions';

export function publishToSubscriptions(pubs: Pubs) {
  pubs.forEach((pub) => {
    updateSubscriptionValue(pub.uuid, pub.value);
  });
}
