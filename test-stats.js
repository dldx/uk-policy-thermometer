import { calculateCumulativeWeightedAverage, calculateLoessTrend } from './src/lib/utils/statistics.js';

const mockPolicies = [
    { date_announced: '2025-01-01', raw_human_rights_score: 2, weight: 1 },
    { date_announced: '2025-01-02', raw_human_rights_score: 8, weight: 1 },
    { date_announced: '2025-01-03', raw_human_rights_score: 5, weight: 2 }
];

console.log('Testing Cumulative Weighted Average:');
const cumulative = calculateCumulativeWeightedAverage(mockPolicies);
console.log(JSON.stringify(cumulative, null, 2));

// Expected:
// 1. (2*1)/1 = 2
// 2. (2*1 + 8*1)/2 = 5
// 3. (2*1 + 8*1 + 5*2)/4 = (10+10)/4 = 5

console.log('\nTesting LOESS Trend:');
const loess = calculateLoessTrend(mockPolicies, 0.5);
console.log(JSON.stringify(loess, null, 2));
