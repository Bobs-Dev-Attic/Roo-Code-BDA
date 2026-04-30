export type AbuseAssessment = {
	allowed: boolean
	reason?: string
	sanitizedSearch?: string
}

const WINDOW_MS = 60_000
const MAX_REQUESTS_PER_WINDOW = 30
const MAX_SEARCH_LENGTH = 200

const requestTimestamps = new Map<string, number[]>()

export function assessMarketplaceFilterRequest(clientKey: string, search?: string): AbuseAssessment {
	const now = Date.now()
	const timestamps = requestTimestamps.get(clientKey) ?? []
	const inWindow = timestamps.filter((ts) => now - ts < WINDOW_MS)

	if (inWindow.length >= MAX_REQUESTS_PER_WINDOW) {
		return { allowed: false, reason: "rate_limited" }
	}

	inWindow.push(now)
	requestTimestamps.set(clientKey, inWindow)

	if (!search) {
		return { allowed: true }
	}

	const sanitizedSearch = [...search]
		.filter((char) => {
			const code = char.charCodeAt(0)
			return code >= 32 && code !== 127
		})
		.join("")
		.trim()
		.slice(0, MAX_SEARCH_LENGTH)
	if (sanitizedSearch.length === 0 && search.length > 0) {
		return { allowed: false, reason: "invalid_search" }
	}

	return { allowed: true, sanitizedSearch }
}

export function resetRequestGuardsForTests() {
	requestTimestamps.clear()
}
