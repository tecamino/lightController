// API type (from backend)
export type Subscribe = {
  uuid?: string;
  path?: string;
  depth?: number;
  value?: string | number | boolean;
  hasChild?: boolean;
};

export type Subs = Subscribe[];
