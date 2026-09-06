import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";
import { defineConfig, loadEnv } from "vite";
import tailwindcss from "@tailwindcss/vite";

const UPSTREAM_HOST = "sky-scrapper.p.rapidapi.com";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Empty prefix so RAPIDAPI_KEY is readable here without a VITE_ prefix,
  // which would inline it into the client bundle.
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [
      react(),
      babel({ presets: [reactCompilerPreset()] }),
      tailwindcss(),
    ],
    server: {
      // Mirrors worker/index.js so dev and production hit the same paths.
      proxy: {
        "/api/sky": {
          target: `https://${UPSTREAM_HOST}`,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/sky/, ""),
          headers: {
            "X-RapidAPI-Key": env.RAPIDAPI_KEY ?? "",
            "X-RapidAPI-Host": UPSTREAM_HOST,
          },
        },
      },
    },
  };
});
