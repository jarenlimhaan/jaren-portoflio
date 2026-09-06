'use client';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { track, trackLength, trackFrame } from './track';
import { advanceRide, crossedStations, type DriveInput } from './ride-physics';
import { characters, createCharacter, type CharacterId } from './characters';
export type RideStats = {
  speed: number;
  power: number;
  brake: number;
  progress: number;
  slope: number;
};
export type ViewMode = 'pov' | 'chase' | 'world';
type Props = {
  character: CharacterId;
  started: boolean;
  playing: boolean;
  mode: 'scenic' | 'drive';
  view: ViewMode;
  reduced: boolean;
  input: DriveInput;
  reset: number;
  onReady: () => void;
  onError: () => void;
  onStation: (n: number) => void;
  onStats: (s: RideStats) => void;
};
const names = [
  'WELCOME ABOARD',
  'CLOUD & RELIABILITY',
  'THE AI WORKSHOP',
  'BACKEND JUNCTION',
  'COMMUNITY CROSSING',
  'THE NEXT CHAPTER',
];
export default function Woodland(props: Props) {
  const host = useRef<HTMLDivElement>(null),
    state = useRef(props);
  useEffect(() => {
    state.current = props;
  }, [props]);
  useEffect(() => {
    const el = host.current;
    if (!el) return;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        powerPreference: 'high-performance',
      });
    } catch {
      state.current.onError();
      return;
    }
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.65));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.07;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    el.appendChild(renderer.domElement);
    renderer.domElement.setAttribute(
      'aria-label',
      'Interactive rollercoaster through Jaren’s woodland engineering world. Use W to accelerate, S to brake, and C to change camera.',
    );
    renderer.domElement.setAttribute('role', 'img');
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#d6c6a9');
    scene.fog = new THREE.Fog('#d2c4a4', 48, 140);
    const camera = new THREE.PerspectiveCamera(66, 1, 0.06, 300);
    scene.add(camera);
    const materials = new Map<string, THREE.MeshStandardMaterial>();
    const mat = (color: string) => {
      if (!materials.has(color))
        materials.set(
          color,
          new THREE.MeshStandardMaterial({ color, roughness: 0.87 }),
        );
      return materials.get(color)!;
    };
    const mesh = (
      geo: THREE.BufferGeometry,
      c: string,
      x = 0,
      y = 0,
      z = 0,
      parent: THREE.Object3D = scene,
    ) => {
      const m = new THREE.Mesh(geo, mat(c));
      m.position.set(x, y, z);
      m.castShadow = true;
      m.receiveShadow = true;
      parent.add(m);
      return m;
    };
    const box = (
      w: number,
      h: number,
      d: number,
      c: string,
      x: number,
      y: number,
      z: number,
      parent: THREE.Object3D = scene,
    ) => mesh(new THREE.BoxGeometry(w, h, d), c, x, y, z, parent);
    const sphere = (
      r: number,
      c: string,
      x: number,
      y: number,
      z: number,
      parent: THREE.Object3D = scene,
    ) => mesh(new THREE.IcosahedronGeometry(r, 2), c, x, y, z, parent);
    let seed = 14;
    const rand = () => {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return seed / 4294967296;
    };
    scene.add(new THREE.HemisphereLight('#fff0d3', '#76805d', 2.0));
    const sun = new THREE.DirectionalLight('#ffcd85', 3.2);
    sun.position.set(-27, 24, 16);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    Object.assign(sun.shadow.camera, {
      left: -38,
      right: 38,
      top: 38,
      bottom: -38,
      near: 0.5,
      far: 110,
    });
    sun.shadow.normalBias = 0.055;
    sun.shadow.bias = -0.00012;
    sun.shadow.radius = 4;
    scene.add(sun);
    const fill = new THREE.DirectionalLight('#c5d8db', 0.55);
    fill.position.set(25, 15, -30);
    scene.add(fill);
    const sky = new THREE.Mesh(
      new THREE.SphereGeometry(230, 32, 20),
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        depthWrite: false,
        uniforms: {
          zenith: { value: new THREE.Color('#90aeb8') },
          horizon: { value: new THREE.Color('#f4d7a5') },
        },
        vertexShader:
          'varying vec3 vP; void main(){vP=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
        fragmentShader:
          'uniform vec3 zenith;uniform vec3 horizon;varying vec3 vP;void main(){vec3 p=normalize(vP);float h=pow(max(p.y,0.),.65);vec3 c=mix(horizon,zenith,h);float s=pow(max(dot(p,normalize(vec3(-.7,.24,.4))),0.),180.);c+=vec3(1.,.65,.22)*s*.9;gl_FragColor=vec4(c,1.);}',
      }),
    );
    scene.add(sky);
    const sunDisc = new THREE.Mesh(
      new THREE.SphereGeometry(5.8, 24, 16),
      new THREE.MeshBasicMaterial({ color: '#ffe0a4', fog: false }),
    );
    sunDisc.position.set(-120, 42, 68);
    scene.add(sunDisc);
    const ground = (x: number, z: number) =>
      -0.2 +
      0.35 * Math.sin(x * 0.08) * Math.cos(z * 0.13) +
      0.18 * Math.sin(x * 0.21 + z * 0.13);
    const terrain = new THREE.PlaneGeometry(230, 230, 140, 140);
    terrain.rotateX(-Math.PI / 2);
    const pa = terrain.attributes.position,
      colors = [];
    const gc1 = new THREE.Color('#8c9a62'),
      gc2 = new THREE.Color('#b2b37a');
    for (let i = 0; i < pa.count; i++) {
      const x = pa.getX(i),
        z = pa.getZ(i);
      const distance = Math.hypot(x, z);
      const hills =
        Math.max(0, distance - 35) *
        0.08 *
        (0.6 + 0.4 * Math.sin(x * 0.07) * Math.cos(z * 0.09));
      pa.setY(i, ground(x, z) + hills);
      const mix =
        0.5 +
        0.17 * Math.sin(x * 2.3) * Math.cos(z * 2.1) +
        0.13 * Math.sin(x * 0.31 + z * 0.23);
      const c = gc1.clone().lerp(gc2, mix);
      colors.push(c.r, c.g, c.b);
    }
    terrain.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    terrain.computeVertexNormals();
    const land = new THREE.Mesh(
      terrain,
      new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1 }),
    );
    land.receiveShadow = true;
    scene.add(land);
    // Rolling silhouettes and a forest keep every onboard direction inside the world.
    for (let i = 0; i < 17; i++) {
      const a = (i / 17) * Math.PI * 2;
      const hill = sphere(
        1,
        ['#829376', '#95a184', '#a3ad91'][i % 3],
        Math.cos(a) * 91,
        2,
        Math.sin(a) * 91,
      );
      hill.scale.set(25 + rand() * 15, 9 + rand() * 13, 20 + rand() * 15);
      hill.castShadow = false;
    }
    const cloudGeo = new THREE.IcosahedronGeometry(1, 2);
    const cloudMat = new THREE.MeshStandardMaterial({
      color: '#f4e3c6',
      roughness: 1,
      transparent: true,
      opacity: 0.75,
      flatShading: false,
    });
    for (let i = 0; i < 14; i++) {
      const x = (rand() - 0.5) * 150,
        z = (rand() - 0.5) * 150,
        y = 23 + rand() * 15;
      for (let j = 0; j < 4; j++) {
        const puff = new THREE.Mesh(cloudGeo, cloudMat);
        puff.position.set(x + j * 2, y + Math.sin(j) * 0.8, z);
        puff.scale.set(3 + rand(), 1 + rand(), 1.5 + rand());
        scene.add(puff);
      }
    }
    const lake = mesh(
      new THREE.CylinderGeometry(1, 1, 0.06, 70),
      '#7caba1',
      7,
      -0.06,
      3,
    );
    lake.scale.set(7.8, 1, 5);
    lake.material = new THREE.MeshStandardMaterial({
      color: '#82b0a8',
      roughness: 0.23,
      metalness: 0.18,
    });
    for (let i = 0; i < 28; i++) {
      const a = (i / 28) * Math.PI * 2;
      const rock = sphere(
        0.4 + rand() * 0.25,
        '#b5ad8d',
        7 + Math.cos(a) * 7.9,
        0.05,
        3 + Math.sin(a) * 5.05,
      );
      rock.scale.set(1, 0.55, 1);
    }
    const samples = Array.from({ length: 350 }, (_, i) =>
      track.getPointAt(i / 350),
    );
    const nearTrack = (x: number, z: number, limit: number) =>
      samples.some((p) => Math.hypot(x - p.x, z - p.z) < limit);
    const stationPlaces = Array.from({ length: 6 }, (_, i) => {
      const { p, r } = trackFrame(i / 6);
      return p.clone().addScaledVector(r, 3);
    });
    const dummy = new THREE.Object3D();
    const instances = (
      geo: THREE.BufferGeometry,
      c: string,
      transforms: {
        p: THREE.Vector3;
        s: THREE.Vector3;
        q?: THREE.Quaternion;
      }[],
    ) => {
      const inst = new THREE.InstancedMesh(geo, mat(c), transforms.length);
      transforms.forEach((t, i) => {
        dummy.position.copy(t.p);
        dummy.scale.copy(t.s);
        dummy.quaternion.copy(t.q ?? new THREE.Quaternion());
        dummy.updateMatrix();
        inst.setMatrixAt(i, dummy.matrix);
      });
      inst.castShadow = true;
      inst.receiveShadow = true;
      scene.add(inst);
      return inst;
    };
    type Transform = {
      p: THREE.Vector3;
      s: THREE.Vector3;
      q?: THREE.Quaternion;
    };
    const trunks: Transform[] = [],
      pine: Transform[][] = [[], [], []],
      crowns: Transform[][] = [[], [], []];
    for (let i = 0; i < 700; i++) {
      const x = (rand() - 0.5) * 155,
        z = (rand() - 0.5) * 155;
      if (
        Math.hypot(x, z) > 83 ||
        nearTrack(x, z, 1.7) ||
        stationPlaces.some((p) => Math.hypot(x - p.x, z - p.z) < 3.4) ||
        (x - 7) ** 2 / 90 + (z - 3) ** 2 / 38 < 1
      )
        continue;
      const h = 0.75 + rand() * 1.2,
        y = ground(x, z) + Math.max(0, Math.hypot(x, z) - 35) * 0.03;
      trunks.push({
        p: new THREE.Vector3(x, y + h * 0.6, z),
        s: new THREE.Vector3(0.13 * h, 1.3 * h, 0.13 * h),
      });
      const color = i % 3;
      if (rand() > 0.3) {
        for (let j = 0; j < 3; j++)
          pine[color].push({
            p: new THREE.Vector3(x, y + (1.25 + j * 0.55) * h, z),
            s: new THREE.Vector3(
              (0.9 - j * 0.19) * h,
              1.7 * h,
              (0.9 - j * 0.19) * h,
            ),
          });
      } else {
        crowns[color].push({
          p: new THREE.Vector3(x, y + 1.8 * h, z),
          s: new THREE.Vector3(h, 1.2 * h, h),
        });
        crowns[color].push({
          p: new THREE.Vector3(x + 0.5 * h, y + 1.5 * h, z + 0.2 * h),
          s: new THREE.Vector3(h * 0.7, h * 0.8, h * 0.7),
        });
      }
    }
    instances(new THREE.CylinderGeometry(1, 1, 1, 6), '#786746', trunks);
    for (let i = 0; i < 3; i++) {
      instances(
        new THREE.ConeGeometry(1, 1, 8),
        ['#4f6948', '#64784f', '#7c8e58'][i],
        pine[i],
      );
      instances(
        new THREE.IcosahedronGeometry(1, 1),
        ['#788c52', '#8b9b5e', '#637c4b'][i],
        crowns[i],
      );
    }
    const bushes: Transform[] = [],
      flowers: Transform[] = [];
    for (let i = 0; i < 550; i++) {
      const x = (rand() - 0.5) * 65,
        z = (rand() - 0.5) * 55;
      if (nearTrack(x, z, 0.95) || (x - 7) ** 2 / 90 + (z - 3) ** 2 / 38 < 1)
        continue;
      const s = 0.12 + rand() * 0.35;
      bushes.push({
        p: new THREE.Vector3(x, ground(x, z) + s * 0.4, z),
        s: new THREE.Vector3(s, s * 0.65, s),
      });
      if (i % 3 === 0)
        flowers.push({
          p: new THREE.Vector3(x + 0.2, ground(x, z) + 0.25, z),
          s: new THREE.Vector3(0.07, 0.1, 0.07),
        });
    }
    instances(new THREE.IcosahedronGeometry(1, 1), '#92a36c', bushes);
    instances(new THREE.IcosahedronGeometry(1, 1), '#f0d19a', flowers);
    // Rails, ties, trestles and safety rails all follow the same ride spline.
    for (const side of [-1, 1]) {
      const points = [];
      for (let i = 0; i <= 800; i++) {
        const { p, r } = trackFrame(i / 800);
        points.push(p.addScaledVector(r, side * 0.45));
      }
      mesh(
        new THREE.TubeGeometry(
          new THREE.CatmullRomCurve3(points),
          950,
          0.075,
          8,
          false,
        ),
        '#67675b',
      );
      const glints = points.map((p) =>
        p.clone().add(new THREE.Vector3(0, 0.055, 0)),
      );
      mesh(
        new THREE.TubeGeometry(
          new THREE.CatmullRomCurve3(glints),
          950,
          0.026,
          5,
          false,
        ),
        '#b5b6a4',
      );
    }
    const ties: Transform[] = [],
      posts: Transform[] = [],
      braces: Transform[] = [];
    for (let i = 0; i < 580; i++) {
      const { p, f } = trackFrame(i / 580);
      ties.push({
        p: p.clone().add(new THREE.Vector3(0, -0.14, 0)),
        s: new THREE.Vector3(1.5, 0.15, 0.22),
        q: new THREE.Quaternion().setFromUnitVectors(
          new THREE.Vector3(0, 0, 1),
          f,
        ),
      });
    }
    instances(new THREE.BoxGeometry(1, 1, 1), '#a5845e', ties);
    const addBeam = (
      a: THREE.Vector3,
      b: THREE.Vector3,
      w: number,
      dest: Transform[],
    ) =>
      dest.push({
        p: a.clone().add(b).multiplyScalar(0.5),
        s: new THREE.Vector3(w, a.distanceTo(b), w),
        q: new THREE.Quaternion().setFromUnitVectors(
          new THREE.Vector3(0, 1, 0),
          b.clone().sub(a).normalize(),
        ),
      });
    for (let i = 0; i < 90; i++) {
      const { p, r } = trackFrame(i / 90);
      const g = ground(p.x, p.z);
      for (const side of [-1, 1]) {
        const top = p.clone().addScaledVector(r, side * 0.7);
        const bottom = top.clone();
        bottom.y = g;
        addBeam(bottom, top, 0.15, posts);
      }
      if (p.y > 2) {
        const a = p.clone().addScaledVector(r, -0.7),
          b = p.clone().addScaledVector(r, 0.7);
        a.y = g + 0.1;
        addBeam(a, b, 0.085, braces);
        const c = p.clone().addScaledVector(r, 0.7),
          d = p.clone().addScaledVector(r, -0.7);
        c.y = g + 0.1;
        addBeam(c, d, 0.085, braces);
      }
    }
    instances(new THREE.BoxGeometry(1, 1, 1), '#967752', posts);
    instances(new THREE.BoxGeometry(1, 1, 1), '#8b7351', braces);
    // Delicate guardrails make the high sections feel like a crafted toy coaster.
    for (const side of [-1, 1]) {
      const line = [];
      for (let i = 0; i <= 500; i++) {
        const { p, r } = trackFrame(i / 500);
        line.push(
          p.addScaledVector(r, side * 0.89).add(new THREE.Vector3(0, 0.54, 0)),
        );
      }
      mesh(
        new THREE.TubeGeometry(
          new THREE.CatmullRomCurve3(line),
          650,
          0.023,
          4,
          false,
        ),
        '#a58f68',
      );
    }
    const fencePosts: Transform[] = [];
    for (let i = 0; i < 180; i++) {
      const { p, r } = trackFrame(i / 180);
      for (const side of [-1, 1])
        fencePosts.push({
          p: p
            .clone()
            .addScaledVector(r, side * 0.89)
            .add(new THREE.Vector3(0, 0.25, 0)),
          s: new THREE.Vector3(0.038, 0.62, 0.038),
        });
    }
    instances(new THREE.BoxGeometry(1, 1, 1), '#a58f68', fencePosts);
    const labels: THREE.Sprite[] = [],
      tokens: THREE.Group[] = [];
    function sign(text: string, index: number, pos: THREE.Vector3) {
      const c = document.createElement('canvas');
      c.width = 768;
      c.height = 144;
      const ctx = c.getContext('2d')!;
      ctx.fillStyle = '#263c2d';
      ctx.beginPath();
      ctx.roundRect(3, 3, 762, 138, 15);
      ctx.fill();
      ctx.strokeStyle = '#cab589';
      ctx.lineWidth = 5;
      ctx.stroke();
      ctx.fillStyle = '#f3dfb2';
      ctx.font = 'bold 29px Georgia';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(
        `${String(index + 1).padStart(2, '0')}  ·  ${text}`,
        384,
        74,
      );
      const tex = new THREE.CanvasTexture(c);
      tex.colorSpace = THREE.SRGBColorSpace;
      const spr = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex }));
      spr.position.copy(pos);
      spr.scale.set(5.8, 1.09, 1);
      scene.add(spr);
      labels.push(spr);
    }
    for (let i = 0; i < 6; i++) {
      const { p, r, f } = trackFrame(i / 6),
        place = p.clone().addScaledVector(r, 3.0),
        g = new THREE.Group();
      g.position.copy(place).add(new THREE.Vector3(0, -0.3, 0));
      g.rotation.y = Math.atan2(f.x, f.z);
      scene.add(g);
      box(3.8, 0.25, 3.5, '#ab956d', 0, 0, 0, g);
      box(2.1, 1.8, 1.8, '#e3d0a8', 0, 1, -0.15, g);
      const shape = new THREE.Shape();
      shape.moveTo(-1.35, 0);
      shape.lineTo(0, 0.95);
      shape.lineTo(1.35, 0);
      shape.closePath();
      mesh(
        new THREE.ExtrudeGeometry(shape, { depth: 2.25, bevelEnabled: false }),
        ['#ad6647', '#977754', '#ba8153', '#9b6b49', '#aa7854', '#846d50'][i],
        0,
        1.86,
        -1.3,
        g,
      );
      box(0.48, 1.15, 0.06, '#657451', 0, 0.72, 0.78, g);
      for (const x of [-0.68, 0.68]) {
        box(0.38, 0.53, 0.05, '#f4d59a', x, 1.21, 0.79, g);
        box(0.42, 0.04, 0.07, '#a88c5e', x, 1.2, 0.83, g);
        box(0.04, 0.57, 0.07, '#a88c5e', x, 1.2, 0.83, g);
      }
      box(0.32, 1, 0.35, '#9f835e', 0.6, 2.3, -0.5, g);
      for (const x of [-1.5, 1.5])
        for (const z of [-1.2, 1.2])
          box(
            0.16,
            p.y - ground(place.x, place.z),
            0.16,
            '#8f7650',
            x,
            -(p.y - ground(place.x, place.z)) / 2,
            z,
            g,
          );
      sign(names[i], i, place.clone().add(new THREE.Vector3(0, 3.55, 0)));
      const token = new THREE.Group();
      token.position.copy(p).add(new THREE.Vector3(0, 1.5, 0));
      scene.add(token);
      const ring = mesh(
        new THREE.TorusGeometry(0.4, 0.065, 8, 24),
        '#e4b762',
        0,
        0,
        0,
        token,
      );
      ring.material = new THREE.MeshStandardMaterial({
        color: '#e9bf68',
        emissive: '#ac742a',
        emissiveIntensity: 0.3,
        metalness: 0.3,
        roughness: 0.4,
      });
      box(0.33, 0.45, 0.055, '#f2d492', 0, 0, 0, token);
      tokens.push(token);
      // Brass station lanterns, visible from the train.
      for (const side of [-1, 1]) {
        const lp = p.clone().addScaledVector(r, side * 1.3);
        mesh(
          new THREE.CylinderGeometry(0.04, 0.07, 1.8, 8),
          '#5e6146',
          lp.x,
          p.y + 0.8,
          lp.z,
        );
        const lamp = mesh(
          new THREE.SphereGeometry(0.16, 8, 8),
          '#ffe0a1',
          lp.x,
          p.y + 1.8,
          lp.z,
        );
        lamp.material = new THREE.MeshStandardMaterial({
          color: '#ffe8af',
          emissive: '#ffd488',
          emissiveIntensity: 0.8,
        });
      }
    }
    const mill = new THREE.Group();
    mill.position.set(-6, ground(-6, -4), -4);
    scene.add(mill);
    mesh(new THREE.CylinderGeometry(0.6, 1, 4, 8), '#decfac', 0, 2, 0, mill);
    mesh(new THREE.ConeGeometry(1.1, 1.2, 8), '#a97651', 0, 4.5, 0, mill);
    const blades = new THREE.Group();
    blades.position.set(0, 3.5, 0.9);
    mill.add(blades);
    for (let i = 0; i < 4; i++) {
      const arm = new THREE.Group();
      arm.rotation.z = (i * Math.PI) / 2;
      blades.add(arm);
      box(0.07, 2.6, 0.09, '#947c56', 0, 1.1, 0, arm);
      box(0.45, 1.4, 0.05, '#e6d5ad', 0.2, 1.6, 0, arm);
      for (let j = 0; j < 6; j++)
        box(0.5, 0.035, 0.08, '#a58c63', 0.2, 1 + j * 0.24, 0.025, arm);
    }
    const cars: THREE.Group[] = [];
    for (let i = 0; i < 3; i++) {
      const car = new THREE.Group();
      scene.add(car);
      cars.push(car);
      box(1.0, 0.18, 1.6, '#52543d', 0, 0.15, 0, car);
      for (const x of [-0.53, 0.53])
        for (const z of [-0.53, 0.53]) {
          const w = mesh(
            new THREE.CylinderGeometry(0.24, 0.24, 0.12, 12),
            '#4a4c38',
            x,
            0.12,
            z,
            car,
          );
          w.rotation.z = Math.PI / 2;
          const hub = mesh(
            new THREE.CylinderGeometry(0.085, 0.085, 0.14, 10),
            '#c1a365',
            x,
            0.12,
            z,
            car,
          );
          hub.rotation.z = Math.PI / 2;
        }
      if (i === 0) {
        const boiler = mesh(
          new THREE.CylinderGeometry(0.38, 0.38, 0.85, 16),
          '#a96840',
          0,
          0.61,
          0.3,
          car,
        );
        boiler.rotation.x = Math.PI / 2;
        box(0.94, 0.86, 0.62, '#b6774c', 0, 0.63, -0.47, car);
        box(0.75, 0.42, 0.03, '#d6cc9d', 0, 0.83, -0.8, car);
        box(1.05, 0.1, 0.8, '#546248', 0, 1.13, -0.47, car);
        mesh(
          new THREE.CylinderGeometry(0.14, 0.11, 0.55, 10),
          '#54543d',
          0,
          1.1,
          0.56,
          car,
        );
        mesh(
          new THREE.CylinderGeometry(0.2, 0.2, 0.07, 10),
          '#54543d',
          0,
          1.4,
          0.56,
          car,
        );
        sphere(0.14, '#ffe0a0', 0, 0.63, 0.75, car);
      } else {
        box(0.91, 0.5, 1.3, i === 1 ? '#b88d4e' : '#788357', 0, 0.45, 0, car);
        box(0.7, 0.08, 1.1, '#726246', 0, 0.75, 0, car);
        for (const z of [-0.43, 0.08, 0.48])
          box(0.76, 0.34, 0.08, '#d4b986', 0, 0.82, z, car);
      }
    }
    const passengers = characters.map((c) => {
      const model = createCharacter(c.id);
      model.position.set(0, 0.76, -0.12);
      model.scale.setScalar(0.95);
      cars[1].add(model);
      return { id: c.id, model };
    });
    // A real 3D handrail anchors the front-seat view.
    const cockpit = new THREE.Group();
    camera.add(cockpit);
    const safetyBar = mesh(
      new THREE.CylinderGeometry(0.027, 0.027, 0.95, 12),
      '#b79b62',
      0,
      -0.43,
      -0.67,
      cockpit,
    );
    safetyBar.rotation.z = Math.PI / 2;
    for (const x of [-0.45, 0.45])
      mesh(
        new THREE.CylinderGeometry(0.03, 0.03, 0.45, 10),
        '#887a50',
        x,
        -0.63,
        -0.67,
        cockpit,
      );
    const nose = box(1.2, 0.18, 0.7, '#69754d', 0, -0.71, -0.6, cockpit);
    nose.castShadow = false;
    const smoke = Array.from({ length: 6 }, () => {
      const puff = sphere(0.17, '#e6e1cb', 0, 0, 0);
      puff.material = new THREE.MeshStandardMaterial({
        color: '#e8e2cd',
        transparent: true,
        opacity: 0.4,
        roughness: 1,
      });
      puff.castShadow = false;
      return puff;
    });
    let progress = 0,
      speed = 0,
      lastReset = state.current.reset,
      lastTime = 0,
      time = 0,
      raf = 0,
      disposed = false,
      statsTime = 0,
      wasStarted = false;
    const collected = new Set<number>();
    const target = new THREE.Vector3(),
      home = new THREE.Vector3(30, 23, 35);
    camera.position.copy(home);
    camera.lookAt(0, 2, 0);
    const resize = () => {
      const w = el.clientWidth,
        h = el.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(el);
    resize();
    const lost = (e: Event) => {
      e.preventDefault();
      state.current.onError();
    };
    renderer.domElement.addEventListener('webglcontextlost', lost);
    function animate(now: number) {
      if (disposed) return;
      raf = requestAnimationFrame(animate);
      const dt = Math.min(Math.max((now - lastTime) / 1000, 0), 0.05);
      lastTime = now;
      const s = state.current;
      for (const passenger of passengers) {
        passenger.model.visible = passenger.id === s.character;
        passenger.model.rotation.z = s.reduced ? 0 : Math.sin(time * 2) * 0.025;
      }
      let power = 0,
        brake = 0;
      if (lastReset !== s.reset) {
        progress = 0;
        speed = 0;
        lastReset = s.reset;
        collected.clear();
        wasStarted = false;
      }
      if (s.started && !wasStarted) {
        speed = s.mode === 'scenic' ? 2.3 : 0;
        collected.add(0);
        s.onStation(0);
        wasStarted = true;
      }
      const { f: before } = trackFrame(progress);
      if (s.started && s.playing && !document.hidden) {
        const physics = advanceRide(speed, before.y, dt, s.mode, s.input);
        speed = physics.speed;
        power = physics.power;
        brake = physics.brake;
        const previous = progress;
        progress = (progress + (speed * dt) / trackLength) % 1;
        time += dt;
        for (const n of crossedStations(previous, progress)) {
          collected.add(n);
          s.onStation(n);
        }
      } else if (!s.started && !s.reduced) time += dt * 0.4;
      const { p, f, r } = trackFrame(progress);
      for (let i = 0; i < cars.length; i++) {
        const fr = trackFrame(progress - (i * 1.8) / trackLength);
        cars[i].position.copy(fr.p).add(new THREE.Vector3(0, 0.27, 0));
        cars[i].quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), fr.f);
        cars[i].visible = !(
          i === 0 &&
          s.started &&
          s.view === 'pov' &&
          !s.reduced
        );
      }
      tokens.forEach((t, i) => {
        t.visible = !collected.has(i);
        if (!s.reduced) t.rotation.y = time * 0.9;
      });
      for (let i = 0; i < smoke.length; i++) {
        const age = (time * 0.7 + i / 6) % 1;
        smoke[i].visible =
          s.playing &&
          s.started &&
          speed > 0.2 &&
          !s.reduced &&
          s.view !== 'pov';
        smoke[i].position
          .copy(trackFrame(progress - age * 0.009).p)
          .add(new THREE.Vector3(-age * 0.8, 1.8 + age * 2, 0));
        smoke[i].scale.setScalar(0.8 + age * 2);
        (smoke[i].material as THREE.MeshStandardMaterial).opacity =
          (1 - age) * 0.4;
      }
      if (!s.reduced && s.playing) blades.rotation.z += dt * 0.22;
      cockpit.visible = s.started && s.view === 'pov' && !s.reduced;
      if (!s.started) {
        const a = s.reduced ? 0.55 : 0.55 + Math.sin(time * 0.13) * 0.14;
        camera.position.set(Math.sin(a) * 45, 17, Math.cos(a) * 45);
        target.set(-3, 2, 0);
        camera.fov = 48;
      } else if (s.reduced || s.view === 'world') {
        camera.position.copy(home);
        target.set(-2, 1, 0);
        camera.fov = 53;
      } else if (s.view === 'pov') {
        camera.position.copy(p).add(new THREE.Vector3(0, 1.08, 0));
        target
          .copy(trackFrame(progress + 2.8 / trackLength).p)
          .add(new THREE.Vector3(0, 1.0, 0));
        camera.fov = 67;
      } else {
        const passengerPosition = trackFrame(progress - 1.8 / trackLength).p;
        const desired = passengerPosition
          .clone()
          .addScaledVector(f, -3.7)
          .addScaledVector(r, 2.2)
          .add(new THREE.Vector3(0, 2.2, 0));
        camera.position.lerp(desired, 1 - Math.exp(-dt * 5));
        target
          .copy(passengerPosition)
          .addScaledVector(f, 1)
          .add(new THREE.Vector3(0, 1.15, 0));
        camera.fov = 56;
      }
      camera.lookAt(target);
      if (s.started && s.view !== 'world' && !s.reduced) {
        const bend = trackFrame(progress + 0.005)
          .f.clone()
          .sub(f)
          .dot(r);
        camera.rotateZ(
          -bend * speed * 0.18 +
            ((s.input.left ? 1 : 0) - (s.input.right ? 1 : 0)) * 0.08,
        );
      }
      camera.updateProjectionMatrix();
      renderer.render(scene, camera);
      statsTime += dt;
      if (statsTime > 0.1) {
        statsTime = 0;
        s.onStats({
          speed: speed * 3.6,
          power: power * 100,
          brake: brake * 100,
          progress,
          slope: before.y,
        });
      }
    }
    raf = requestAnimationFrame(animate);
    state.current.onReady();
    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      observer.disconnect();
      renderer.domElement.removeEventListener('webglcontextlost', lost);
      const geos = new Set<THREE.BufferGeometry>(),
        mats = new Set<THREE.Material>();
      scene.traverse((o) => {
        if (o instanceof THREE.Mesh) {
          geos.add(o.geometry);
          (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) =>
            mats.add(m),
          );
        }
        if (o instanceof THREE.Sprite) {
          o.material.map?.dispose();
          mats.add(o.material);
        }
      });
      geos.forEach((g) => g.dispose());
      mats.forEach((m) => m.dispose());
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);
  return <div ref={host} className="world-canvas" />;
}
