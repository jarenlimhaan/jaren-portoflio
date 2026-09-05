'use client';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';

type Props = {
  playing: boolean;
  riding: boolean;
  reduced: boolean;
  jump: { index: number; key: number };
  onStop: (index: number) => void;
  onReady: () => void;
  onError: () => void;
};
const stationNames = [
  'WELCOME',
  'CLOUD & RELIABILITY',
  'APPLIED AI',
  'BACKEND SYSTEMS',
  'COMMUNITY IMPACT',
  'SAY HELLO',
];
export default function Railway(props: Props) {
  const host = useRef<HTMLDivElement>(null);
  const state = useRef(props);
  state.current = props;
  useEffect(() => {
    const el = host.current;
    if (!el) return;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      });
    } catch {
      state.current.onError();
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.7));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    el.appendChild(renderer.domElement);
    renderer.domElement.setAttribute(
      'aria-label',
      'A miniature woodland rollercoaster connecting six portfolio stations',
    );
    renderer.domElement.setAttribute('role', 'img');
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 180);
    const home = new THREE.Vector3(25, 23, 32),
      target = new THREE.Vector3(0, 1, 0);
    camera.position.copy(home);
    camera.lookAt(target);
    scene.add(new THREE.HemisphereLight('#fff5dc', '#859673', 2.4));
    const sun = new THREE.DirectionalLight('#ffdfab', 3.1);
    sun.position.set(-15, 28, 15);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.left = -25;
    sun.shadow.camera.right = 25;
    sun.shadow.camera.top = 25;
    sun.shadow.camera.bottom = -25;
    sun.shadow.normalBias = 0.045;
    sun.shadow.bias = -0.0001;
    sun.shadow.radius = 4;
    scene.add(sun);
    const fill = new THREE.DirectionalLight('#dce9f0', 0.8);
    fill.position.set(16, 8, -10);
    scene.add(fill);
    const mats = new Map<string, THREE.MeshStandardMaterial>();
    const material = (color: string) => {
      if (!mats.has(color))
        mats.set(
          color,
          new THREE.MeshStandardMaterial({ color, roughness: 0.88 }),
        );
      return mats.get(color)!;
    };
    function mesh(
      geo: THREE.BufferGeometry,
      color: string,
      x = 0,
      y = 0,
      z = 0,
      parent: THREE.Object3D = scene,
    ) {
      const m = new THREE.Mesh(geo, material(color));
      m.position.set(x, y, z);
      m.castShadow = true;
      m.receiveShadow = true;
      parent.add(m);
      return m;
    }
    function box(
      w: number,
      h: number,
      d: number,
      c: string,
      x: number,
      y: number,
      z: number,
      p: THREE.Object3D = scene,
    ) {
      return mesh(new THREE.BoxGeometry(w, h, d), c, x, y, z, p);
    }
    function orb(
      r: number,
      c: string,
      x: number,
      y: number,
      z: number,
      p: THREE.Object3D = scene,
    ) {
      return mesh(new THREE.IcosahedronGeometry(r, 2), c, x, y, z, p);
    }
    function beam(
      a: THREE.Vector3,
      b: THREE.Vector3,
      r: number,
      c: string,
      p: THREE.Object3D = scene,
    ) {
      const m = mesh(
        new THREE.CylinderGeometry(r, r, a.distanceTo(b), 7),
        c,
        0,
        0,
        0,
        p,
      );
      m.position.copy(a).add(b).multiplyScalar(0.5);
      m.quaternion.setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        b.clone().sub(a).normalize(),
      );
      return m;
    }
    let seed = 49;
    const rand = () => {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return seed / 4294967296;
    };
    const island = mesh(
      new THREE.CylinderGeometry(1, 1, 0.9, 96),
      '#9ba776',
      0,
      -0.48,
      0,
    );
    island.scale.set(14.6, 1, 10.3);
    const soil = mesh(
      new THREE.CylinderGeometry(1, 0.97, 0.6, 96),
      '#b4a783',
      0,
      -1.17,
      0,
    );
    soil.scale.set(14.55, 1, 10.25);
    const islandRim = mesh(
      new THREE.CylinderGeometry(1, 1, 0.1, 96),
      '#cad09c',
      0,
      0.005,
      0,
    );
    islandRim.scale.set(14.56, 1, 10.26);
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(160, 160),
      new THREE.ShadowMaterial({ opacity: 0.11 }),
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -1.52;
    floor.receiveShadow = true;
    scene.add(floor);
    const terrain = (x: number, z: number) =>
      0.08 +
      1.6 * Math.exp(-((x - 1) ** 2 / 16 + (z + 2) ** 2 / 9)) +
      1.45 * Math.exp(-((x + 5) ** 2 / 12 + (z + 5) ** 2 / 9));
    const surface = new THREE.PlaneGeometry(28.8, 20, 84, 64);
    surface.rotateX(-Math.PI / 2);
    const pos = surface.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      let x = pos.getX(i),
        z = pos.getZ(i);
      const ellipse = (x * x) / (14.4 * 14.4) + (z * z) / 100;
      if (ellipse > 1) {
        const q = Math.sqrt(ellipse);
        x /= q;
        z /= q;
        pos.setX(i, x);
        pos.setZ(i, z);
      }
      pos.setY(i, terrain(x, z));
    }
    surface.computeVertexNormals();
    mesh(surface, '#aebc88');
    const lake = mesh(
      new THREE.CylinderGeometry(1, 1, 0.045, 64),
      '#8cbdb6',
      1,
      0.23,
      4.2,
    );
    lake.scale.set(3.4, 1, 1.95);
    lake.material = new THREE.MeshStandardMaterial({
      color: '#8ebfb7',
      roughness: 0.26,
      metalness: 0.12,
    });
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2;
      const rock = orb(
        0.28 + rand() * 0.16,
        '#c1c0a3',
        1 + Math.cos(a) * 3.45,
        0.24,
        4.2 + Math.sin(a) * 2,
      );
      rock.scale.y = 0.5;
    }
    const curve = new THREE.CatmullRomCurve3(
      [
        new THREE.Vector3(-10, 1.0, 4),
        new THREE.Vector3(-5, 1.2, 7.6),
        new THREE.Vector3(2, 1.6, 8),
        new THREE.Vector3(9, 3.2, 5.5),
        new THREE.Vector3(11.3, 4.8, -1.7),
        new THREE.Vector3(6.2, 5.5, -7.0),
        new THREE.Vector3(-0.5, 3.8, -7.5),
        new THREE.Vector3(-6.4, 2.3, -5.8),
        new THREE.Vector3(-11.4, 1.1, -1.8),
      ],
      true,
      'catmullrom',
      0.38,
    );
    const up = new THREE.Vector3(0, 1, 0);
    function frame(t: number) {
      const u = ((t % 1) + 1) % 1,
        p = curve.getPointAt(u),
        f = curve.getTangentAt(u).normalize(),
        r = new THREE.Vector3().crossVectors(up, f).normalize();
      return { p, f, r };
    }
    const length = curve.getLength();
    for (const side of [-1, 1]) {
      const railPoints = [];
      for (let i = 0; i <= 450; i++) {
        const { p, r } = frame(i / 450);
        railPoints.push(p.addScaledVector(r, side * 0.38));
      }
      mesh(
        new THREE.TubeGeometry(
          new THREE.CatmullRomCurve3(railPoints),
          550,
          0.065,
          7,
          false,
        ),
        '#665348',
      );
      const edgePoints = railPoints.map((p) =>
        p.clone().add(new THREE.Vector3(0, 0.05, 0)),
      );
      mesh(
        new THREE.TubeGeometry(
          new THREE.CatmullRomCurve3(edgePoints),
          550,
          0.021,
          5,
          false,
        ),
        '#c7baa0',
      );
    }
    for (let i = 0; i < 245; i++) {
      const { p, f } = frame(i / 245);
      const sleeper = box(1.21, 0.12, 0.19, '#a78861', p.x, p.y - 0.12, p.z);
      sleeper.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), f);
    }
    for (let i = 0; i < 48; i++) {
      const { p, r } = frame(i / 48),
        ground = terrain(p.x, p.z),
        h = p.y - ground;
      if (h < 0.5) continue;
      for (const side of [-1, 1]) {
        const b = p.clone().addScaledVector(r, side * 0.52),
          a = b.clone();
        a.y = ground;
        beam(a, b, 0.09, '#9a815e');
      }
      if (h > 1.2) {
        const a = p.clone().addScaledVector(r, -0.52),
          b = p.clone().addScaledVector(r, 0.52);
        a.y = ground + 0.2;
        beam(a, b, 0.055, '#a18865');
        const c = p.clone().addScaledVector(r, 0.52),
          d = p.clone().addScaledVector(r, -0.52);
        c.y = ground + 0.2;
        beam(c, d, 0.055, '#a18865');
      }
      box(
        1.35,
        0.15,
        0.22,
        '#9a815e',
        p.x,
        p.y - 0.23,
        p.z,
      ).quaternion.setFromUnitVectors(
        new THREE.Vector3(0, 0, 1),
        frame(i / 48).f,
      );
    }
    const trackPoints = Array.from({ length: 240 }, (_, i) =>
      curve.getPointAt(i / 240),
    );
    const distTrack = (x: number, z: number) =>
      Math.min(...trackPoints.map((p) => Math.hypot(p.x - x, p.z - z)));
    const treeColors = ['#647d4e', '#7b915b', '#859e63', '#9aaa6c', '#526e4a'];
    function tree(x: number, z: number, s: number, pine: boolean) {
      const y = terrain(x, z);
      mesh(
        new THREE.CylinderGeometry(0.09 * s, 0.14 * s, 1.2 * s, 6),
        '#927653',
        x,
        y + 0.6 * s,
        z,
      );
      if (pine) {
        for (let k = 0; k < 3; k++)
          mesh(
            new THREE.ConeGeometry((0.7 - k * 0.14) * s, 1.15 * s, 8),
            treeColors[Math.floor(rand() * treeColors.length)],
            x,
            y + (1 + k * 0.48) * s,
            z,
          );
      } else {
        const crown = orb(
          0.84 * s,
          treeColors[Math.floor(rand() * treeColors.length)],
          x,
          y + 1.5 * s,
          z,
        );
        crown.scale.set(1, 1.15, 1);
        orb(
          0.6 * s,
          treeColors[Math.floor(rand() * treeColors.length)],
          x + 0.42 * s,
          y + 1.33 * s,
          z + 0.1 * s,
        );
      }
    }
    const buildingSites = [
      [-8, 2.3],
      [7.9, -3.8],
      [-3.5, -4],
      [7.4, 2.1],
      [5.5, 1.5],
      [1, -4],
    ];
    for (let i = 0; i < 120; i++) {
      const x = (rand() - 0.5) * 27,
        z = (rand() - 0.5) * 18;
      if (
        (x * x) / 180 + (z * z) / 78 > 1 ||
        distTrack(x, z) < 1.3 ||
        (x - 1) ** 2 / 18 + (z - 4.2) ** 2 / 7 < 1 ||
        buildingSites.some(([bx, bz]) => Math.hypot(x - bx, z - bz) < 2.2)
      )
        continue;
      tree(x, z, 0.65 + rand() * 0.8, rand() > 0.35);
    }
    for (let i = 0; i < 90; i++) {
      const x = (rand() - 0.5) * 27,
        z = (rand() - 0.5) * 19;
      if (
        (x * x) / 190 + (z * z) / 90 > 1 ||
        distTrack(x, z) < 0.7 ||
        (x - 1) ** 2 / 18 + (z - 4.2) ** 2 / 7 < 1
      )
        continue;
      const bush = orb(
        0.12 + rand() * 0.25,
        ['#c9c999', '#9aab71', '#b6bd81'][i % 3],
        x,
        terrain(x, z) + 0.1,
        z,
      );
      bush.scale.y = 0.65;
    }

    function cottage(
      x: number,
      z: number,
      s: number,
      rotation: number,
      color: string,
    ) {
      const g = new THREE.Group();
      g.position.set(x, terrain(x, z), z);
      g.rotation.y = rotation;
      g.scale.setScalar(s);
      scene.add(g);
      box(1.6, 1.45, 1.6, '#e9d9b8', 0, 0.73, 0, g);
      box(1.8, 0.15, 1.8, '#b4a07a', 0, 0.08, 0, g);
      // A triangular gable roof, extruded along the station building.
      const shape = new THREE.Shape();
      shape.moveTo(-1, 0);
      shape.lineTo(0, 0.75);
      shape.lineTo(1, 0);
      shape.closePath();
      const roofMesh = mesh(
        new THREE.ExtrudeGeometry(shape, { depth: 1.95, bevelEnabled: false }),
        color,
        0,
        1.4,
        -0.975,
        g,
      );
      roofMesh.castShadow = true;
      box(0.37, 0.82, 0.04, '#667658', 0, 0.5, 0.82, g);
      for (const dx of [-0.5, 0.5]) {
        box(0.33, 0.4, 0.04, '#fbdf9c', dx, 0.94, 0.825, g);
        box(0.39, 0.035, 0.07, '#a7916e', dx, 0.94, 0.86, g);
        box(0.035, 0.43, 0.07, '#a7916e', dx, 0.94, 0.86, g);
      }
      box(0.3, 0.85, 0.3, '#a88d6c', 0.53, 1.96, -0.38, g);
      return g;
    }
    cottage(-8, 2.3, 1.25, -0.35, '#b97351');
    cottage(7.9, -3.8, 1.0, 0.55, '#a97852');
    cottage(-3.5, -4, 1.05, 0.4, '#b8865f');
    cottage(7.4, 2.1, 0.82, -0.45, '#ba7c5b');
    cottage(5.5, 1.5, 0.58, 0.1, '#a48d61');
    // A small windmill overlooks the engineering workshop.
    const mill = new THREE.Group();
    mill.position.set(1, -0.1, -4);
    scene.add(mill);
    mesh(
      new THREE.CylinderGeometry(0.5, 0.8, 2.9, 8),
      '#ece0bf',
      0,
      2,
      0,
      mill,
    );
    mesh(new THREE.ConeGeometry(0.78, 1, 8), '#b67b56', 0, 3.9, 0, mill);
    const blades = new THREE.Group();
    blades.position.set(0, 3, 0.66);
    mill.add(blades);
    for (let i = 0; i < 4; i++) {
      const arm = new THREE.Group();
      arm.rotation.z = (i * Math.PI) / 2;
      blades.add(arm);
      box(0.065, 1.85, 0.08, '#8f7857', 0, 0.8, 0, arm);
      box(0.32, 1, 0.045, '#e9deba', 0.16, 1.1, 0, arm);
      for (let j = 0; j < 5; j++)
        box(0.4, 0.025, 0.06, '#a99370', 0.16, 0.7 + j * 0.18, 0.03, arm);
    }
    orb(0.15, '#8b7150', 0, 3, 0.78, mill);
    // Tiny platform details reinforce the railway scale.
    for (let i = 0; i < 10; i++) {
      box(0.07, 0.7, 0.07, '#c7b38a', -9.8 + i * 0.32, 0.55, 5.5);
    }
    box(3.1, 0.06, 0.07, '#c7b38a', -8.35, 0.65, 5.5);
    box(3.1, 0.06, 0.07, '#c7b38a', -8.35, 0.4, 5.5);
    for (const x of [-7.7, -5.9]) {
      box(0.9, 0.1, 0.35, '#a68a60', x, 0.48, 3.8);
      for (const dx of [-0.3, 0.3])
        box(0.07, 0.4, 0.07, '#7f7759', x + dx, 0.25, 3.8);
      box(0.9, 0.3, 0.07, '#a68a60', x, 0.7, 3.62);
    }
    // Readable in-world station signs are functional labels, rendered as textures.
    for (let i = 0; i < 6; i++) {
      const { p, r } = frame(i / 6);
      const s = p.clone().addScaledVector(r, 1.5);
      const y = Math.max(terrain(s.x, s.z), p.y - 0.4);
      box(0.1, 1.25, 0.1, '#a58d64', s.x, y + 0.62, s.z);
      const canvas = document.createElement('canvas');
      canvas.width = 640;
      canvas.height = 120;
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = '#f9f5e7';
      ctx.beginPath();
      ctx.roundRect(2, 2, 636, 116, 22);
      ctx.fill();
      ctx.strokeStyle = '#d0ccb0';
      ctx.lineWidth = 4;
      ctx.stroke();
      ctx.fillStyle = '#5c744d';
      ctx.beginPath();
      ctx.arc(51, 60, 32, 0, Math.PI * 2);
      ctx.fill();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = 'bold 25px Arial';
      ctx.fillStyle = '#fff9e6';
      ctx.fillText(String(i + 1).padStart(2, '0'), 51, 61);
      ctx.textAlign = 'left';
      ctx.fillStyle = '#475b3d';
      ctx.font = 'bold 23px Arial';
      ctx.fillText(stationNames[i], 105, 61);
      const tex = new THREE.CanvasTexture(canvas);
      tex.colorSpace = THREE.SRGBColorSpace;
      const sprite = new THREE.Sprite(
        new THREE.SpriteMaterial({ map: tex, depthTest: true }),
      );
      sprite.position.set(s.x, y + 1.4, s.z);
      sprite.scale.set(4.35, 0.82, 1);
      scene.add(sprite);
    }
    const cars: THREE.Group[] = [];
    for (let c = 0; c < 3; c++) {
      const g = new THREE.Group();
      scene.add(g);
      cars.push(g);
      box(0.87, 0.16, 1.38, '#4e5545', 0, 0.16, 0, g);
      for (const x of [-0.46, 0.46])
        for (const z of [-0.43, 0.43]) {
          const w = mesh(
            new THREE.CylinderGeometry(0.19, 0.19, 0.12, 12),
            '#4c4b3c',
            x,
            0.08,
            z,
            g,
          );
          w.rotation.z = Math.PI / 2;
          const hub = mesh(
            new THREE.CylinderGeometry(0.08, 0.08, 0.13, 10),
            '#b49a66',
            x,
            0.08,
            z,
            g,
          );
          hub.rotation.z = Math.PI / 2;
        }
      if (c === 0) {
        const boiler = mesh(
          new THREE.CylinderGeometry(0.32, 0.32, 0.83, 16),
          '#b66d46',
          0,
          0.53,
          0.22,
          g,
        );
        boiler.rotation.x = Math.PI / 2;
        box(0.82, 0.74, 0.55, '#bc784f', 0, 0.57, -0.43, g);
        box(0.61, 0.4, 0.02, '#e5d4a5', 0, 0.7, -0.72, g);
        box(0.91, 0.1, 0.7, '#53654b', 0, 0.98, -0.43, g);
        mesh(
          new THREE.CylinderGeometry(0.12, 0.09, 0.45, 10),
          '#4f5644',
          0,
          0.98,
          0.48,
          g,
        );
        mesh(
          new THREE.CylinderGeometry(0.17, 0.17, 0.08, 10),
          '#4f5644',
          0,
          1.23,
          0.48,
          g,
        );
        orb(0.11, '#ffe0a0', 0, 0.56, 0.68, g);
      } else {
        box(0.78, 0.42, 1.13, c === 1 ? '#d1a361' : '#7c9265', 0, 0.4, 0, g);
        box(0.64, 0.1, 0.83, '#695e46', 0, 0.63, 0, g);
        for (const z of [-0.37, 0.05, 0.4])
          box(0.64, 0.26, 0.07, '#e0c599', 0, 0.74, z, g);
      }
    }
    const puffs = Array.from({ length: 5 }, () => {
      const m = orb(0.15, '#f4f1e2', 0, 0, 0);
      m.castShadow = false;
      m.material = new THREE.MeshStandardMaterial({
        color: '#f4f1e2',
        transparent: true,
        opacity: 0.65,
        roughness: 1,
      });
      return m;
    });
    let progress = 0,
      lastKey = state.current.jump.key,
      lastStation = 0,
      time = 0,
      lastTime = 0,
      raf = 0,
      disposed = false;
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
    const contextLost = (event: Event) => {
      event.preventDefault();
      state.current.onError();
    };
    renderer.domElement.addEventListener('webglcontextlost', contextLost);
    function animate(now: number) {
      if (disposed) return;
      raf = requestAnimationFrame(animate);
      const dt = Math.min((now - lastTime) / 1000, 0.045);
      lastTime = now;
      const s = state.current;
      if (s.jump.key !== lastKey) {
        progress = s.jump.index / 6;
        lastKey = s.jump.key;
        lastStation = s.jump.index;
      }
      if (s.playing && !document.hidden) {
        progress = (progress + dt * 0.011) % 1;
        time += dt;
      }
      const station = Math.floor(((progress + 0.015) % 1) * 6);
      if (station !== lastStation) {
        lastStation = station;
        s.onStop(station);
      }
      for (let i = 0; i < cars.length; i++) {
        const { p, f } = frame(progress - (i * 1.55) / length);
        cars[i].position.copy(p).add(new THREE.Vector3(0, 0.22, 0));
        cars[i].quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), f);
      }
      const { p, f } = frame(progress);
      for (let i = 0; i < puffs.length; i++) {
        const age = (time * 0.55 + i / 5) % 1;
        puffs[i].visible = s.playing && !s.reduced;
        const p0 = frame(progress - age * 0.012).p;
        puffs[i].position
          .copy(p0)
          .add(new THREE.Vector3(-age * 0.7, 1.55 + age * 1.8, 0));
        puffs[i].scale.setScalar(0.8 + age * 2);
        (puffs[i].material as THREE.MeshStandardMaterial).opacity =
          (1 - age) * 0.55;
      }
      if (s.playing && !s.reduced) blades.rotation.z += dt * 0.2;
      if (s.riding && !s.reduced) {
        const desired = p
          .clone()
          .addScaledVector(f, -5)
          .add(new THREE.Vector3(0, 3.1, 0));
        camera.position.lerp(desired, 1 - Math.exp(-dt * 2.5));
        target.lerp(
          p
            .clone()
            .addScaledVector(f, 3)
            .add(new THREE.Vector3(0, 0.8, 0)),
          1 - Math.exp(-dt * 3),
        );
      } else {
        if (s.reduced) {
          camera.position.copy(home);
          target.set(0, 1, 0);
        } else {
          camera.position.lerp(home, 1 - Math.exp(-dt * 2.5));
          target.lerp(new THREE.Vector3(0, 1, 0), 1 - Math.exp(-dt * 2.5));
        }
      }
      camera.lookAt(target);
      renderer.render(scene, camera);
    }
    raf = requestAnimationFrame(animate);
    state.current.onReady();
    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      observer.disconnect();
      renderer.domElement.removeEventListener('webglcontextlost', contextLost);
      scene.traverse((o) => {
        if (o instanceof THREE.Mesh) o.geometry.dispose();
        if (o instanceof THREE.Sprite) {
          o.material.map?.dispose();
          o.material.dispose();
        }
      });
      const unique = new Set<THREE.Material>();
      scene.traverse((o) => {
        if (o instanceof THREE.Mesh) {
          const list = Array.isArray(o.material) ? o.material : [o.material];
          list.forEach((m) => unique.add(m));
        }
      });
      unique.forEach((m) => m.dispose());
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);
  return <div ref={host} style={{ width: '100%', height: '100%' }} />;
}
