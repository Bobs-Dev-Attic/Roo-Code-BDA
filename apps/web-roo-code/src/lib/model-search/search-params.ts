import { z } from "zod"

const MAX_QUERY_LENGTH = 200
const MAX_NUMERIC_FILTER = 1_000_000

export const modelSearchSortFields = ["relevance", "name", "context_length", "created"] as const
export const modelSearchSortDirections = ["asc", "desc"] as const

export const modelSearchParamsSchema = z.object({
	query: z.string().trim().max(MAX_QUERY_LENGTH).default(""),
	minVramGb: z.number().int().min(0).max(MAX_NUMERIC_FILTER).optional(),
	minRamGb: z.number().int().min(0).max(MAX_NUMERIC_FILTER).optional(),
	minContext: z.number().int().min(0).max(MAX_NUMERIC_FILTER).optional(),
	sortBy: z.enum(modelSearchSortFields).default("relevance"),
	sortDirection: z.enum(modelSearchSortDirections).default("asc"),
})

export type ModelSearchParams = z.infer<typeof modelSearchParamsSchema>

export const parseModelSearchParams = (raw: unknown): ModelSearchParams => modelSearchParamsSchema.parse(raw)
