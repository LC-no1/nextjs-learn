import { supabase } from './supabase';
import { Note, CreateNoteInput, UpdateNoteInput, NoteColor } from '@/types/note';
import fs from 'fs/promises';
import path from 'path';

/**
 * 将 Supabase 数据库行记录安全映射为前端 Note 类型
 */
interface SupabaseNoteRow {
  id: string;
  title: string;
  content: string;
  color: string;
  tags: string[] | string | null;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

function formatNote(row: SupabaseNoteRow): Note {
  let parsedTags: string[] = [];
  if (Array.isArray(row.tags)) {
    parsedTags = row.tags;
  } else if (typeof row.tags === 'string') {
    try {
      parsedTags = JSON.parse(row.tags);
    } catch {
      parsedTags = [];
    }
  }

  return {
    id: row.id,
    title: row.title || '',
    content: row.content || '',
    color: (row.color as NoteColor) || 'yellow',
    tags: Array.isArray(parsedTags) ? parsedTags : [],
    isPinned: Boolean(row.isPinned),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

/**
 * 自动迁移旧 JSON 数据至云端 Supabase（平滑升级）：
 * 当云端数据库为空时，自动将本地 data/notes.json 中的历史便签同步至云端
 */
async function autoMigrateFromJsonIfEmpty(): Promise<void> {
  try {
    const { count, error } = await supabase
      .from('notes')
      .select('*', { count: 'exact', head: true });

    if (error || (count !== null && count > 0)) {
      return;
    }

    const jsonPath = path.join(process.cwd(), 'data', 'notes.json');
    const raw = await fs.readFile(jsonPath, 'utf-8');
    const oldNotes = JSON.parse(raw) as Note[];

    if (Array.isArray(oldNotes) && oldNotes.length > 0) {
      const rowsToInsert = oldNotes.map((n) => ({
        id: n.id,
        title: n.title,
        content: n.content,
        color: n.color || 'yellow',
        tags: n.tags || [],
        isPinned: Boolean(n.isPinned),
        createdAt: n.createdAt || new Date().toISOString(),
        updatedAt: n.updatedAt || new Date().toISOString(),
      }));

      await supabase.from('notes').insert(rowsToInsert);
      console.log('✅ 已成功将历史便签数据平滑迁移至云端 Supabase！');
    }
  } catch {
    // 忽略迁移失败（如无文件或权限受限）
  }
}

/**
 * 获取所有便签：
 * 业务排序规则：置顶 (isPinned) 的便签优先展示，其次按照 updatedAt 倒序
 */
export async function getAllNotes(): Promise<Note[]> {
  await autoMigrateFromJsonIfEmpty();

  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .order('isPinned', { ascending: false })
    .order('updatedAt', { ascending: false });

  if (error) {
    console.error('Supabase getAllNotes error:', error);
    return [];
  }

  return (data as SupabaseNoteRow[]).map(formatNote);
}

/**
 * 根据 ID 获取单张便签
 */
export async function getNoteById(id: string): Promise<Note | null> {
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) return null;
  return formatNote(data as SupabaseNoteRow);
}

/**
 * 创建新便签
 */
export async function createNote(input: CreateNoteInput): Promise<Note> {
  const now = new Date().toISOString();
  const row = {
    title: input.title.trim(),
    content: input.content.trim(),
    color: input.color || 'yellow',
    tags: input.tags || [],
    isPinned: Boolean(input.isPinned),
    createdAt: now,
    updatedAt: now,
  };

  const { data, error } = await supabase
    .from('notes')
    .insert([row])
    .select()
    .single();

  if (error) {
    console.error('Supabase createNote error:', error);
    throw new Error(error.message);
  }

  return formatNote(data as SupabaseNoteRow);
}

/**
 * 更新指定便签
 */
export async function updateNote(id: string, input: UpdateNoteInput): Promise<Note | null> {
  const updateData: Record<string, unknown> = {
    updatedAt: new Date().toISOString(),
  };

  if (input.title !== undefined) updateData.title = input.title.trim();
  if (input.content !== undefined) updateData.content = input.content.trim();
  if (input.color !== undefined) updateData.color = input.color;
  if (input.tags !== undefined) updateData.tags = input.tags;
  if (input.isPinned !== undefined) updateData.isPinned = input.isPinned;

  const { data, error } = await supabase
    .from('notes')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error || !data) {
    console.error('Supabase updateNote error:', error);
    return null;
  }

  return formatNote(data as SupabaseNoteRow);
}

/**
 * 删除指定便签
 */
export async function deleteNote(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('notes')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Supabase deleteNote error:', error);
    return false;
  }

  return true;
}

/**
 * 切换便签置顶状态
 */
export async function togglePinNote(id: string): Promise<Note | null> {
  const current = await getNoteById(id);
  if (!current) return null;

  return updateNote(id, { isPinned: !current.isPinned });
}
