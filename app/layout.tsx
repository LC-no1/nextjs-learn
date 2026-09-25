import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Next.js 极简便签本',
  description: '基于 Next.js App Router 与本地 MySQL (Prisma) 的便签 Web 应用',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-neutral-100/60 text-neutral-900 font-sans">
        {/* 全局顶部导航栏 */}
        <header className="sticky top-0 z-40 w-full border-b border-neutral-200/80 bg-white/80 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl select-none">📌</span>
              <div>
                <h1 className="text-lg font-bold text-neutral-900 leading-tight">
                  StickyNotes <span className="text-xs font-medium text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full ml-1">Next.js App</span>
                </h1>
                <p className="text-[11px] text-neutral-500">本地 MySQL · Prisma ORM · Server Actions 驱动</p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-neutral-500">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>数据实时同步保存</span>
            </div>
          </div>
        </header>

        {/* 页面主内容区域 */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>

        {/* 底部 Footer */}
        <footer className="border-t border-neutral-200 bg-white/50 py-6 text-center text-xs text-neutral-400">
          Next.js App Router 实战教学案例 · 无需外部数据库 · JSON 文件持久化
        </footer>
      </body>
    </html>
  );
}
