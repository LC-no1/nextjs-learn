import { getAllNotes } from '@/lib/notes';
import NotesContainer from '@/components/NotesContainer';

/**
 * Next.js 规则说明：
 * 1. 本文件未添加 'use client'，因此它是一个默认的【服务端组件（Server Component）】。
 * 2. 服务端组件支持 async/await：我们可以在渲染该组件时直接从磁盘读取 data/notes.json，
 *    这意味着在 HTML 传输到浏览器之前，便签数据就已经准备好并直接渲染成 HTML，
 *    完全没有传统 SPA 应用客户端加载时的“白屏闪烁”或 loading 动画。
 * 3. export const dynamic = 'force-dynamic' 强制动态渲染，保证每次刷新页面都能获取 JSON 最新的实时数据。
 */
export const dynamic = 'force-dynamic';

export default async function HomePage() {
  // 直接在服务端调用底层文件读取方法
  const notes = await getAllNotes();

  return (
    <div className="space-y-6">
      {/* 教学与提示面板 */}
      <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-yellow-500/10 border border-amber-200/60 rounded-2xl p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-neutral-800 flex items-center gap-2">
              <span>💡</span> Next.js 便签实战应用
            </h2>
            <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
              本页面由 Next.js <span className="font-semibold text-amber-700">Server Component</span> 服务端直出渲染，
              新增、编辑、置顶便签均通过 <span className="font-semibold text-amber-700">Server Actions</span> 完成，
              数据持久化保存在本地 <code className="bg-amber-100/80 px-1 py-0.5 rounded text-amber-900 font-mono">data/notes.json</code> 中。
            </p>
          </div>
        </div>
      </div>

      {/* 客户端交互组件：便签列表、筛选与弹窗 */}
      <NotesContainer initialNotes={notes} />
    </div>
  );
}
