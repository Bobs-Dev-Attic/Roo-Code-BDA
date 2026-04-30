import { describe, expect, it } from "vitest"

import { parseModelSearchParams } from "./search-params"

describe("parseModelSearchParams", () => {
	it("accepts valid payloads and applies defaults", () => {
		const parsed = parseModelSearchParams({ query: "  qwen  " })

		expect(parsed.query).toBe("qwen")
		expect(parsed.sortBy).toBe("relevance")
		expect(parsed.sortDirection).toBe("asc")
	})

	it("rejects unsupported sort fields", () => {
		expect(() => parseModelSearchParams({ sortBy: "downloads" })).toThrow()
	})

	it("rejects unsupported sort direction", () => {
		expect(() => parseModelSearchParams({ sortDirection: "up" })).toThrow()
	})

	it("rejects out-of-range numeric filters", () => {
		expect(() => parseModelSearchParams({ minVramGb: -1 })).toThrow()
		expect(() => parseModelSearchParams({ minContext: 1_000_001 })).toThrow()
	})
})
