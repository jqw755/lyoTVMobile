/**
 * Supabase REST 客户端
 *
 * 使用 uni.request 实现 REST API 调用，替代 @supabase/supabase-js SDK。
 * 解决 HBuilder 打包 APP 环境下 supabase-js 依赖的 node-fetch / cross-fetch
 * 等浏览器 API 不可用导致的 "Supabase unavailable" 问题。
 */
const SUPABASE_URL = 'https://jxvqhdyekyeijazmrkbd.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_Jh6GX6TyvDe3IvSca1iXEQ_R3YzRDUX'

const SESSION_KEY = 'lyotv_supabase_session'

// ====== 事件监听（模拟 onAuthStateChange） ======
const _authListeners = []

function _notifyAuthListeners(event, session) {
	_authListeners.forEach(cb => {
		try {
			cb(event, session)
		} catch (e) {
			// ignore
		}
	})
}

// ====== Session 管理 ======
let _session = null

function _loadSession() {
	try {
		const saved = uni.getStorageSync(SESSION_KEY)
		if (saved && saved.access_token) {
			_session = saved
		}
	} catch {
		/* ignore */ }
}

function _saveSession(session) {
	_session = session
	try {
		if (session && session.access_token) {
			uni.setStorageSync(SESSION_KEY, session)
		} else {
			uni.removeStorageSync(SESSION_KEY)
		}
	} catch {
		/* ignore */ }
}

// ====== REST 请求（uni.request 封装） ======
function _getAuthHeaders() {
	const headers = {
		'apikey': SUPABASE_ANON_KEY
	}
	if (_session?.access_token) {
		headers['Authorization'] = 'Bearer ' + _session.access_token
	}
	return headers
}

function _request(path, options = {}) {
	const {
		method = 'GET', body, headers = {}
	} = options
	const url = SUPABASE_URL + path

	return new Promise((resolve, reject) => {
		uni.request({
			url,
			method,
			data: body,
			timeout: 10000,
			header: Object.assign({}, _getAuthHeaders(), {
				'Content-Type': 'application/json'
			}, headers),
			success: (res) => {
				if (res.statusCode >= 200 && res.statusCode < 300) {
					resolve(res.data)
				} else {
					const msg = res.data?.msg ||
						res.data?.error_description ||
						res.data?.error ||
						res.data?.message ||
						(res.data && typeof res.data === 'string' ? res.data : JSON.stringify(res
							.data))
					const err = new Error(msg || 'HTTP ' + res.statusCode)
					err.statusCode = res.statusCode
					reject(err)
				}
			},
			fail: (err) => {
				reject(new Error(err.errMsg || 'Network request failed'))
			}
		})
	})
}

// ====== 查询构建器（模拟 supabase-js 的链式 API） ======
class QueryBuilder {
	constructor(tableName) {
		this._tableName = tableName
		this._method = 'SELECT'
		this._columns = '*'
		this._filters = []
		this._single = false
		this._limitVal = null
		this._offset = null
		this._rangeStart = null
		this._rangeEnd = null
		this._orderField = null
		this._orderAsc = true
		this._body = null
		this._upsertConflict = null
		this._upsertIgnore = false
	}

	select(columns) {
		this._method = 'SELECT'
		if (columns) this._columns = columns
		return this
	}

	insert(data) {
		this._method = 'INSERT'
		this._body = data
		return this
	}

	update(data) {
		this._method = 'UPDATE'
		this._body = data
		return this
	}

	upsert(data, opts = {}) {
		this._method = 'UPSERT'
		this._body = data
		this._upsertConflict = opts.onConflict || null
		this._upsertIgnore = opts.ignoreDuplicates || false
		return this
	}

	delete() {
		this._method = 'DELETE'
		return this
	}

	eq(field, value) {
		this._filters.push({
			field: field,
			operator: 'eq',
			value: value
		})
		return this
	}

	single() {
		this._single = true
		return this
	}

	/**
	 * maybeSingle：同 single 取数组首项，但空时不抛错返回 null（对齐 postgREST maybeSingle）
	 * 用于 profiles 行可能不存在时的兜底查询，避免 .single() 抛 PGRST116 中断登录流
	 */
	maybeSingle() {
		this._single = true
		this._maybeSingle = true
		return this
	}

	limit(n) {
		this._limitVal = n
		return this
	}

	/**
	 * 分页范围查询（PostgREST Range header）
	 * @param {number} start 起始索引（0-based）
	 * @param {number} end 结束索引（含）
	 */
	range(start, end) {
		this._rangeStart = start
		this._rangeEnd = end
		return this
	}

	order(field, opts) {
		this._orderField = field
		this._orderAsc = !opts || opts.ascending !== false
		return this
	}

	/** 使 QueryBuilder "thenable"，支持 await 直接调用 */
	then(resolve, reject) {
		return this._execute().then(resolve, reject)
	}

	/** 向后兼容 supabase-js 风格：await builder 实际上调用 then */
	catch (reject) {
		return this._execute().then(undefined, reject)
	}

