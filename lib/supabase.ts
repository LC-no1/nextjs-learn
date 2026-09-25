import { createClient } from '@supabase/supabase-js';

/**
 * Next.js 规范说明：
 * 1. process.env.NEXT_PUBLIC_* 环境变量：以 NEXT_PUBLIC_ 开头命名的变量会被 Next.js
 *    同时注入到客户端（浏览器）和服务器（Node.js）运行时中。
 * 2. Supabase 的 anon public key 是专门设计为公开的，真正的权限由数据库端的 RLS（行级安全策略）来保障。
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('缺少 Supabase 环境变量，请检查 .env 中的 NEXT_PUBLIC_SUPABASE_URL 和 NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
