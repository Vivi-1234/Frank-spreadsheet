const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export function getCachedData(key) {
  const cached = localStorage.getItem(key)
  if (cached) {
    const { data, timestamp } = JSON.parse(cached)
    if (Date.now() - timestamp < CACHE_DURATION) {
      return data
    } else {
      localStorage.removeItem(key)
    }
  }
  return null
}

export function setCachedData(key, data) {
  const timestamp = Date.now()
  localStorage.setItem(key, JSON.stringify({ data, timestamp }))
}

export function clearCache(key) {
  localStorage.removeItem(key)
}

export function clearCacheByPrefix(prefix) {
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && key.startsWith(prefix)) {
      localStorage.removeItem(key)
      i--
    }
  }
}

