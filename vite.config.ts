import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig(({ mode }) => ({
  // Select complete native implementations without copying over learner edits.
  resolve: {
    alias:
      mode === 'workshop-solutions'
        ? [
            {
              find: /^\.\.\/exercises\/(summarizer|translator|prompt)$/,
              replacement: `${fileURLToPath(
                new URL('./src/workshop/solutions', import.meta.url),
              )}/$1.ts`,
            },
          ]
        : [],
  },
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
}))
