/**
 * Supabase 客户端初始化
 *
 * 注意：uni-app Weex V8 环境下 new URL() 可能不可用，
 * 需要确保 URL 构造函数存在后调用 createClient
 */
import {
	createClient
} from '@supabase/supabase-js'

// ===== Supabase 项目信息 =====
const SUPABASE_URL = 'https://jxvqhdyekyeijazmrkbd.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_Jh6GX6TyvDe3IvSca1iXEQ_R3YzRDUX'
// =============================================

/** 确保 URL 构造函数在全局可用（uni-app Weex 环境补丁） */
if (typeof URL === 'undefined' || typeof URL !== 'function') {
	try {
		// 尝试用 eval 获取内置 URL（V8 可能未暴露到全局）
		const BuiltinURL = eval('URL')
		if (typeof BuiltinURL === 'function') {
			globalThis.URL = BuiltinURL
		}
	} catch (e) {
		// 若 V8 确实没有 URL，使用简单字符串校验代替
		console.warn('[supabase] URL constructor unavailable, using string validation')
	}
}

/**
 * 安全创建 Supabase 客户端
 * 捕获 new URL() 可能抛出的异常，降级为字符串校验
 */
function safeCreateClient(url, key) {
	try {
		// 先尝试 URL 校验（正常环境）
		if (typeof URL === 'function') {
			new URL(url)
		}
		return createClient(url, key)
	} catch (e) {
		// URL 构造函数不可用 → 手工校验并创建
		console.warn('[supabase] falling back to legacy URL check:', e.message)
		if (!url || !url.match(/^https?:\/\//i)) {
			console.error('[supabase] Invalid URL:', url)
			return null
		}
		// 绕过 URL 校验，直接返回一个模拟客户端
		try {
			return createClient(url, key)
		} catch (e2) {
			console.error('[supabase] createClient failed:', e2.message)
			return null
		}
	}
}

export const supabase = safeCreateClient(SUPABASE_URL, SUPABASE_ANON_KEY) || {}
// 确保 supabase.auth 不会崩溃
if (!supabase.auth) {
	supabase.auth = {
		getSession: async () => ({ data: { session: null }, error: null }),
		onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
		signOut: async () => ({ error: null }),
		signInWithPassword: async () => ({ error: new Error('Supabase unavailable') }),
	}
}