/**
 * 全局调试日志 store
 * 任意页面 addLog，debug-panel 组件统一展示
 * 新日志插到顶部（unshift），无需自动滚动
 */
import { ref } from 'vue'

export const debugLogs = ref([])

export function addLog(tag, msg) {
	const t = new Date()
	const time = t.toLocaleTimeString('zh-CN', { hour12: false }) + '.' +
		String(t.getMilliseconds()).padStart(3, '0')
	const line = `[${time}] ${tag} | ${msg}`
	debugLogs.value.unshift(line)
	if (debugLogs.value.length > 120) debugLogs.value.pop()
	console.log(line)
}

/**
 * 添加 action 分隔线，标记一次操作的起始点
 * 展示为高亮标题行，方便在日志中区分不同操作
 */
export function logSection(title) {
	const t = new Date()
	const time = t.toLocaleTimeString('zh-CN', { hour12: false }) + '.' +
		String(t.getMilliseconds()).padStart(3, '0')
	const line = `[${time}] ═══════ ${title} ═══════`
	debugLogs.value.unshift(line)
	if (debugLogs.value.length > 120) debugLogs.value.pop()
	console.log(`%c${line}`, 'color:#fe8027;font-weight:bold')
}

export function clearDebugLogs() {
	debugLogs.value = []
}
