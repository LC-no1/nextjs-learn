import { prisma } from './prisma';
import { Note, CreateNoteInput, UpdateNoteInput, NoteColor } from '@/types/note';
import fs from 'fs/promises';
import path from 'path';

/**
 * 格式化数据库返回的 Prisma Note 对象为统一前端 Note 规范
 */
function formatNote(raw: {
  id: string;
  title: string;
  content: string;
  color: string;
  tags: string;
  isPinned: boolean;
  createdAt: Date;
  updatedAt: Date;
}): Note {
  let parsedTags: string[] = [];
  try {
    parsedTags = JSON.parse(raw.tags);
    if (!Array.isArray(parsedTags)) parsedTags = [];
  } catch {
    parsedTags = [];
  }

  return {
    id: raw.id,
    title: raw.title,
    content: raw.content,
    color: (raw.color as NoteColor) || 'yellow',
    tags: parsedTags,
    isPinned: Boolean(raw.isPinned),
    createdAt: raw.createdAt.toISOString(),
    updatedAt: raw.updatedAt.toISOString(),
  };
}

/**
 * 自动迁移旧 JSON 数据（平滑升级）：
 * 如果 MySQL 数据库是空的，自动读取原 data/notes.json 并导入 MySQL
 */
async function autoMigrateFromJsonIfEmpty(): Promise<void> {
  try {
    const count = await prisma.note.count();
    if (count > 0) return;

    const jsonPath = path.join(process.cwd(), 'data', 'notes.json');
    const raw = await fs.readFile(jsonPath, 'utf-8');
    const oldNotes = JSON.parse(raw) as Note[];

    if (Array.isArray(oldNotes) && oldNotes.length > 0) {
      for (const item of oldNotes) {
        await prisma.note.create({
          data: {
            id: item.id,
            title: item.title,
            content: item.content,
            color: item.color || 'yellow',
            tags: JSON.stringify(item.tags || []),
            isPinned: Boolean(item.isPinned),
            createdAt: item.createdAt ? new Date(item.createdAt) : new Date(),
            updatedAt: item.updatedAt ? new Date(item.updatedAt) : new Date(),
          },
        });
      }
      console.log('✅ 已成功将 data/notes.json 历史数据平滑导入至本地 MySQL 数据库！');
    }
  } catch {
    // 忽略平滑迁移的轻微读取错误
  }
}

/**
 * 获取所有便签：
 * 业务排序规则：置顶 (isPinned) 优先展示，其次按照 updatedAt 倒序
 */
export async function getAllNotes(): Promise<Note[]> {
  await autoMigrateFromJsonIfEmpty();

  const notes = await prisma.note.findMany({
    orderBy: [
      { isPinned: 'desc' },
      { updatedAt: 'desc' },
    ],
  });

  return notes.map(formatNote);
}

/**
 * 根据 ID 获取单张便签
 */
export async function getNoteById(id: string): Promise<Note | null> {
  const note = await prisma.note.findUnique({
    where: { id },
  });
  return note ? formatNote(note) : null;
}

/**
 * 创建新便签
 */
export async function createNote(input: CreateNoteInput): Promise<Note> {
  const created = await prisma.note.create({
    data: {
      title: input.title.trim(),
      content: input.content.trim(),
      color: input.color || 'yellow',
      tags: JSON.stringify(input.tags || []),
      isPinned: Boolean(input.isPinned),
    },
  });

  return formatNote(created);
}

/**
 * 更新指定便签
 */
export async function updateNote(id: string, input: UpdateNoteInput): Promise<Note | null> {
  try {
    const updateData: Record<string, unknown> = {};

    if (input.title !== undefined) updateData.title = input.title.trim();
    if (input.content !== undefined) updateData.content = input.content.trim();
    if (input.color !== undefined) updateData.color = input.color;
    if (input.tags !== undefined) updateData.tags = JSON.stringify(input.tags);
    if (input.isPinned !== undefined) updateData.isPinned = input.isPinned;

    const updated = await prisma.note.update({
      where: { id },
      data: updateData,
    });

    return formatNote(updated);
  } catch (error) {
    console.error('Error updating note in MySQL:', error);
    return null;
  }
}

/**
 * 删除指定便签
 */
export async function deleteNote(id: string): Promise<boolean> {
  try {
    await prisma.note.delete({
      where: { id },
    });
    return true;
  } catch (error) {
    console.error('Error deleting note from MySQL:', error);
    return false;
  }
}

/**
 * 切换便签置顶状态
 */
export async function togglePinNote(id: string): Promise<Note | null> {
  const current = await prisma.note.findUnique({
    where: { id },
    select: { isPinned: true },
  });

  if (!current) return null;

  const updated = await prisma.note.update({
    where: { id },
    data: { isPinned: !current.isPinned },
  });

  return formatNote(updated);
}
