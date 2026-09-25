import fs from 'fs/promises';
import path from 'path';
import { Note, CreateNoteInput, UpdateNoteInput } from '@/types/note';

// 确定 JSON 文件的绝对路径（位于项目根目录下的 data/notes.json）
const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'notes.json');

/**
 * 确保存储目录和 JSON 文件存在，如果不存在则自动创建
 */
async function ensureDataFileExists(): Promise<void> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    try {
      await fs.access(DATA_FILE);
    } catch {
      // 文件不存在，写入空数组
      await fs.writeFile(DATA_FILE, '[]', 'utf-8');
    }
  } catch (error) {
    console.error('Failed to ensure data file exists:', error);
    throw error;
  }
}

/**
 * 读取所有便签原始数据
 */
async function readNotesFromFile(): Promise<Note[]> {
  await ensureDataFileExists();
  try {
    const rawData = await fs.readFile(DATA_FILE, 'utf-8');
    return JSON.parse(rawData) as Note[];
  } catch (error) {
    console.error('Error reading notes.json:', error);
    return [];
  }
}

/**
 * 将便签数组写入 JSON 文件
 */
async function writeNotesToFile(notes: Note[]): Promise<void> {
  await ensureDataFileExists();
  await fs.writeFile(DATA_FILE, JSON.stringify(notes, null, 2), 'utf-8');
}

/**
 * 获取所有便签：
 * 业务排序规则：置顶 (isPinned) 的便签优先展示，其次按照创建或更新时间倒序
 */
export async function getAllNotes(): Promise<Note[]> {
  const notes = await readNotesFromFile();
  return notes.sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });
}

/**
 * 根据 ID 获取单张便签
 */
export async function getNoteById(id: string): Promise<Note | null> {
  const notes = await readNotesFromFile();
  return notes.find((note) => note.id === id) || null;
}

/**
 * 创建新便签
 */
export async function createNote(input: CreateNoteInput): Promise<Note> {
  const notes = await readNotesFromFile();
  const now = new Date().toISOString();

  const newNote: Note = {
    id: `note-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    title: input.title.trim(),
    content: input.content.trim(),
    color: input.color || 'yellow',
    tags: input.tags || [],
    isPinned: Boolean(input.isPinned),
    createdAt: now,
    updatedAt: now,
  };

  notes.unshift(newNote);
  await writeNotesToFile(notes);
  return newNote;
}

/**
 * 更新指定便签
 */
export async function updateNote(id: string, input: UpdateNoteInput): Promise<Note | null> {
  const notes = await readNotesFromFile();
  const index = notes.findIndex((note) => note.id === id);

  if (index === -1) {
    return null;
  }

  const existing = notes[index];
  const updatedNote: Note = {
    ...existing,
    ...input,
    title: input.title !== undefined ? input.title.trim() : existing.title,
    content: input.content !== undefined ? input.content.trim() : existing.content,
    updatedAt: new Date().toISOString(),
  };

  notes[index] = updatedNote;
  await writeNotesToFile(notes);
  return updatedNote;
}

/**
 * 删除指定便签
 */
export async function deleteNote(id: string): Promise<boolean> {
  const notes = await readNotesFromFile();
  const initialLength = notes.length;
  const filtered = notes.filter((note) => note.id !== id);

  if (filtered.length === initialLength) {
    return false;
  }

  await writeNotesToFile(filtered);
  return true;
}

/**
 * 切换便签置顶状态
 */
export async function togglePinNote(id: string): Promise<Note | null> {
  const notes = await readNotesFromFile();
  const target = notes.find((n) => n.id === id);
  if (!target) return null;

  return updateNote(id, { isPinned: !target.isPinned });
}
