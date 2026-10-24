# Packer example

A full-screen Vitemple demo that loads its images and sound from one `example.vpack`.

```sh
cd packer
npm install
npm run dev
```

Open the local URL printed by Vite. Click or tap anywhere to show the glass with
the `overlay` blend mode and play the Winamp startup sound. Enter and Space also
work when the screen button is focused. The glass disappears when the sound ends.
Clicking again during playback restarts the sound and keeps the glass visible.

## Commands

```sh
npm run build   # generate the static site in dist/
npm start       # build and serve the production output
npm run check   # check TypeScript after npm run build or npm run dev
```

## Assets and implementation

`src/assets/example.vpack` contains the original `winamp-startup.mp3`,
`glass-crack-effect.jpg`, and `background.jpg` files. Both images cover the viewport;
their edges can be cropped to preserve their aspect ratios.

`src/scripts.ts` uses `fetchFilePack` from `vitemple/file-pack` and validates the full
container. Before enabling the screen button, it waits for both images to decode
and for the native audio element to report that playback can proceed. The glass
image stays in the DOM at `opacity: 0.001` so the browser can prepare it for display;
clicking changes its opacity and starts playback.

No media is extracted to disk. A relative preload link in `src/index.html` lets
Vitemple copy the pack into `dist/assets/` and works when hosted in a subdirectory.

The example imports `fetchFilePack` directly from `vitemple/file-pack`. Vitemple
bundles this package import into the generated browser module, so no vendor copy step
or browser-side package resolver is needed. No backend or external media service is needed.

The dependency is pinned to GitHub commit
`4081a0eea9179acde57781ff76afc17165b446a9`, the latest Vitemple commit when this
example was created. Installing from GitHub requires Git and runs Vitemple's
package preparation build.
