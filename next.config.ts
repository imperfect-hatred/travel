// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Уберите reactCompiler или используйте правильную конфигурацию
  // reactCompiler: true, // Удалите эту строку
  
  // Другие настройки...
  images: {
    domains: ['travel-guide.com'],
  },
};

export default nextConfig;