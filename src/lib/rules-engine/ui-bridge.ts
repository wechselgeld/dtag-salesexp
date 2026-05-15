/**
 * Converts the legacy boolean-based conditions into a json-rules-engine compatible rule.
 */
export function generateRuleFromLegacyData(data: {
	magentaTVRequirement?: string;
	requiresSpeedUp?: boolean;
	requiresMove?: boolean;
	requiresNewActivation?: boolean;
}) {
	const conditions: any[] = [];

	if (data.magentaTVRequirement === 'REQUIRED') {
		conditions.push({ fact: 'magentaTV', operator: 'equal', value: true });
	} else if (data.magentaTVRequirement === 'NOT_ALLOWED') {
		conditions.push({ fact: 'magentaTV', operator: 'equal', value: false });
	}

	if (data.requiresSpeedUp) {
		conditions.push({ fact: 'businessCase', operator: 'equal', value: 'SPEED_UP' });
	}
	if (data.requiresMove) {
		conditions.push({ fact: 'businessCase', operator: 'equal', value: 'MOVE' });
	}
	if (data.requiresNewActivation) {
		conditions.push({ fact: 'businessCase', operator: 'equal', value: 'NEW_ACTIVATION' });
	}

	if (conditions.length === 0) {
		return null;
	}

	// Default to 'all' (AND) for legacy data
	return {
		conditions: {
			all: conditions,
		},
		event: {
			type: 'apply-special-price',
		},
	};
}

/**
 * Similar for Addons
 */
export function generateAddonRuleFromLegacyData(data: {
	magentaTVRequirement?: string;
}) {
	if (!data.magentaTVRequirement || data.magentaTVRequirement === 'NONE') {
		return null;
	}

	return {
		conditions: {
			all: [
				{
					fact: 'magentaTV',
					operator: 'equal',
					value: data.magentaTVRequirement === 'REQUIRED',
				},
			],
		},
		event: {
			type: 'apply-addon',
		},
	};
}
