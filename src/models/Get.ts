type Query = {
  depth: number;
};

type Get = {
  uuid?: string;
  path?: string;
  type?: string;
  rights?: string;
  value?: undefined;
  query?: Query;
  hasChild?: boolean;
};

export type Gets = Get[];
