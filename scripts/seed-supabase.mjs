import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(url, key);

async function seed() {
  const raw = fs.readFileSync('data/notes.json', 'utf8');
  const items = JSON.parse(raw);

  const { data: existing } = await supabase.from('notes').select('id');
  const existingIds = new Set(existing?.map((e) => e.id) || []);

  const toInsert = items
    .filter((item) => !existingIds.has(item.id))
    .map((item) => ({
      id: item.id,
      title: item.title,
      content: item.content,
      color: item.color || 'yellow',
      tags: item.tags || [],
      isPinned: Boolean(item.isPinned),
      createdAt: item.createdAt || new Date().toISOString(),
      updatedAt: item.updatedAt || new Date().toISOString(),
    }));

  if (toInsert.length > 0) {
    const { error } = await supabase.from('notes').insert(toInsert);
    if (error) {
      console.error('Seed error:', error.message);
    } else {
      console.log(`✅ 成功向云端 Supabase 插入 ${toInsert.length} 条初始便签！`);
    }
  } else {
    console.log('💡 云端已存在数据，无需重复导入。');
  }
}

seed();
