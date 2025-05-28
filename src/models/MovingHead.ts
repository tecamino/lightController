export type MovingHead = {
  State: boolean;
  Brightness: number;
  Red: number;
  Green: number;
  Blue: number;
  White: number;
  Zoom: number;
  Pan: number;
  Tilt: number;
};

export type Settings = {
  show: boolean;
  reversePan: boolean;
  reverseTilt: boolean;
  startAddress: number;
};
