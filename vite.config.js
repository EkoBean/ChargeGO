import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({

  plugins: [react()],
  css: {
    devSourcemap: true,  // 保持開發映射
    modules: {
      localsConvention: 'camelCase' // 確保類別名稱轉換為 amelCase
    }
  },
    build: {
    cssCodeSplit: true,  // 生產模式下分割CSS
  },
})

