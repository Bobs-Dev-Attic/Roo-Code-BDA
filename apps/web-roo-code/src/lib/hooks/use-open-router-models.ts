import { z } from "zod"
import { useQuery } from "@tanstack/react-query"

import { ModelInfo } from "@roo-code/types"

const parsePrice = (price?: string) => (price ? parseFloat(price) * 1_000_000 : undefined)

export const openRouterModelSchema = z.object({
	id: z.string(),
	name: z.string(),
	description: z.string(),
	created: z.number(),
	context_length: z.number(),
	pricing: z.object({
		prompt: z.string().optional(),
		completion: z.string().optional(),
	}),
	top_provider: z
		.object({
			max_completion_tokens: z.number().nullish(),
		})
		.optional(),
	architecture: z
		.object({
			input_modalities: z.array(z.string()).nullish(),
			output_modalities: z.array(z.string()).nullish(),
		})
		.optional(),
})

export type OpenRouterModel = z.infer<typeof openRouterModelSchema>

export type OpenRouterModelRecord = Record<string, OpenRouterModel & { modelInfo: ModelInfo }>
export type OpenRouterModelWithInfo = OpenRouterModel & { modelInfo: ModelInfo }

export type ModelSearchResultSections = {
	compatible: OpenRouterModelWithInfo[]
	relevant: OpenRouterModelWithInfo[]
}

export type PerformanceGrade = "A" | "B" | "C" | "D"

export type HardwareProfile = {
	gpuVramGb?: number
	ramGb?: number
	cpuClass?: "low" | "mid" | "high"
	backend?: "cpu" | "cuda" | "metal"
}

export type ModelVariantRequirement = {
	name: string
	minVramGb?: number
	minRamGb?: number
	minCpuClass?: "low" | "mid" | "high"
	backend?: "cpu" | "cuda" | "metal"
	sizeBillions?: number
	speedScore?: number
	qualityScore?: number
	downloads?: number
	updatedAt?: number
}

export type ModelSearchModelWithVariants = OpenRouterModelWithInfo & {
	variants?: ModelVariantRequirement[]
}

export type CompatibleModelResult = {
	model: ModelSearchModelWithVariants
	variant: ModelVariantRequirement
	whyCompatible: string[]
	grade: PerformanceGrade
}

export type NearMissResult = {
	model: ModelSearchModelWithVariants
	variant?: ModelVariantRequirement
	reason: string
}

export type ModelSortOption = "relevance" | "size" | "speed" | "quality" | "downloads" | "updated"

export type EnhancedModelSearchSections = {
	compatible: CompatibleModelResult[]
	relevant: ModelSearchModelWithVariants[]
	nearMisses: NearMissResult[]
}

const includesQuery = (model: OpenRouterModelWithInfo, query: string) => {
	const normalizedQuery = query.trim().toLowerCase()
	if (!normalizedQuery) {
		return true
	}

	return [model.name, model.id, model.description].some((value) => value.toLowerCase().includes(normalizedQuery))
}

/**
 * Returns phase-1 model-search sections:
 * - compatible: models that match the keyword and pass compatibility checks
 * - relevant: all keyword matches in alphabetical order (including compatible models)
 */
export const buildModelSearchSections = (
	models: OpenRouterModelRecord,
	query: string,
	isCompatible: (model: OpenRouterModelWithInfo) => boolean,
): ModelSearchResultSections => {
	const relevant = Object.values(models)
		.filter((model) => includesQuery(model, query))
		.sort((a, b) => a.name.localeCompare(b.name))

	const compatible = relevant.filter(isCompatible)

	return { compatible, relevant }
}

export const getOpenRouterModels = async (): Promise<OpenRouterModelRecord> => {
	const response = await fetch("https://openrouter.ai/api/v1/models")

	if (!response.ok) {
		console.error("Failed to fetch OpenRouter models")
		return {}
	}

	const result = z.object({ data: z.array(openRouterModelSchema) }).safeParse(await response.json())

	if (!result.success) {
		console.error(result.error)
		return {}
	}

	return result.data.data
		.filter((rawModel) => {
			// Skip image generation models (models that output images).
			return !rawModel.architecture?.output_modalities?.includes("image")
		})
		.sort((a, b) => a.name.localeCompare(b.name))
		.map((rawModel) => ({
			...rawModel,
			modelInfo: {
				maxTokens: rawModel.top_provider?.max_completion_tokens ?? undefined,
				contextWindow: rawModel.context_length,
				inputPrice: parsePrice(rawModel.pricing?.prompt),
				outputPrice: parsePrice(rawModel.pricing?.completion),
				description: rawModel.description,
				supportsPromptCache: false,
				supportsImages: rawModel.architecture?.input_modalities?.includes("image") ?? false,
				supportsThinking: false,
				tiers: [],
			},
		}))
		.reduce((acc, model) => {
			acc[model.id] = model
			return acc
		}, {} as OpenRouterModelRecord)
}

