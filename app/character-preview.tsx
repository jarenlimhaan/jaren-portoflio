'use client';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import {
  createCharacter,
  disposeCharacter,
  type CharacterId,
} from './characters';
export default function CharacterPreview({
  character,
}: {
  character: CharacterId;
}) {
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = host.current;
    if (!el) return;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    } catch {
      return;
    }
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setSize(130, 130);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    el.appendChild(renderer.domElement);
    const scene = new THREE.Scene(),
      camera = new THREE.PerspectiveCamera(32, 1, 0.1, 10);
    camera.position.set(1.15, 1.05, 2.6);
    camera.lookAt(0, 0.57, 0);
    scene.add(new THREE.HemisphereLight('#fff1d8', '#8b9a7b', 3));
    const light = new THREE.DirectionalLight('#ffdfac', 3);
    light.position.set(-2, 3, 4);
    scene.add(light);
    const model = createCharacter(character);
    scene.add(model);
    renderer.render(scene, camera);
    return () => {
      disposeCharacter(model);
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [character]);
  return <div className="character-preview" ref={host} aria-hidden="true" />;
}
