export type ModelSearchEvent =
	| { type: "compatible_click"; modelId: string }
	| { type: "relevant_click"; modelId: string }
	| { type: "conversion_run"; modelId: string }
	| { type: "conversion_install"; modelId: string }
	| { type: "search_reformulated"; from: string; to: string }

export const MODEL_SEARCH_DUAL_RESULTS_FLAG = "model_search_dual_results"

export const trackModelSearchEvent = (event: ModelSearchEvent) => {
	// Hook this into analytics provider when wiring UI events.
	return event
}
