import type { MetadataRoute } from "next"

/** Installs the site as an app: hours, tools and the timer one tap from the home screen. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Palestra Azzurra",
    short_name: "Azzurra",
    description: "Palestra Azzurra, Follonica: orari, corsi e strumenti per allenarti.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#0f1419",
    theme_color: "#0f1419",
    lang: "it",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  }
}
