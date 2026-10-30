import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// The app calls the backend with relative URLs (/api/..., /uploads/...);
// `npm run dev` proxies them to the Laravel API (VITE_API_TARGET, default http://127.0.0.1:8000).
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const target = env.VITE_API_TARGET || 'http://127.0.0.1:8000';
  const proxy = {
    '/api': { target, changeOrigin: true },
    '/uploads': { target, changeOrigin: true },
    '/storage': { target, changeOrigin: true },
  };
  return {
    plugins: [react()],
    server: { port: 5173, proxy },
    preview: { port: 4173, proxy },
  };
});
