import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { copyFileSync } from "fs";

// plugin minimale: copia manifest e icone nel dist dopo il build
const copyPWA = () => ({
  name: "copy-pwa-assets",
  closeBundle() {
    for (const f of ["manifest.webmanifest","icon-192.png","icon-512.png","apple-touch-icon.png"]) {
      try { copyFileSync(f, `dist/${f}`); } catch(e) {}
    }
  },
});

export default defineConfig({
  plugins: [react(), copyPWA()],
});
