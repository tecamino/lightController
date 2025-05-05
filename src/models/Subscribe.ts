export type Subscribe = {
  uuid?: string;
  path?: string;
  depth?: number;
  value?: string | undefined;
};

export type Subs = Subscribe[];
