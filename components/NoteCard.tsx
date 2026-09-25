'use client';

import React, { useTransition } from 'react';
import { Note, NoteColor } from '@/types/note';
import { deleteNoteAction, togglePinAction } from '@/app/actions/note-actions';

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
}

// 便利贴主题色样式映射
export const COLOR_CONFIG: Record<
  NoteColor,
  { bg: string; border: string; badge: string; pinActive: string; text: string }
> = {
  yellow: {
    bg: 'bg-amber-100/90 hover:bg-amber-100',
    border: 'border-amber-300/80',
    badge: 'bg-amber-200/80 text-amber-900',
    pinActive: 'text-amber-600',
    text: 'text-amber-950',
  },
  green: {
    bg: 'bg-emerald-100/90 hover:bg-emerald-100',
    border: 'border-emerald-300/80',
    badge: 'bg-emerald-200/80 text-emerald-900',
    pinActive: 'text-emerald-600',
    text: 'text-emerald-950',
  },
  blue: {
    bg: 'bg-sky-100/90 hover:bg-sky-100',
    border: 'border-sky-300/80',
    badge: 'bg-sky-200/80 text-sky-900',
    pinActive: 'text-sky-600',
    text: 'text-sky-950',
  },
  pink: {
    bg: 'bg-rose-100/90 hover:bg-rose-100',
    border: 'border-rose-300/80',
    badge: 'bg-rose-200/80 text-rose-900',
    pinActive: 'text-rose-600',
    text: 'text-rose-950',
  },
  purple: {
    bg: 'bg-purple-100/90 hover:bg-purple-100',
    border: 'border-purple-300/80',
    badge: 'bg-purple-200/80 text-purple-900',
    pinActive: 'text-purple-600',
    text: 'text-purple-950',
  },
  orange: {
    bg: 'bg-orange-100/90 hover:bg-orange-100',
    border: 'border-orange-300/80',
    badge: 'bg-orange-200/80 text-orange-900',
    pinActive: 'text-orange-600',
    text: 'text-orange-950',
  },
};

export default function NoteCard({ note, onEdit }: NoteCardProps) {
  // useTransition 是 React 18/19 结合 Next.js Server Actions 的绝佳搭档
  // 它能标记异步操作的状态，提供 isPending 用于展示轻量加载反馈，且不会阻塞主线程 UI
  const [isPending, startTransition] = useTransition();

  const colorStyle = COLOR_CONFIG[note.color] || COLOR_CONFIG.yellow;

  // 格式化日期显示
  const formatDate = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString('zh-CN', {
        month: 'numeric',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '';
    }
  };

  const handleTogglePin = (e: React.MouseEvent) => {
    e.stopPropagation();
    startTransition(async () => {
      await togglePinAction(note.id);
    });
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`确定要删除便签 “${note.title || '无标题'}” 吗？`)) {
      startTransition(async () => {
        await deleteNoteAction(note.id);
      });
    }
  };

  return (
    <div
      onClick={() => onEdit(note)}
      className={`group relative flex flex-col justify-between rounded-2xl border p-5 shadow-sm transition-all duration-200 cursor-pointer select-none hover:-translate-y-1 hover:shadow-md ${colorStyle.bg} ${colorStyle.border} ${isPending ? 'opacity-60 scale-[0.99]' : ''}`}
    >
      {/* 顶部操作条：置顶标记与操作按钮 */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <h3
          className={`font-semibold text-lg leading-snug line-clamp-2 ${colorStyle.text}`}
        >
          {note.title || '无标题便签'}
        </h3>

        <div className="flex items-center space-x-1 shrink-0">
          {/* 置顶 Pin 按钮 */}
          <button
            type="button"
            title={note.isPinned ? '取消置顶' : '置顶便签'}
            onClick={handleTogglePin}
            disabled={isPending}
            className={`p-1.5 rounded-lg transition-colors duration-150 hover:bg-black/10 ${
              note.isPinned ? colorStyle.pinActive : 'text-neutral-400 hover:text-neutral-700'
            }`}
          >
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill={note.isPinned ? 'currentColor' : 'none'}
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="17" x2="12" y2="22" />
              <path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z" />
            </svg>
          </button>

          {/* 编辑按钮 */}
          <button
            type="button"
            title="编辑便签"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(note);
            }}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-800 hover:bg-black/10 transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125"
              />
            </svg>
          </button>

          {/* 删除按钮 */}
          <button
            type="button"
            title="删除便签"
            onClick={handleDelete}
            disabled={isPending}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-red-600 hover:bg-black/10 transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* 便签正文 */}
      <div className="flex-1 mb-4">
        <p className={`whitespace-pre-wrap text-sm leading-relaxed ${colorStyle.text} opacity-90 line-clamp-6`}>
          {note.content || <span className="italic opacity-50">无详细内容</span>}
        </p>
      </div>

      {/* 底部信息：标签和时间 */}
      <div className="pt-2 border-t border-black/5 flex flex-col gap-2">
        {note.tags && note.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {note.tags.map((tag) => (
              <span
                key={tag}
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${colorStyle.badge}`}
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between text-[11px] text-neutral-500">
          <span>{formatDate(note.updatedAt)}</span>
          {note.isPinned && (
            <span className="flex items-center gap-1 font-medium text-amber-700">
              📌 已置顶
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
