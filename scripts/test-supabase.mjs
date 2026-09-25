import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(url, key);

async function fullTest() {
  console.log('🔄 1. 测试查询现有便签...');
  const { data: initialData, error: readErr } = await supabase.from('notes').select('*');
  if (readErr) {
    console.error('❌ 读取错误:', readErr.message);
    return;
  }
  console.log(`✅ 当前便签总数: ${initialData.length}`);

  console.log('🔄 2. 测试写入一条测试便签...');
  const { data: inserted, error: insertErr } = await supabase
    .from('notes')
    .insert([
      {
        title: '☁️ 云端 Supabase 集成测试',
        content: '这条便签成功写入了 Supabase 云端 PostgreSQL 数据库！',
        color: 'purple',
        tags: ['Supabase', 'Cloud'],
        isPinned: true,
      },
    ])
    .select()
    .single();

  if (insertErr) {
    console.error('❌ 写入错误 (请检查 RLS 策略):', insertErr.message);
    return;
  }
  console.log('✅ 写入成功！便签 ID:', inserted.id);

  console.log('🔄 3. 测试删除该测试便签...');
  const { error: delErr } = await supabase.from('notes').delete().eq('id', inserted.id);
  if (delErr) {
    console.error('❌ 删除错误:', delErr.message);
    return;
  }
  console.log('✅ 删除清理成功！Supabase 增删改查链路全通！🎉');
}

fullTest();
