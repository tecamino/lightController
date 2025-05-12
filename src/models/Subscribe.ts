export type Subscribe = {
  uuid?: string | undefined;
  path?: string | undefined;
  depth?: number;
  value?: string | number | boolean | undefined;
};

export type Subs = Subscribe[];
