const USER_AGENT = '1tzkaos-profile-updater'
const DEFAULT_STATS_URL = 'https://api.dexploit.dev/api/v1/stats'

// The endpoint currently serves aggregate stats without a key. apiKey stays
// optional so this keeps working if auth is enforced later.
export async function fetchStats({ url = DEFAULT_STATS_URL, apiKey, fetchImpl = fetch } = {}) {
  // A key would ride in the query string, so nothing derived from this URL may
  // ever reach an error message or a log line.
  const target = apiKey ? `${url}?api_key=${encodeURIComponent(apiKey)}` : url
  const response = await fetchImpl(target, { headers: { 'user-agent': USER_AGENT } })
  if (!response.ok) throw new Error(`fetchStats: HTTP ${response.status}`)

  const body = await response.json()
  const data = body?.data ?? body
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new Error('fetchStats: unexpected response shape')
  }
  return data
}

export async function fetchActivity(user, token, fetchImpl = fetch) {
  const headers = { 'user-agent': USER_AGENT, accept: 'application/vnd.github+json' }
  if (token) headers.authorization = `Bearer ${token}`

  const response = await fetchImpl(
    `https://api.github.com/users/${encodeURIComponent(user)}/events/public?per_page=100`,
    { headers },
  )
  if (!response.ok) throw new Error(`fetchActivity: HTTP ${response.status}`)
  return response.json()
}
