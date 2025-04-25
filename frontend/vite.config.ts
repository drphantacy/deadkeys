import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        index: 'index.html',
        linera: '@linera/client',
      },
      preserveEntrySignatures: 'strict',
    },
  },
  optimizeDeps: {
    exclude: ['@linera/client'],
  },
  server: {
    port: 3000,
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },
    proxy: {
      '/rpc.v1': {
        target: 'https://linera-testnet.chainbase.online',
        changeOrigin: true,
        secure: true,
      },
      '/faucet.v1': {
        target: 'https://faucet.testnet-babbage.linera.net',
        changeOrigin: true,
        secure: true,
      },
    },
  },
});
