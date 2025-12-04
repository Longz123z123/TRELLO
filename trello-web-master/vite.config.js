import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import svgr from 'vite-plugin-svgr'
export default defineConfig({
  base: '/',
  // Cho phep su dung duoc process.env
  define: {
    'process.env': process.env
  },
  //
  plugins: [react(), svgr()],

  resolve: {
    alias: [{ find: '~', replacement: '/src' }]
  }
})