export const useOpenRouterModels = () =>
	useQuery<OpenRouterModelRecord>({ queryKey: ["getOpenRouterModels"], queryFn: getOpenRouterModels })

const cpuRank = (cpu: HardwareProfile["cpuClass"]) => {
	if (!cpu) {
		return 0
	}
	return cpu === "high" ? 3 : cpu === "mid" ? 2 : 1
}

const gradeFromScore = (score: number): PerformanceGrade => {
	if (score >= 85) return "A"
	if (score >= 70) return "B"
	if (score >= 50) return "C"
	return "D"
}

const computeGrade = (variant: ModelVariantRequirement, hardware?: HardwareProfile): PerformanceGrade => {
	const vramHeadroom = hardware?.gpuVramGb && variant.minVramGb ? Math.max(0, hardware.gpuVramGb - variant.minVramGb) : 0
	const ramHeadroom = hardware?.ramGb && variant.minRamGb ? Math.max(0, hardware.ramGb - variant.minRamGb) : 0
	const fitScore = Math.min(100, 60 + vramHeadroom * 5 + ramHeadroom * 2)
	const speedScore = variant.speedScore ?? 60
	const qualityScore = variant.qualityScore ?? 60
	return gradeFromScore(fitScore * 0.4 + speedScore * 0.3 + qualityScore * 0.3)
}

const compareRelevantModels = (a: ModelSearchModelWithVariants, b: ModelSearchModelWithVariants, sortBy: ModelSortOption) => {
	const maxNum = (values: Array<number | undefined>) => Math.max(...values.map((value) => value ?? 0))

	if (sortBy === "size") {
		return maxNum((b.variants ?? []).map((variant) => variant.sizeBillions)) - maxNum((a.variants ?? []).map((variant) => variant.sizeBillions))
	}
	if (sortBy === "speed") {
		return maxNum((b.variants ?? []).map((variant) => variant.speedScore)) - maxNum((a.variants ?? []).map((variant) => variant.speedScore))
	}
	if (sortBy === "quality") {
		return maxNum((b.variants ?? []).map((variant) => variant.qualityScore)) - maxNum((a.variants ?? []).map((variant) => variant.qualityScore))
	}
	if (sortBy === "downloads") {
		return maxNum((b.variants ?? []).map((variant) => variant.downloads)) - maxNum((a.variants ?? []).map((variant) => variant.downloads))
	}
	if (sortBy === "updated") {
		return maxNum((b.variants ?? []).map((variant) => variant.updatedAt)) - maxNum((a.variants ?? []).map((variant) => variant.updatedAt))
	}

	return a.name.localeCompare(b.name)
}

export const buildEnhancedModelSearchSections = (
	models: Record<string, ModelSearchModelWithVariants>,
	query: string,
	hardware?: HardwareProfile,
	sortBy: ModelSortOption = "relevance",
): EnhancedModelSearchSections => {
	const relevant = Object.values(models)
		.filter((model) => includesQuery(model, query))
		.sort((a, b) => compareRelevantModels(a, b, sortBy))

	const compatible: CompatibleModelResult[] = []
	const nearMisses: NearMissResult[] = []

	for (const model of relevant) {
		for (const variant of model.variants ?? []) {
			const reasons: string[] = []
			let failedReason: string | undefined

			if (variant.minVramGb !== undefined && hardware?.gpuVramGb !== undefined) {
				if (variant.minVramGb > hardware.gpuVramGb) {
					failedReason = `needs +${Math.ceil(variant.minVramGb - hardware.gpuVramGb)}GB VRAM`
				} else {
					reasons.push("VRAM fit")
				}
			}

			if (!failedReason && variant.minRamGb !== undefined && hardware?.ramGb !== undefined) {
				if (variant.minRamGb > hardware.ramGb) {
					failedReason = `needs +${Math.ceil(variant.minRamGb - hardware.ramGb)}GB RAM`
				} else {
					reasons.push("RAM fit")
				}
			}

			if (!failedReason && variant.minCpuClass && hardware?.cpuClass) {
				if (cpuRank(variant.minCpuClass) > cpuRank(hardware.cpuClass)) {
					failedReason = `requires ${variant.minCpuClass} CPU class`
				} else {
					reasons.push("CPU class fit")
				}
			}

			if (!failedReason && variant.backend && hardware?.backend && variant.backend !== hardware.backend) {
				failedReason = `backend mismatch (${variant.backend} required)`
			}

			if (failedReason) {
				nearMisses.push({ model, variant, reason: failedReason })
			} else {
				compatible.push({
					model,
					variant,
					whyCompatible: reasons.length ? reasons : ["Compatible"],
					grade: computeGrade(variant, hardware),
				})
			}
		}
	}

	return { compatible, relevant, nearMisses }
}
