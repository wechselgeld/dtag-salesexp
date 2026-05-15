import { Engine } from 'json-rules-engine';

/**
 * Singleton instance of the rules engine.
 * We can add custom operators here if needed.
 */
export const createRuleEngine = () => {
	const engine = new Engine();

	// Custom operator: contains
	engine.addOperator('contains', (factValue: any, jsonValue: any) => {
		if (!Array.isArray(factValue)) return false;
		return factValue.includes(jsonValue);
	});

	// Custom operator: in
	engine.addOperator('in', (factValue: any, jsonValue: any) => {
		if (!Array.isArray(jsonValue)) return false;
		return jsonValue.includes(factValue);
	});

	return engine;
};

export const globalEngine = createRuleEngine();

/**
 * Synchronous evaluator for json-rules-engine rules.
 * This is used in the calculateProductCosts function which must remain synchronous.
 */
export function evaluateRuleSync(rule: any, facts: any): boolean {
	if (!rule || !rule.conditions) return true;

	const evaluateCondition = (condition: any): boolean => {
		// Handle nested all/any
		if (condition.all) {
			return condition.all.every((c: any) => evaluateCondition(c));
		}
		if (condition.any) {
			return condition.any.some((c: any) => evaluateCondition(c));
		}

		// Handle single condition
		const { fact, operator, value } = condition;
		const factValue = facts[fact];

		switch (operator) {
			case 'equal':
				return factValue === value;
			case 'notEqual':
				return factValue !== value;
			case 'in':
				return Array.isArray(value) && value.includes(factValue);
			case 'notIn':
				return Array.isArray(value) && !value.includes(factValue);
			case 'contains':
				return Array.isArray(factValue) && factValue.includes(value);
			case 'doesNotContain':
				return Array.isArray(factValue) && !factValue.includes(value);
			case 'lessThan':
				return factValue < value;
			case 'lessThanInclusive':
				return factValue <= value;
			case 'greaterThan':
				return factValue > value;
			case 'greaterThanInclusive':
				return factValue >= value;
			default:
				console.warn(`Unknown operator: ${operator}`);
				return false;
		}
	};

	return evaluateCondition(rule.conditions);
}
