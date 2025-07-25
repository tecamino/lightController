type Query = {
  depth: number;
};

type Get = {
  uuid?: string;
  path?: string;
  type?: string;
  rights?: string;
  value?: string | number | boolean | null;
  query?: Query;
  hasChild?: boolean;
};

export type Gets = Get[];
