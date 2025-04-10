import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true, // 允许全局使用 describe, it, expect 等
    environment: 'node', // 指定测试环境为 Node.js
    // 可以添加 setup 文件来在测试前运行代码 (例如连接数据库)
    // setupFiles: './src/tests/setup.ts',
    // 可以指定包含测试文件的 glob 模式
    include: ['src/**/*.test.ts'],
  },
}); 
