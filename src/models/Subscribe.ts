export type Subscribe = {
  uuid?: string;
  path?: string;
  depth?: number;
  value?: string | number | boolean | undefined;
};

export type Subs = Subscribe[];
