export type Set = {
  uuid?: string | undefined;
  path?: string;
  type?: string;
  value: string | number | boolean | null | undefined;
  rights?: string;
  create?: boolean;
  hasChild?: boolean;
};

export type Sets = Set[];
