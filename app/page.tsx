import { getAllNotes } from '@/lib/notes';
import NotesContainer from '@/components/NotesContainer';

/**
 * Next.js 规则说明：
 * 1. 本文件未添加 'use client'，因此它是一个默认的【服务端组件（Server Component）】。
 * 2. 服务端组件支持 async/await：我们可以在服务端直接通过 Supabase SDK 查询云端 PostgreSQL，
 *    这意味着在 HTML 传输到浏览器之前，便签数据就已经在服务端准备好并直接渲染成 HTML，
 *    完全没有传统 SPA 应用客户端加载时的“白屏闪烁”或 loading 动画。
 * 3. export const dynamic = 'force-dynamic' 保证每次刷新页面都能从 Supabase 云端获取最新的实时数据。
 */
export const dynamic = 'force-dynamic';

export default async function HomePage() {
  // 直接在服务端调用底层数据库查询方法
  const notes = await getAllNotes();

  return (
    <div className="space-y-6">
      {/* 教学与提示面板 */}
      <div className="bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-amber-500/10 border border-emerald-200/60 rounded-2xl p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-neutral-800 flex items-center gap-2">
              <span>⚡</span> Next.js + 云端 Supabase 实战应用
            </h2>
            <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
              本页面由 Next.js <span className="font-semibold text-emerald-700">Server Component</span> 服务端直出渲染，
              增删改查均由 <span className="font-semibold text-emerald-700">Server Actions</span> 驱动，
              数据持久化存储在云端 <code className="bg-emerald-100/80 px-1 py-0.5 rounded text-emerald-900 font-mono">Supabase (PostgreSQL)</code> 数据库中。
            </p>
          </div>
        </div>
      </div>

      {/* 客户端交互组件：便签列表、筛选与弹窗 */}
      <NotesContainer initialNotes={notes} />
    </div>
  );
}
