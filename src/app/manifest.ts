import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "CoverPhoto — Premium AI Portraits",
    short_name: "CoverPhoto",
    description:
      "Upload reference images and receive professionally composed AI portraits. 12 portrait types, 8 specialties.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#080808",
    theme_color: "#080808",
    categories: ["photography", "lifestyle", "multimedia"],
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/apple-touch-icon-120.png",
        sizes: "120x120",
        type: "image/png",
      },
      {
        src: "/apple-touch-icon-152.png",
        sizes: "152x152",
        type: "image/png",
      },
      {
        src: "/apple-touch-icon-167.png",
        sizes: "167x167",
        type: "image/png",
      },
      {
        src: "/apple-touch-icon-180.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
    screenshots: [
      {
        src: "/og-image.png",
        sizes: "1200x630",
        type: "image/png",
        form_factor: "wide",
        label: "CoverPhoto AI Portrait Studio",
      },
    ],
  };
}
