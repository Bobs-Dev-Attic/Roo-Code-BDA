export type ModelSearchPhase = 1 | 2 | 3 | 4

export const MODEL_SEARCH_GRADE_TOOLTIP = "Grade based on VRAM fit, speed estimate, and quality proxy."

export const MODEL_SEARCH_PHASE_PLAN: Record<ModelSearchPhase, string[]> = {
	1: [
		"Two sections in search response/UI",
		"Hard compatibility filter for section A",
		"Basic relevance sorting for section B",
		"No grade yet, only compatibility status",
	],
	2: ["Model-variant highlighting", "Why-compatible labels", "Sortable controls for section B"],
	3: ["Grading v1 (A-D)", "Near-miss explanations"],
	4: ["Ranking profiles: Balanced, Best speed, Best quality"],
}

export type RankingProfile = "balanced" | "best_speed" | "best_quality"
