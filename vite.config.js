import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ command }) => {
  if (command !== "build") {
    return {
      plugins: [react()]
    };
  }

  return {
    plugins: [react()],
    server: {
      proxy: {
        "/api": {
          target: "https://eventmanagementapi-bkcucwf3b4e7djf7.canadacentral-01.azurewebsites.net",
          changeOrigin: true,
          secure: true
        }
      }
    }
  };
});