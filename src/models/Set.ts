export type Set = {
  uuid?: string | undefined;
  path: string;
  type?: string;
  value: string | number | boolean | undefined;
  create?: boolean;
};

export type Sets = Set[];
