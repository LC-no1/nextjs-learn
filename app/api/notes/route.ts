import { NextResponse } from 'next/server';
import { getAllNotes, createNote } from '@/lib/notes';
import { CreateNoteInput } from '@/types/note';

/**
 * Next.js Route Handler（API 路由规范）：
 *
 * 知识点：
 * 1. 在 App Router 中，API 端点通过在文件夹内定义 route.ts 实现。
 * 2. 导出标准的 HTTP 方法名函数：GET, POST, PUT, PATCH, DELETE。
 * 3. 对比：
 *    - 页面自身的数据交互推荐使用 Server Actions（免去写路由与序列化请求）；
 *    - 当你需要对外提供公开的 REST API 接口（如供手机 App 或其他服务调用）时，Route Handlers 是标准方案。
 */

// GET /api/notes - 获取所有便签列表
export async function GET() {
  try {
    const notes = await getAllNotes();
    return NextResponse.json({ success: true, data: notes });
  } catch {
    return NextResponse.json(
      { success: false, error: '获取便签失败' },
      { status: 500 }
    );
  }
}

// POST /api/notes - 供外部通过 REST API 新增便签
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CreateNoteInput;
    if (!body.title && !body.content) {
      return NextResponse.json(
        { success: false, error: '标题与内容不能同时为空' },
        { status: 400 }
      );
    }
    const newNote = await createNote(body);
    return NextResponse.json({ success: true, data: newNote }, { status: 201 });
  } catch {
    return NextResponse.json(
      { success: false, error: '创建便签失败' },
      { status: 500 }
    );
  }
}
