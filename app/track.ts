import * as THREE from 'three';
export const track = new THREE.CatmullRomCurve3(
  [
    [-17, 1.4, 9],
    [-11, 1.5, 13],
    [-3, 2.4, 15],
    [7, 5, 14],
    [16, 9, 9],
    [20, 10, 1],
    [17, 7, -7],
    [10, 3.8, -9],
    [5, 2.8, -3],
    [1, 3, 1],
    [-3, 5, -2],
    [-1, 9, -10],
    [-5, 11, -17],
    [-14, 9, -15],
    [-20, 5, -9],
    [-23, 2.2, -1],
    [-22, 1.5, 5],
  ].map(([x, y, z]) => new THREE.Vector3(x, y, z)),
  true,
  'catmullrom',
  0.32,
);
export const trackLength = track.getLength();
const up = new THREE.Vector3(0, 1, 0);
export function trackFrame(t: number) {
  const u = ((t % 1) + 1) % 1,
    p = track.getPointAt(u),
    f = track.getTangentAt(u).normalize(),
    r = new THREE.Vector3().crossVectors(up, f).normalize();
  return { p, f, r };
}
