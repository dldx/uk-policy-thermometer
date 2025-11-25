import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// Tricube weight function
function tricube(x: number): number {
    const absX = Math.abs(x);
    if (absX >= 1) return 0;
    return Math.pow(1 - Math.pow(absX, 3), 3);
}

export interface Point {
    x: number;
    y: number;
    w: number;
}

/**
 * Calculates weighted LOESS smoothing.
 * @param data Array of points {x, y, w} where w is the importance weight
 * @param bandwidth Smoothing parameter (0 to 1), proportion of points to include in local regression
 * @returns Array of smoothed points {x, y}
 */
export function weightedLoess(data: Point[], bandwidth: number = 0.25): { x: number; y: number }[] {
    const n = data.length;
    if (n === 0) return [];

    // Sort data by x
    const sortedData = [...data].sort((a, b) => a.x - b.x);
    const x = sortedData.map(d => d.x);
    const y = sortedData.map(d => d.y);
    const w = sortedData.map(d => d.w);

    const smoothed: { x: number; y: number }[] = [];

    // Number of points in the window
    const k = Math.floor(bandwidth * n);

    for (let i = 0; i < n; i++) {
        const xi = x[i];

        // Find k nearest neighbors
        // Calculate distances to xi
        const dists = x.map((val, idx) => ({ idx, dist: Math.abs(val - xi) }));
        // Sort by distance
        dists.sort((a, b) => a.dist - b.dist);

        // Get the distance to the k-th nearest neighbor (max distance in window)
        const maxDist = dists[Math.min(k, n - 1)].dist;

        // If maxDist is 0 (all points on top of each other), handle gracefully
        const denom = maxDist > 0 ? maxDist : 1;

        let sumWeights = 0;
        let sumWx = 0;
        let sumWy = 0;
        let sumWxx = 0;
        let sumWxy = 0;

        // Calculate weighted linear regression components
        for (let j = 0; j < n; j++) {
            const xj = x[j];
            const yj = y[j];
            const dist = Math.abs(xj - xi);

            // Tricube weight based on distance
            const robustWeight = tricube(dist / denom);

            // Combine with user-defined importance weight
            // We multiply them. Importance weight w[j] scales the contribution.
            const combinedWeight = robustWeight * w[j];

            if (combinedWeight > 0) {
                sumWeights += combinedWeight;
                sumWx += combinedWeight * xj;
                sumWy += combinedWeight * yj;
                sumWxx += combinedWeight * xj * xj;
                sumWxy += combinedWeight * xj * yj;
            }
        }

        // Solve for beta0 and beta1: y = beta0 + beta1 * x
        // weighted mean x = sumWx / sumWeights
        // weighted mean y = sumWy / sumWeights
        // But we want the value at xi.
        // Simple weighted linear regression solution:
        // beta1 = (sumWeights * sumWxy - sumWx * sumWy) / (sumWeights * sumWxx - sumWx * sumWx)
        // beta0 = (sumWy - beta1 * sumWx) / sumWeights
        // y_hat = beta0 + beta1 * xi

        let yHat: number;

        const delta = sumWeights * sumWxx - sumWx * sumWx;

        if (Math.abs(delta) < 1e-9) {
            // Fallback to weighted mean if collinear or not enough points
            yHat = sumWeights > 0 ? sumWy / sumWeights : 0;
        } else {
            const beta1 = (sumWeights * sumWxy - sumWx * sumWy) / delta;
            const beta0 = (sumWy - beta1 * sumWx) / sumWeights;
            yHat = beta0 + beta1 * xi;
        }

        smoothed.push({ x: xi, y: yHat });
    }

    return smoothed;
}
