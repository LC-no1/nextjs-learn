'use server';

import { revalidatePath } from 'next/cache';
import { CreateNoteInput, UpdateNoteInput } from '@/types/note';
import {
  createNote,
  updateNote,
  deleteNote,
  togglePinNote,
} from '@/lib/notes';

/**
 * Server Action 规范说明：
 * 1. 顶部使用 'use server' 指令，标识该文件内所有导出的异步函数都是【服务端操作】。
 * 2. 它们可以直接在 Client Component 中像调用普通 JS 函数一样被触发。
 * 3. 使用 revalidatePath('/') 可以通知 Next.js：根路径下的数据已发生变更，
 *    Next.js 将自动重新渲染服务端的 Server Components 并把最新数据推给客户端。
 */

export async function createNoteAction(input: CreateNoteInput) {
  try {
    if (!input.title && !input.content) {
      return { success: false, error: '便签标题或内容至少需要填写一项' };
    }

    const newNote = await createNote(input);
    // 触发缓存失效，使页面数据自动刷新
    revalidatePath('/');
    return { success: true, data: newNote };
  } catch (error) {
    console.error('createNoteAction failed:', error);
    return { success: false, error: '创建便签失败，请重试' };
  }
}

export async function updateNoteAction(id: string, input: UpdateNoteInput) {
  try {
    const updated = await updateNote(id, input);
    if (!updated) {
      return { success: false, error: '便签未找到' };
    }
    revalidatePath('/');
    return { success: true, data: updated };
  } catch (error) {
    console.error('updateNoteAction failed:', error);
    return { success: false, error: '更新便签失败，请重试' };
  }
}

export async function deleteNoteAction(id: string) {
  try {
    const success = await deleteNote(id);
    if (!success) {
      return { success: false, error: '便签不存在或已被删除' };
    }
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('deleteNoteAction failed:', error);
    return { success: false, error: '删除便签失败' };
  }
}

export async function togglePinAction(id: string) {
  try {
    const updated = await togglePinNote(id);
    if (!updated) {
      return { success: false, error: '便签未找到' };
    }
    revalidatePath('/');
    return { success: true, data: updated };
  } catch (error) {
    console.error('togglePinAction failed:', error);
    return { success: false, error: '切换置顶状态失败' };
  }
}
