import { describe, expect, it } from "vitest"

import { buildModelSearchSections, OpenRouterModelRecord } from "./use-open-router-models"

const models: OpenRouterModelRecord = {
	"provider/model-a": {
		id: "provider/model-a",
		name: "Model Alpha",
		description: "Fast coding model",
		created: 1,
		context_length: 8192,
		pricing: {},
		modelInfo: {
			contextWindow: 8192,
			supportsPromptCache: false,
			supportsImages: false,
			supportsThinking: false,
			tiers: [],
		},
	},
	"provider/model-b": {
		id: "provider/model-b",
		name: "Model Beta",
		description: "General model",
		created: 1,
		context_length: 4096,
		pricing: {},
		modelInfo: {
			contextWindow: 4096,
			supportsPromptCache: false,
			supportsImages: false,
			supportsThinking: false,
			tiers: [],
		},
	},
}

describe("buildModelSearchSections", () => {
	it("splits compatible and relevant results for a keyword query", () => {
		const sections = buildModelSearchSections(models, "model", (model) => model.modelInfo.contextWindow >= 8000)

		expect(sections.relevant.map((model) => model.id)).toEqual(["provider/model-a", "provider/model-b"])
		expect(sections.compatible.map((model) => model.id)).toEqual(["provider/model-a"])
	})

	it("matches by id and description", () => {
		const byId = buildModelSearchSections(models, "model-b", () => true)
		expect(byId.relevant.map((model) => model.id)).toEqual(["provider/model-b"])

		const byDescription = buildModelSearchSections(models, "coding", () => true)
		expect(byDescription.relevant.map((model) => model.id)).toEqual(["provider/model-a"])
	})
})
