'use client';

import React, { useState, useMemo } from 'react';
import { Note, NoteColor } from '@/types/note';
import NoteCard from './NoteCard';
import NoteModal from './NoteModal';

interface NotesContainerProps {
  initialNotes: Note[];
}

export default function NotesContainer({ initialNotes }: NotesContainerProps) {
  // 模态框状态管理
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  // 筛选与搜索状态
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<NoteColor | 'all'>('all');

  // 提取所有标签并去重
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    initialNotes.forEach((n) => {
      n.tags?.forEach((t) => tagSet.add(t));
    });
    return Array.from(tagSet);
  }, [initialNotes]);

  // 过滤后的便签列表
  const filteredNotes = useMemo(() => {
    return initialNotes.filter((note) => {
      // 1. 搜索过滤（匹配标题或正文）
      const matchesSearch =
        !searchQuery.trim() ||
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase());

      // 2. 标签过滤
      const matchesTag = !selectedTag || (note.tags && note.tags.includes(selectedTag));

      // 3. 颜色过滤
      const matchesColor = selectedColor === 'all' || note.color === selectedColor;

      return matchesSearch && matchesTag && matchesColor;
    });
  }, [initialNotes, searchQuery, selectedTag, selectedColor]);

  // 置顶便签统计
  const pinnedCount = initialNotes.filter((n) => n.isPinned).length;

  const handleOpenCreate = () => {
    setEditingNote(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (note: Note) => {
    setEditingNote(note);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingNote(null);
  };

  return (
    <div className="space-y-6">
      {/* 顶部控制栏：搜索、筛选器、新建按钮 */}
      <div className="bg-white/80 backdrop-blur-md rounded-2xl p-4 sm:p-6 border border-neutral-200/80 shadow-xs">
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          {/* 搜索框 */}
          <div className="relative flex-1 max-w-md">
            <svg
              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="搜索便签标题或内容..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50/50 text-sm focus:bg-white focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-100 transition"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* 右侧动作区：新建便签按钮 */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleOpenCreate}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-medium text-sm px-5 py-2.5 shadow-sm hover:shadow transition transform active:scale-95"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              新建便签
            </button>
          </div>
        </div>

        {/* 筛选标签条：颜色与自定义标签 */}
        <div className="mt-4 pt-4 border-t border-neutral-100 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-neutral-500 font-medium mr-1">分类筛选:</span>

          <button
            type="button"
            onClick={() => setSelectedTag(null)}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              selectedTag === null
                ? 'bg-neutral-900 text-white'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            全部便签 ({initialNotes.length})
          </button>

          {allTags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                selectedTag === tag
                  ? 'bg-amber-500 text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>
      </div>

      {/* 状态统计信息 */}
      <div className="flex items-center justify-between text-xs text-neutral-500 px-1">
        <div>
          显示 {filteredNotes.length} 张便签
          {pinnedCount > 0 && <span className="ml-2 font-medium text-amber-700">📌 置顶 {pinnedCount} 张</span>}
        </div>
        {(searchQuery || selectedTag) && (
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedTag(null);
            }}
            className="text-amber-600 hover:underline"
          >
            清除筛选条件
          </button>
        )}
      </div>

      {/* 便签卡片瀑布流/网格 */}
      {filteredNotes.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredNotes.map((note) => (
            <NoteCard key={note.id} note={note} onEdit={handleOpenEdit} />
          ))}
        </div>
      ) : (
        /* 空状态提示 */
        <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border-2 border-dashed border-neutral-200 bg-white/50">
          <div className="text-4xl mb-3">📝</div>
          <h3 className="text-base font-semibold text-neutral-700">没有找到相关便签</h3>
          <p className="text-xs text-neutral-500 mt-1 max-w-sm">
            {searchQuery || selectedTag
              ? '尝试修改搜索关键词或清除标签筛选'
              : '目前还没有任何便签，点击上方“新建便签”记录你的灵感吧！'}
          </p>
          {!searchQuery && !selectedTag && (
            <button
              type="button"
              onClick={handleOpenCreate}
              className="mt-4 rounded-xl bg-amber-500 px-4 py-2 text-xs font-semibold text-white hover:bg-amber-600 transition"
            >
              + 记录第一条便签
            </button>
          )}
        </div>
      )}

      {/* 新建/编辑便签的模态对话框 */}
      <NoteModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        initialNote={editingNote}
      />
    </div>
  );
}
