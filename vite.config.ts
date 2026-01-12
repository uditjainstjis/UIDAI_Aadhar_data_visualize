
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      external: ['@google/genai'],
      output: {
        globals: {
          '@google/genai': 'GoogleGenAI'
        }
      }
    }
  }
});
