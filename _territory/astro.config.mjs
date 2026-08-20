import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://no.fail",
  output: "static",
  integrations: [sitemap()],
});
