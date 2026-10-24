/**
 * Loads the three media assets from example.vpack with Vitemple's browser reader.
 * The full pack is validated before its object URLs are created, and the button is
 * enabled after both images decode and the audio is ready to play. Clicking starts
 * native audio and immediately shows the always-present glass image on click;
 * the glass fades back to near-transparent opacity when playback ends. This module owns
 * those URLs and releases them when leaving the page. Vitemple compiles the page;
 * native DOM, CSS blending, image decoding and HTML audio handle playback.
 */
import { fetchFilePack } from "vitemple/file-pack";

// ----------------------------------------------------------------- Page elements and resource ownership
const screen = document.querySelector<HTMLButtonElement>("#screen")!;
const background = document.querySelector<HTMLImageElement>("#background")!;
const glass = document.querySelector<HTMLImageElement>("#glass")!;
const playCue = document.querySelector<HTMLSpanElement>(".play-cue")!;
const sound = document.querySelector<HTMLAudioElement>("#sound")!;
const status = document.querySelector<HTMLParagraphElement>("#status")!;
const controller = new AbortController();
const objectUrls = new Map<string, string>();
let playbackId = 0;

// ----------------------------------------------------------------- Playback and error feedback

// Shows an actionable loading or playback error without enabling HTML injection.
function showError(message: string, error: unknown): void {
  status.textContent = message;
  status.hidden = false;
  console.error(message, error);
}

// Hides the play cue and requests audio playback within the user gesture.
async function playEffect(): Promise<void> {
  const currentPlayback = ++playbackId;
  glass.classList.add("is-visible");
  sound.pause();
  sound.currentTime = 0;
  playCue.classList.add("is-hidden");
  status.hidden = true;

  try {
    await sound.play();
  } catch (error) {
    if (currentPlayback !== playbackId) {
      return;
    }

    glass.classList.remove("is-visible");
    showPlayCue();
    showError("Audio could not play. Click or tap to try again.", error);
  }
}

// Hides the glass when the active sound reaches its natural end.
function finishEffect(): void {
  glass.classList.remove("is-visible");
  showPlayCue();
}

// Restores the play cue when the effect ends or playback cannot continue.
function showPlayCue(): void {
  playCue.classList.remove("is-hidden");
}

// Reports native audio failures, including errors that happen during playback.
function handleAudioError(): void {
  playbackId += 1;
  glass.classList.remove("is-visible");
  showPlayCue();
  showError("The audio could not be loaded or decoded.", sound.error);
}

// ----------------------------------------------------------------- Asset loading and page lifecycle

// Waits until the browser reports enough audio data to play the supplied Blob.
function waitForAudio(): Promise<void> {
  // Registers readiness handlers and returns after the browser can play through.
  return new Promise((resolve, reject) => {

    // Removes both readiness listeners after the audio succeeds or fails.
    function cleanupListeners(): void {
      sound.removeEventListener("canplaythrough", handleCanPlaythrough);
      sound.removeEventListener("error", handleLoadError);
    }

    // Resolves readiness after the browser reports the audio can play through.
    function handleCanPlaythrough(): void {
      cleanupListeners();
      resolve();
    }

    // Rejects when the browser cannot load or decode the audio Blob.
    function handleLoadError(): void {
      cleanupListeners();
      reject(sound.error ?? new Error("The audio could not be loaded."));
    }

    if (sound.readyState >= HTMLMediaElement.HAVE_ENOUGH_DATA) {
      resolve();
      return;
    }

    sound.addEventListener("canplaythrough", handleCanPlaythrough, { once: true });
    sound.addEventListener("error", handleLoadError, { once: true });
    sound.load();
  });
}

// Reads and validates the full pack, then prepares its images and audio for playback.
async function loadAssets(): Promise<void> {
  try {
    for await (const { name, blob } of fetchFilePack("./assets/example.vpack", {
      signal: controller.signal,
    })) {
      objectUrls.set(name, URL.createObjectURL(blob));
    }

    for (const name of ["background.jpg", "glass-crack-effect.jpg", "winamp-startup.mp3"]) {
      if (!objectUrls.has(name)) {
        throw new Error(`Missing file in example.vpack: ${name}`);
      }
    }

    background.src = objectUrls.get("background.jpg")!;
    glass.src = objectUrls.get("glass-crack-effect.jpg")!;
    sound.src = objectUrls.get("winamp-startup.mp3")!;
    await Promise.all([background.decode(), glass.decode(), waitForAudio()]);
    controller.signal.throwIfAborted();
    screen.disabled = false;
    status.hidden = true;
  } catch (error) {
    if (controller.signal.aborted) {
      return;
    }

    showError("Unable to load example.vpack. Check the file and reload the page.", error);
  }
}

// Aborts pending fetches and releases media elements and owned URLs on final exit.
function releaseAssets(event: PageTransitionEvent): void {

  if (event.persisted) {
    return;
  }

  controller.abort();
  playbackId += 1;
  sound.pause();
  sound.removeAttribute("src");
  sound.load();
  background.removeAttribute("src");
  glass.removeAttribute("src");

  for (const url of objectUrls.values()) {
    URL.revokeObjectURL(url);
  }

  objectUrls.clear();
}

// ----------------------------------------------------------------- Event registration and startup
screen.addEventListener("click", playEffect);
sound.addEventListener("ended", finishEffect);
sound.addEventListener("error", handleAudioError);
window.addEventListener("pagehide", releaseAssets);
void loadAssets();
