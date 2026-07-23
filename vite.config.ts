import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    // Pin feature flags for tests so a developer's uncommitted `.env.local`
    // (e.g. VITE_WEBMCP=true while manually demoing the track) can't change the
    // default-off behavior the suite asserts. Tests that need the track enabled
    // override this explicitly with `vi.stubEnv('VITE_WEBMCP', 'true')`.
    env: {
      VITE_WEBMCP: 'false',
    },
  },
})
