import * as THREE from 'three';

export const characters = [
  { id: 'capybara', name: 'Capybara', note: 'Unbothered. Along for the ride.' },
  { id: 'duck', name: 'Duck', note: 'Small wings. Big adventure.' },
  { id: 'quokka', name: 'Quokka', note: 'Every turn is a reason to smile.' },
  { id: 'white-dog', name: 'White dog', note: 'Your very good travel buddy.' },
  {
    id: 'black-cat',
    name: 'Black cat',
    note: 'Curious about what’s around the bend.',
  },
] as const;
export type CharacterId = (typeof characters)[number]['id'];

/** Shared toy models for the character picker and the actual passenger. */
export function createCharacter(id: CharacterId) {
  const group = new THREE.Group();
  group.name = `rider-${id}`;
  const palette: Record<
    CharacterId,
    { fur: string; muzzle: string; ear: string }
  > = {
    capybara: { fur: '#a67b51', muzzle: '#bb9369', ear: '#75553d' },
    duck: { fur: '#f2d585', muzzle: '#dc9344', ear: '#f1cf74' },
    quokka: { fur: '#b59670', muzzle: '#e0c7a0', ear: '#806044' },
    'white-dog': { fur: '#f3ebd9', muzzle: '#fff6e6', ear: '#dfcdb4' },
    'black-cat': { fur: '#3b4140', muzzle: '#555b55', ear: '#b98983' },
  };
  const c = palette[id];
  const mats = new Map<string, THREE.MeshStandardMaterial>();
  const material = (color: string) => {
    if (!mats.has(color))
      mats.set(
        color,
        new THREE.MeshStandardMaterial({ color, roughness: 0.92 }),
      );
    return mats.get(color)!;
  };
  function oval(
    name: string,
    color: string,
    x: number,
    y: number,
    z: number,
    sx: number,
    sy: number,
    sz: number,
    parent: THREE.Object3D = group,
  ) {
    const m = new THREE.Mesh(
      new THREE.SphereGeometry(1, 24, 16),
      material(color),
    );
    m.name = name;
    m.position.set(x, y, z);
    m.scale.set(sx, sy, sz);
    m.castShadow = true;
    m.receiveShadow = true;
    parent.add(m);
    return m;
  }
  oval('body', c.fur, 0, 0.33, 0, 0.32, 0.39, 0.27);
  oval(
    'belly',
    id === 'duck' ? '#fff0b9' : c.muzzle,
    0,
    0.32,
    0.22,
    0.23,
    0.28,
    0.065,
  );
  for (const side of [-1, 1]) {
    oval(
      'foot',
      id === 'duck' ? c.muzzle : c.fur,
      side * 0.2,
      0.055,
      0.19,
      0.14,
      0.085,
      id === 'duck' ? 0.23 : 0.17,
    );
    const paw = oval('paw', c.fur, side * 0.31, 0.39, 0.14, 0.1, 0.21, 0.11);
    paw.rotation.z = side * -0.27;
  }
  const head = new THREE.Group();
  head.name = 'head';
  group.add(head);
  head.position.y = 0.84;
  oval(
    'head',
    c.fur,
    0,
    0,
    0.03,
    id === 'capybara' ? 0.35 : 0.32,
    0.29,
    id === 'capybara' ? 0.35 : 0.29,
    head,
  );
  if (id === 'duck') {
    oval('bill', c.muzzle, 0, -0.065, 0.34, 0.23, 0.07, 0.18, head);
    oval('bill-line', '#b7743b', 0, -0.081, 0.48, 0.16, 0.009, 0.015, head);
    oval('tail', c.fur, 0, 0.26, -0.29, 0.16, 0.1, 0.2).rotation.x = -0.35;
    oval('tuft', c.fur, 0.02, 0.28, 0.005, 0.05, 0.12, 0.06, head).rotation.z =
      -0.3;
  } else {
    const long = id === 'capybara';
    oval(
      'muzzle',
      c.muzzle,
      0,
      -0.105,
      long ? 0.3 : 0.25,
      long ? 0.28 : 0.21,
      long ? 0.15 : 0.12,
      long ? 0.23 : 0.11,
      head,
    );
    oval(
      'nose',
      '#3a3028',
      0,
      -0.055,
      long ? 0.505 : 0.35,
      long ? 0.065 : 0.055,
      0.04,
      0.028,
      head,
    );
    if (id === 'quokka' || id === 'white-dog') {
      for (const side of [-1, 1]) {
        const smile = oval(
          'smile',
          '#58463a',
          side * 0.045,
          -0.155,
          0.34,
          0.043,
          0.012,
          0.012,
          head,
        );
        smile.rotation.z = side * 0.23;
      }
    }
    for (const side of [-1, 1]) {
      if (id === 'black-cat') {
        const ear = new THREE.Mesh(
          new THREE.ConeGeometry(0.15, 0.31, 3),
          material(c.fur),
        );
        ear.position.set(side * 0.23, 0.26, 0.015);
        ear.rotation.z = side * -0.18;
        ear.rotation.y = Math.PI;
        head.add(ear);
        const inner = new THREE.Mesh(
          new THREE.ConeGeometry(0.085, 0.19, 3),
          material(c.ear),
        );
        inner.position.set(side * 0.23, 0.28, 0.068);
        inner.rotation.z = side * -0.18;
        inner.rotation.y = Math.PI;
        head.add(inner);
      } else if (id === 'white-dog') {
        oval(
          'floppy-ear',
          c.ear,
          side * 0.3,
          -0.01,
          -0.015,
          0.11,
          0.24,
          0.14,
          head,
        ).rotation.z = side * 0.18;
      } else {
        const big = id === 'quokka';
        oval(
          'ear',
          c.fur,
          side * 0.24,
          0.22,
          -0.02,
          big ? 0.135 : 0.085,
          big ? 0.17 : 0.09,
          0.08,
          head,
        );
        oval(
          'inner-ear',
          c.ear,
          side * 0.24,
          0.23,
          0.05,
          big ? 0.075 : 0.046,
          big ? 0.1 : 0.045,
          0.025,
          head,
        );
      }
    }
    if (id === 'black-cat') {
      const path = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0.1, -0.2),
        new THREE.Vector3(0.36, 0.13, -0.4),
        new THREE.Vector3(0.48, 0.45, -0.3),
        new THREE.Vector3(0.36, 0.56, -0.3),
      ]);
      const tail = new THREE.Mesh(
        new THREE.TubeGeometry(path, 24, 0.055, 8, false),
        material(c.fur),
      );
      tail.name = 'curled-tail';
      group.add(tail);
    } else if (id !== 'capybara') {
      oval('tail', c.fur, 0, 0.19, -0.31, 0.13, 0.17, 0.19).rotation.x = 0.6;
    }
  }
  for (const side of [-1, 1]) {
    const ex = id === 'capybara' ? 0.25 : 0.145,
      ez = id === 'capybara' ? 0.25 : 0.275;
    if (id === 'black-cat') {
      oval(
        'eye-iris',
        '#d6bb67',
        side * ex,
        0.04,
        ez,
        0.052,
        0.064,
        0.026,
        head,
      );
      oval(
        'eye-pupil',
        '#17201c',
        side * ex,
        0.04,
        ez + 0.023,
        0.019,
        0.049,
        0.015,
        head,
      );
    } else
      oval('eye', '#292a23', side * ex, 0.045, ez, 0.036, 0.043, 0.025, head);
    oval(
      'eye-glint',
      '#fff8df',
      side * ex - 0.008,
      0.06,
      ez + 0.025,
      0.01,
      0.012,
      0.008,
      head,
    );
  }
  // A small moss-green neckerchief ties the little woodland crew together.
  oval('scarf', '#7e9569', 0, 0.61, 0.035, 0.285, 0.06, 0.27);
  oval('scarf-knot', '#9cad7c', 0.13, 0.56, 0.25, 0.055, 0.1, 0.04).rotation.z =
    -0.35;
  return group;
}

export function disposeCharacter(group: THREE.Object3D) {
  const mats = new Set<THREE.Material>();
  group.traverse((o) => {
    if (o instanceof THREE.Mesh) {
      o.geometry.dispose();
      (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) =>
        mats.add(m),
      );
    }
  });
  mats.forEach((m) => m.dispose());
}
