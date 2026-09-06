export type DriveInput = {
  power: boolean;
  brake: boolean;
  left: boolean;
  right: boolean;
};
export const emptyInput: DriveInput = {
  power: false,
  brake: false,
  left: false,
  right: false,
};
export function advanceRide(
  speed: number,
  slope: number,
  dt: number,
  mode: 'scenic' | 'drive',
  input: DriveInput,
) {
  const delta = Math.min(Math.max(dt, 0), 0.05);
  const power =
    mode === 'scenic'
      ? Math.max(0, Math.min(1, (3.4 - speed) * 0.8 + 0.25))
      : input.power
        ? 1
        : 0;
  const brake = input.brake ? 1 : 0;
  const acceleration =
    power * 3.4 - slope * 4.5 - 0.16 - speed * 0.06 - brake * 8;
  return {
    speed: Math.max(0, Math.min(7.6, speed + acceleration * delta)),
    power,
    brake,
  };
}
export function crossedStations(previous: number, next: number): number[] {
  const end = next < previous ? next + 1 : next;
  const result: number[] = [];
  for (let i = 1; i <= 6; i++) {
    const marker = i / 6;
    if (previous < marker && end >= marker) result.push(i % 6);
  }
  return result;
}
