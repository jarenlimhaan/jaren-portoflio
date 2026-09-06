import test from 'node:test';
import assert from 'node:assert/strict';
import {
  advanceRide,
  crossedStations,
  emptyInput,
} from '../app/ride-physics.ts';
import { trackLength, trackFrame } from '../app/track.ts';

test('manual power starts the train, and braking brings it to a complete stop', () => {
  let speed = 0;
  for (let i = 0; i < 180; i++)
    speed = advanceRide(speed, 0, 1 / 60, 'drive', {
      ...emptyInput,
      power: true,
    }).speed;
  assert.ok(speed > 5, 'Holding power must move the train');
  for (let i = 0; i < 180; i++)
    speed = advanceRide(speed, 0, 1 / 60, 'drive', {
      ...emptyInput,
      brake: true,
    }).speed;
  assert.equal(speed, 0);
});
test('the automatic ride can finish the actual track and discover every station', () => {
  let speed = 2.3,
    progress = 0,
    distance = 0,
    seen = new Set([0]);
  for (let i = 0; i < 60 * 240 && distance < trackLength; i++) {
    const { f } = trackFrame(progress);
    speed = advanceRide(speed, f.y, 1 / 60, 'scenic', emptyInput).speed;
    const next = (progress + speed / 60 / trackLength) % 1;
    crossedStations(progress, next).forEach((n) => seen.add(n));
    distance += speed / 60;
    progress = next;
    assert.ok(Number.isFinite(speed) && speed >= 0 && speed <= 7.6);
  }
  assert.ok(
    distance >= trackLength,
    'Scenic mode must not stall on an uphill section',
  );
  assert.deepEqual([...seen].sort(), [0, 1, 2, 3, 4, 5]);
});
test('lap rollover awards the first station once, and a paused train awards none', () => {
  assert.deepEqual(crossedStations(0.998, 0.002), [0]);
  assert.deepEqual(crossedStations(0.2, 0.2), []);
  assert.deepEqual(crossedStations(0.16, 0.17), [1]);
});
test('a delayed frame cannot catapult the train, and the track closes smoothly', () => {
  assert.deepEqual(
    advanceRide(2, 0, 100, 'drive', { ...emptyInput, power: true }),
    advanceRide(2, 0, 0.05, 'drive', { ...emptyInput, power: true }),
  );
  const a = trackFrame(0.99999),
    b = trackFrame(0.00001);
  assert.ok(a.p.distanceTo(b.p) < 0.02);
  assert.ok(a.f.dot(b.f) > 0.999);
  for (let i = 0; i < 1000; i++) {
    const { p, f, r } = trackFrame(i / 1000);
    assert.ok(p.y > 0.5, 'Track must stay above the ground');
    assert.ok(
      Math.abs(f.dot(r)) < 1e-8,
      'Rail offsets must stay perpendicular',
    );
  }
});
