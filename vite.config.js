import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // Quando collegherai il backend Python (FASE B), decommenta:
  // server: { proxy: { "/api": "http://localhost:8000" } }
});
