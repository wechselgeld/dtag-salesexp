/**
 * Lightweight fuzzy search utility.
 *
 * Supports:
 * - Case-insensitive matching
 * - Multi-word queries (all words must match somewhere)
 * - Typo tolerance via bigram similarity (catches "Margenta" → "Magenta")
 * - Scoring for ranking results
 */

/** Calculate bigram similarity between two strings (0..1) */
function bigramSimilarity(a: string, b: string): number {
	if (a.length < 2 || b.length < 2) {
		return a === b ? 1 : 0;
	}

	const bigramsA = new Set<string>();
	for (let i = 0; i < a.length - 1; i++) {
		bigramsA.add(a.slice(i, i + 2));
	}

	const bigramsB = new Set<string>();
	for (let i = 0; i < b.length - 1; i++) {
		bigramsB.add(b.slice(i, i + 2));
	}

	let intersection = 0;
	for (const bg of bigramsA) {
		if (bigramsB.has(bg)) { intersection++; }
	}

	return (2 * intersection) / (bigramsA.size + bigramsB.size);
}

/** Check if a single query word fuzzy-matches any word in the target string */
function wordFuzzyMatch(queryWord: string, targetWords: string[]): number {
	// Exact substring match → high score
	const target = targetWords.join(' ');
	if (target.includes(queryWord)) { return 1; }

	// Word-level bigram similarity
	let bestScore = 0;
	for (const tw of targetWords) {
		const sim = bigramSimilarity(queryWord, tw);
		if (sim > bestScore) { bestScore = sim; }
	}

	return bestScore;
}

export interface FuzzyResult<T> {
    item: T;
    score: number;
}

/**
 * Perform a fuzzy search over items.
 *
 * @param items - Array of items to search
 * @param query - Search query string
 * @param getSearchableText - Function to extract searchable text fields from an item
 * @param threshold - Minimum score to include (0..1, default 0.3)
 */
export function fuzzySearch<T>(
	items: T[],
	query: string,
	getSearchableText: (item: T) => string[],
	threshold = 0.3,
): FuzzyResult<T>[] {
	const q = query.toLowerCase().trim();
	if (!q) {
		return items.map(item => ({
			item,
			score: 1,
		}));
	}

	const queryWords = q.split(/\s+/).filter(Boolean);

	const results: FuzzyResult<T>[] = [
	];

	for (const item of items) {
		const fields = getSearchableText(item);
		const allText = fields.join(' ').toLowerCase();
		const targetWords = allText.split(/\s+/).filter(Boolean);

		// Each query word must fuzzy-match somewhere
		let totalScore = 0;
		let allMatch = true;

		for (const qw of queryWords) {
			const score = wordFuzzyMatch(qw, targetWords);
			if (score < threshold) {
				allMatch = false;
				break;
			}
			totalScore += score;
		}

		if (allMatch && queryWords.length > 0) {
			results.push({
				item,
				score: totalScore / queryWords.length,
			});
		}
	}

	// Sort by score descending
	results.sort((a, b) => b.score - a.score);

	return results;
}
