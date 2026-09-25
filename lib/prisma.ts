import { PrismaClient } from '@prisma/client';

/**
 * Next.js 开发规范要点：PrismaClient 单例模式（Singleton Pattern）
 *
 * 【为什么不能直接 const prisma = new PrismaClient()？】
 * 在 Next.js 开发环境 (process.env.NODE_ENV !== 'production') 下，
 * 代码每次热更新（Fast Refresh）都会重新加载模块。如果每次都新建实例，
 * 会不断打开新的 MySQL 连接，很快就会报：
 * "Error: Can't reach database server / Too many connections"。
 *
 * 【解决方案】：
 * 将 Prisma 客户端挂载到 globalThis 全局对象上，
 * 热重载时复用现有连接，生产环境下则正常实例化。
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
