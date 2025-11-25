import loess from 'loess';

/**
 * @typedef {Object} Policy
 * @property {string} date_announced
 * @property {number} raw_human_rights_score
 * @property {string} policy_text
 * @property {number} weight
 */

/**
 * Calculates the cumulative weighted moving average for a list of policies.
 * @param {Policy[]} policies
 * @returns {Array<{date: Date, score: number, policy: Policy}>}
 */
export function calculateCumulativeWeightedAverage(policies) {
    // Sort policies by date
    const sortedPolicies = [...policies].sort((a, b) => new Date(a.date_announced) - new Date(b.date_announced));

    let cumulativeScoreProduct = 0;
    let cumulativeWeight = 0;

    return sortedPolicies.map(policy => {
        cumulativeScoreProduct += policy.raw_human_rights_score * policy.weight;
        cumulativeWeight += policy.weight;

        const averageScore = cumulativeWeight === 0 ? 0 : cumulativeScoreProduct / cumulativeWeight;

        return {
            date: new Date(policy.date_announced),
            score: averageScore,
            policy
        };
    });
}

/**
 * Calculates the LOESS trend line for policies.
 * @param {Policy[]} policies
 * @param {number} span - The smoothing span (0-1), default 0.25
 * @returns {Array<{date: Date, score: number}>}
 */
export function calculateLoessTrend(policies, span = 0.25) {
    if (policies.length < 3) {
        // LOESS requires at least a few points. Return the raw points as fallback.
        return policies.map(p => ({
            date: new Date(p.date_announced),
            score: p.raw_human_rights_score
        })).sort((a, b) => a.date - b.date);
    }

    const sortedPolicies = [...policies].sort((a, b) => new Date(a.date_announced) - new Date(b.date_announced));

    // Prepare data for loess
    const x = sortedPolicies.map(p => new Date(p.date_announced).getTime());
    const y = sortedPolicies.map(p => p.raw_human_rights_score);

    // Run LOESS regression
    const model = loess({ x, y }, { span });

    // Generate trend points
    return model.fitted.map((score, i) => ({
        date: new Date(x[i]),
        score: score
    }));
}
