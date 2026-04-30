import { describe, expect, it } from "vitest"

import {
	buildEnhancedModelSearchSections,
	buildModelSearchSections,
	HardwareProfile,
	ModelSearchModelWithVariants,
	OpenRouterModelRecord,
} from "./use-open-router-models"

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

const variantModels: Record<string, ModelSearchModelWithVariants> = {
	"provider/model-a": {
		...models["provider/model-a"],
		variants: [
			{
				name: "7B Q4_K_M",
				minVramGb: 8,
				minRamGb: 16,
				minCpuClass: "mid",
				backend: "cuda",
				speedScore: 85,
				qualityScore: 80,
				sizeBillions: 7,
				downloads: 1_000,
				updatedAt: 200,
			},
		],
	},
	"provider/model-b": {
		...models["provider/model-b"],
		variants: [
			{
				name: "13B Q6",
				minVramGb: 14,
				minRamGb: 24,
				minCpuClass: "high",
				backend: "cuda",
				speedScore: 70,
				qualityScore: 90,
				sizeBillions: 13,
				downloads: 5_000,
				updatedAt: 300,
			},
		],
	},
}

describe("buildEnhancedModelSearchSections", () => {
	const hardware: HardwareProfile = { gpuVramGb: 12, ramGb: 32, cpuClass: "high", backend: "cuda" }

	it("returns compatible models with variant highlighting, reasons, and grade", () => {
		const sections = buildEnhancedModelSearchSections(variantModels, "model", hardware)

		expect(sections.compatible).toHaveLength(1)
		expect(sections.compatible[0].variant.name).toBe("7B Q4_K_M")
		expect(sections.compatible[0].whyCompatible).toContain("VRAM fit")
		expect(["A", "B", "C", "D"]).toContain(sections.compatible[0].grade)
	})

	it("returns near-miss badges for incompatible variants", () => {
		const sections = buildEnhancedModelSearchSections(variantModels, "model", hardware)
		expect(sections.nearMisses[0].reason).toContain("needs +2GB VRAM")
	})

	it("supports configurable relevant sorting", () => {
		const sections = buildEnhancedModelSearchSections(variantModels, "model", hardware, "downloads")
		expect(sections.relevant.map((model) => model.id)).toEqual(["provider/model-b", "provider/model-a"])
	})
})
