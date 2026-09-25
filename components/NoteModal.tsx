'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { Note, NoteColor, CreateNoteInput } from '@/types/note';
import { createNoteAction, updateNoteAction } from '@/app/actions/note-actions';
import { COLOR_CONFIG } from './NoteCard';

interface NoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialNote?: Note | null; // 如果传入，则为编辑模式；否则为新建模式
}

const COLOR_OPTIONS: { key: NoteColor; label: string; preview: string }[] = [
  { key: 'yellow', label: '活力黄', preview: 'bg-amber-200 border-amber-400' },
  { key: 'green', label: '清新绿', preview: 'bg-emerald-200 border-emerald-400' },
  { key: 'blue', label: '天空蓝', preview: 'bg-sky-200 border-sky-400' },
  { key: 'pink', label: '柔粉色', preview: 'bg-rose-200 border-rose-400' },
  { key: 'purple', label: '薰衣草', preview: 'bg-purple-200 border-purple-400' },
  { key: 'orange', label: '暖橙色', preview: 'bg-orange-200 border-orange-400' },
];

export default function NoteModal({ isOpen, onClose, initialNote }: NoteModalProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [color, setColor] = useState<NoteColor>('yellow');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isPending, startTransition] = useTransition();

  // 根据当前是新增还是编辑，回填表单初始值
  useEffect(() => {
    if (initialNote) {
      setTitle(initialNote.title);
      setContent(initialNote.content);
      setColor(initialNote.color);
      setTags(initialNote.tags || []);
      setIsPinned(initialNote.isPinned);
    } else {
      setTitle('');
      setContent('');
      setColor('yellow');
      setTags([]);
      setIsPinned(false);
    }
    setTagInput('');
    setErrorMessage('');
  }, [initialNote, isOpen]);

  if (!isOpen) return null;

  // 添加标签
  const handleAddTag = () => {
    const trimmed = tagInput.trim().replace(/^#/, '');
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput('');
    }
  };

  // 移除标签
  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  // 提交表单
  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!title.trim() && !content.trim()) {
      setErrorMessage('标题或内容至少填写一项');
      return;
    }

    setErrorMessage('');

    startTransition(async () => {
      const payload: CreateNoteInput = {
        title,
        content,
        color,
        tags,
        isPinned,
      };

      let result;
      if (initialNote) {
        result = await updateNoteAction(initialNote.id, payload);
      } else {
        result = await createNoteAction(payload);
      }

      if (result.success) {
        onClose();
      } else {
        setErrorMessage(result.error || '保存便签失败');
      }
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl transition-all border border-neutral-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 顶部标题栏 */}
        <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-4">
          <h2 className="text-lg font-bold text-neutral-800">
            {initialNote ? '✏️ 编辑便签' : '📝 新建便签'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 transition"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 错误提示 */}
        {errorMessage && (
          <div className="bg-red-50 border-l-4 border-red-500 p-3 mx-6 mt-4 text-xs text-red-700 rounded-r">
            {errorMessage}
          </div>
        )}

        {/* 表单内容 */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* 标题 */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1">
              便签标题
            </label>
            <input
              type="text"
              placeholder="输入便签标题..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-neutral-300 px-3.5 py-2.5 text-neutral-800 placeholder-neutral-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200 text-sm font-medium transition"
              autoFocus
            />
          </div>

          {/* 正文内容 */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1">
              便签正文
            </label>
            <textarea
              rows={5}
              placeholder="写点什么吧...（支持快捷键 Ctrl + Enter 提交）"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                  handleSubmit();
                }
              }}
              className="w-full resize-none rounded-xl border border-neutral-300 p-3.5 text-neutral-800 placeholder-neutral-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200 text-sm leading-relaxed transition"
            />
          </div>

          {/* 颜色主题选择 */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-2">
              便利贴颜色
            </label>
            <div className="flex items-center gap-3">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => setColor(c.key)}
                  title={c.label}
                  className={`w-7 h-7 rounded-full border-2 transition-transform ${c.preview} ${
                    color === c.key ? 'scale-125 ring-2 ring-offset-2 ring-neutral-400 shadow-sm' : 'opacity-80 hover:scale-110'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* 标签 */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1.5">
              标签分类
            </label>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-700"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-red-500 ml-0.5"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="添加标签（回车添加）"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                className="flex-1 rounded-xl border border-neutral-300 px-3 py-1.5 text-xs text-neutral-700 placeholder-neutral-400 focus:border-amber-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="rounded-xl bg-neutral-100 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-200 transition"
              >
                添加
              </button>
            </div>
          </div>

          {/* 置顶勾选 */}
          <div className="pt-1">
            <label className="inline-flex items-center gap-2 cursor-pointer select-none text-sm text-neutral-700">
              <input
                type="checkbox"
                checked={isPinned}
                onChange={(e) => setIsPinned(e.target.checked)}
                className="rounded border-neutral-300 text-amber-500 focus:ring-amber-400 w-4 h-4 cursor-pointer"
              />
              <span className="font-medium">📌 将此便签置顶</span>
            </label>
          </div>

          {/* 底部按钮区 */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="rounded-xl px-4 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-100 transition"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 transition disabled:opacity-60"
            >
              {isPending && (
                <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
              )}
              {initialNote ? '保存更改' : '立即创建'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