	async _execute() {
		try {
			let path = '/rest/v1/' + this._tableName
			const params = []

			// 列选择
			if (this._method === 'SELECT' && this._columns && this._columns !== '*') {
				params.push('select=' + this._columns)
			}

			// 过滤条件
			for (const f of this._filters) {
				params.push(f.field + '=' + f.operator + '.' + encodeURIComponent(String(f.value)))
			}

			// 排序
			if (this._orderField) {
				params.push('order=' + this._orderField + '.' + (this._orderAsc ? 'asc' : 'desc'))
			}

			// 限制条数
			if (this._limitVal) {
				params.push('limit=' + this._limitVal)
			}

			if (params.length > 0) {
				path += '?' + params.join('&')
			}

			const headers = {}
			let method = 'GET'
			let body = null

			// Range 分页头
			if (this._rangeStart != null && this._rangeEnd != null) {
				headers['Range'] = this._rangeStart + '-' + this._rangeEnd
			}

			switch (this._method) {
				case 'SELECT':
					method = 'GET'
					break
				case 'INSERT':
					method = 'POST'
					body = Array.isArray(this._body) ? this._body : [this._body]
					headers['Prefer'] = 'return=representation'
					break
				case 'UPSERT':
					method = 'POST'
					body = Array.isArray(this._body) ? this._body : [this._body]
					if (this._upsertConflict) {
						path += (params.length > 0 ? '&' : '?') + 'on_conflict=' + this._upsertConflict
					}
					headers['Prefer'] = this._upsertIgnore ?
						'resolution=ignore-duplicates,return=representation' :
						'resolution=merge-duplicates,return=representation'
					break
				case 'UPDATE':
					method = 'PATCH'
					body = this._body
					headers['Prefer'] = 'return=representation'
					break
				case 'DELETE':
					method = 'DELETE'
					headers['Prefer'] = 'return=representation'
					break
			}

			const data = await _request(path, {
				method: method,
				body: body,
				headers: headers
			})

			// single() 模式：数组取第一项
			if (this._single && Array.isArray(data)) {
				return {
					data: data[0] || null,
					error: null
				}
			}
			return {
				data: data,
				error: null
			}
		} catch (err) {
			// 401 = token 过期，通知上层弹登录失效提示（仅当用户已登录时）
			if (err.statusCode === 401 && _session) {
				uni.$emit('auth:tokenExpired')
			}
			return {
				data: null,
				error: err
			}
		}
	}
}

// ====== 启动时尝试恢复 session ======
_loadSession()

// ====== 导出的客户端对象（与 supabase-js 兼容的 API 形状） ======
export const supabase = {
	auth: {
		/**
		 * 获取当前 session（从本地缓存恢复，尝试验证有效性，过期自动刷新）
		 */
		async getSession() {
			if (!_session) _loadSession()

			// 有 session 则尝试验证 token
			if (_session && _session.access_token) {
				try {
					const user = await _request('/auth/v1/user', {
						headers: {
							'Authorization': 'Bearer ' + _session.access_token
						}
					})
					return {
						data: {
							session: {
								user: user,
								access_token: _session.access_token,
								refresh_token: _session.refresh_token
							}
						},
						error: null
					}
				} catch (e) {
					// token 过期或无效，尝试 refresh
					if (_session.refresh_token) {
						try {
							const data = await _request('/auth/v1/token?grant_type=refresh_token', {
								method: 'POST',
								body: {
									refresh_token: _session.refresh_token
								}
							})
							const newSession = {
								access_token: data.access_token,
								refresh_token: data.refresh_token || _session.refresh_token,
								expires_in: data.expires_in,
								expires_at: Date.now() + (data.expires_in || 3600) * 1000
							}
							_saveSession(newSession)
							return {
								data: {
									session: {
										user: data.user,
										...newSession
									}
								},
								error: null
							}
						} catch (e2) {
							// refresh 失败，清除 session
							_saveSession(null)
							return {
								data: {
									session: null
								},
								error: null
							}
						}
					}
					// 没有 refresh_token，清除
					_saveSession(null)
					return {
						data: {
							session: null
						},
						error: null
					}
				}
			}
			return {
				data: {
					session: null
				},
				error: null
			}
		},

		/**
		 * 监听登录态变化
		 */
		onAuthStateChange(callback) {
			_authListeners.push(callback)
			return {
				data: {
					subscription: {
						unsubscribe: function() {
							const idx = _authListeners.indexOf(callback)
							if (idx >= 0) _authListeners.splice(idx, 1)
						}
					}
				}
			}
		},

		/**
		 * 登录（使用邮箱+密码）
		 */
		async signInWithPassword({ email, password }) {
			try {
				const data = await _request('/auth/v1/token?grant_type=password', {
					method: 'POST',
					body: { email, password }
				})
				const session = {
					access_token: data.access_token,
					refresh_token: data.refresh_token,
					expires_in: data.expires_in,
					expires_at: Date.now() + (data.expires_in || 3600) * 1000
				}
				_saveSession(session)
				_notifyAuthListeners('SIGNED_IN', session)
				return { data: { user: data.user, session }, error: null }
			} catch (err) {
				return { data: { user: null, session: null }, error: err }
			}
		},

		/**
		 * 注册
		 */
		async signUp({ email, password }) {
			try {
				const data = await _request('/auth/v1/signup', {
					method: 'POST',
					body: { email, password }
				})
				return { data, error: null }
			} catch (err) {
				return { data: null, error: err }
			}
		},

		/**
		 * 退出登录
		 */
		async signOut() {
			try {
				if (_session && _session.access_token) {
					try {
						await _request('/auth/v1/logout', {
							method: 'POST',
							headers: {
								'Authorization': 'Bearer ' + _session.access_token
							}
						})
					} catch {
						/* logout 失败不影响清除本地 session */ }
				}
				_saveSession(null)
				_notifyAuthListeners('SIGNED_OUT', null)
				return {
					error: null
				}
			} catch (err) {
				return {
					error: err
				}
			}
		}
	},

	/**
	 * 创建数据表查询构建器
	 * supabase.from('profiles').select(...).eq(...).single()
	 */
	from(tableName) {
		// 每次调用返回新实例以支持并发链式调用
		return new QueryBuilder(tableName)
	}
}