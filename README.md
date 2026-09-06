# Jaren's Little Rails

A cozy, interactive rollercoaster portfolio built with React, Three.js, and Vinext. Explore six stations covering backend engineering, platform reliability, applied AI, and community projects.

## Run locally

Requires Node.js 22.13 or newer and npm.

```sh
npm ci
npm run dev
```

Open the local address printed by the development server.

## Play

Choose a capybara, duck, quokka, white dog, or black cat. Select manual driving or the automatic scenic route.

- W / Up: accelerate
- S / Down / Space: brake
- A / D: lean
- C: change camera
- P / Escape: pause
- E: read the current station
- M: open the journey book

Touch controls are available on screen. About me opens a scrollable background and projects panel. Reduced motion is available in Controls.

## Checks

```sh
npm test
npx tsc --noEmit
npx oxlint app
npm run build
```

## Content

- `app/stops.ts`: resume and station stories
- `app/about-reader.tsx`: biography and selected public GitHub projects
- `app/characters.ts`: shared 3D rider models
- `public/Jaren_resume.pdf`: downloadable resume

The build targets Cloudflare Workers through Sites. GitHub stores the source; pushing this directory does not deploy the game.
