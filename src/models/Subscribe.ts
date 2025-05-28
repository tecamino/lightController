export type Subscribe = {
  uuid?: string | undefined;
  path?: string | undefined;
  depth?: number;
  value?: string | number | boolean | undefined;
  hasChild?: boolean;
};

export type Subs = Subscribe[];
