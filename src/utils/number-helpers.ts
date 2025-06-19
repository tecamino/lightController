import type { Ref } from 'vue';

export function separate16BitUint(value: number): { highByte: number; lowByte: number } {
  // Ensure the value is treated as a 16-bit unsigned integer
  // (optional, but good for clarity and safety if 'value' might be outside 0-65535)
  const normalizedValue = value & 0xffff; // Mask to ensure it's within 16 bits

  // Extract the low byte (least significant 8 bits)
  // This is simply the value modulo 256, or bitwise AND with 0xFF
  const lowByte = normalizedValue & 0xff;

  // Extract the high byte (most significant 8 bits)
  // Right shift by 8 bits to move the high byte into the low byte's position,
  // then mask with 0xFF to get just those 8 bits.
  const highByte = (normalizedValue >> 8) & 0xff;

  return { highByte, lowByte };
}

export function combineBytesTo16BitUint(highByte: number, lowByte: number): number {
  // Ensure both bytes are within the 0-255 range for safety
  const safeHighByte = highByte & 0xff;
  const safeLowByte = lowByte & 0xff;

  // Shift the high byte 8 bits to the left to place it in the higher position.
  // Example: if highByte is 0xA4 (10100100), after shifting it becomes 0xA400 (1010010000000000).
  const shiftedHighByte = safeHighByte << 8;

  // Combine the shifted high byte with the low byte using a bitwise OR.
  // Example: if shiftedHighByte is 0xA400 and lowByte is 0x78 (01111000),
  // the result is 0xA478 (1010010001111000).
  const combinedValue = shiftedHighByte | safeLowByte;

  // Optional: Mask the result to ensure it's strictly within the 16-bit unsigned range (0 to 65535).
  // This is good practice as JavaScript numbers are 64-bit floats, and this ensures
  // the value wraps correctly if intermediate operations somehow exceeded 16 bits.
  return combinedValue & 0xffff;
}

export function addOne(val: Ref<number>, limit: number) {
  if (val.value < limit) {
    val.value++;
  }
}

export function substractOne(val: Ref<number>, limit: number) {
  if (val.value > limit) {
    val.value--;
  }
}
