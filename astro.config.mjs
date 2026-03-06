// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  site: "https://davidgarciai554.github.io",
  base: "/CalculadoraFinanciera",
  trailingSlash: "always",
  vite: {
    plugins: [tailwindcss()],
  },
});
