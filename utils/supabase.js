/**
 * Supabase 客户端初始化
 *
 * 使用前请替换下方 URL 和 ANON_KEY 为你的 Supabase 项目信息
 * 在 supabase.com → Settings → API 页面获取
 */
import {
	createClient
} from '@supabase/supabase-js'

// ===== Supabase 项目信息 =====
const SUPABASE_URL = 'https://jxvqhdyekyeijazmrkbd.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_Jh6GX6TyvDe3IvSca1iXEQ_R3YzRDUX'
// =============================================

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)