import { describe, expect, it, beforeEach, vi } from "vitest"
import { assessMarketplaceFilterRequest, resetRequestGuardsForTests } from "../requestGuards"

describe("requestGuards", () => {
	beforeEach(() => {
		resetRequestGuardsForTests()
	})

	it("allows normal request and sanitizes search", () => {
		const result = assessMarketplaceFilterRequest("client-a", "  valid query\u0000")
		expect(result.allowed).toBe(true)
		expect(result.sanitizedSearch).toBe("valid query")
	})

	it("blocks requests when rate limit is exceeded", () => {
		for (let i = 0; i < 30; i++) {
			expect(assessMarketplaceFilterRequest("client-a").allowed).toBe(true)
		}
		expect(assessMarketplaceFilterRequest("client-a")).toEqual({ allowed: false, reason: "rate_limited" })
	})

	it("resets window after timeout", () => {
		vi.useFakeTimers()
		for (let i = 0; i < 30; i++) {
			assessMarketplaceFilterRequest("client-a")
		}
		vi.advanceTimersByTime(60_001)
		expect(assessMarketplaceFilterRequest("client-a").allowed).toBe(true)
		vi.useRealTimers()
	})
})
