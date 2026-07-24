import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    // Pin feature flags for tests so a developer's uncommitted `.env.local`
    // (e.g. VITE_WEBMCP=false while trimming the track for a shorter demo)
    // can't change the default-on behavior the suite asserts. Tests that need
    // the track hidden override this explicitly with
    // `vi.stubEnv('VITE_WEBMCP', 'false')`.
    env: {
      VITE_WEBMCP: 'true',
    },
  },
})
