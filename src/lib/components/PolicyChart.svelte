<script lang="ts">
    import { Plot, Dot, Line, RegressionY } from "svelteplot";
    import { weightedLoess } from "../utils";
    import PolicyTooltip from "./PolicyTooltip.svelte";
    import { dodgeX } from "svelteplot/transforms/dodge.js";
    import { forceSimulation, forceX, forceY, forceCollide } from "d3-force";
    import { scaleTime, scaleLinear } from "d3-scale";

    interface Score {
        score: number;
        weight: number;
        reasoning: string;
    }

    interface Policy {
        date_announced: string;
        policy_text: string;
        scores: {
            [criterion: string]: Score;
        };
        source?: {
            url?: string;
            notes?: string;
        };
    }

    interface Party {
        party_name: string;
        color: string;
        policies: Policy[];
    }

    interface TweenedPolicy extends Policy {
        party_name: string;
        party_color: string;
        date: Date;
        tweenedScore: number;
        tweenedWeight: number;
        // Simulated positions
        simulatedDate?: Date;
        simulatedScore?: number;
        x?: number; // d3-force internal
        y?: number; // d3-force internal
    }

    let {
        data,
        criterion = "human_rights",
        title = "Policy Impact",
        criterionLabel = "",
    }: {
        data: Party[];
        criterion?: string;
        title?: string;
        criterionLabel?: string;
    } = $props();

    // State for toggling parties
    let visibleParties = $state(new Set(data.map((d) => d.party_name)));

    // State for locked tooltip (for click-to-persist behavior)
    let lockedTooltipKey = $state<string | null>(null);

    // State for hovered tooltip
    let hoveredTooltipKey = $state<string | null>(null);

    // State for hovered party
    let hoveredParty = $state<string | null>(null);

    // Tooltip position
    let tooltipPosition = $state<{
        x: number;
        y: number;
        transform: string;
        margin: string;
    } | null>(null);

    // Track if mouse is over tooltip
    let isMouseOverTooltip = $state(false);

    let clickTimeout: ReturnType<typeof setTimeout> | null = null;
    let hoverTimeout: ReturnType<typeof setTimeout> | null = null;

    // Store tweened values for each policy
    interface TweenState {
        current: number;
        target: number;
        startTime: number;
        startValue: number;
    }

    let scoreTweens = $state<Map<string, TweenState>>(new Map());
    let weightTweens = $state<Map<string, TweenState>>(new Map());
    let animationFrame: number | null = null;

    const TWEEN_DURATION = 600; // milliseconds

    // Easing function (cubic out)
    function cubicOut(t: number): number {
        const f = t - 1;
        return f * f * f + 1;
    }

    // Helper to generate unique key for policy
    function getPolicyKey(partyName: string, policy: Policy): string {
        return `${partyName}-${policy.date_announced}-${policy.policy_text.substring(0, 50)}`;
    }

    // Update all tween values
    function updateTweens(timestamp: number) {
        let needsUpdate = false;

        // Update score tweens
        for (const [key, tween] of scoreTweens.entries()) {
            if (tween.current !== tween.target) {
                const elapsed = timestamp - tween.startTime;
                const progress = Math.min(elapsed / TWEEN_DURATION, 1);
                const easedProgress = cubicOut(progress);

                tween.current =
                    tween.startValue +
                    (tween.target - tween.startValue) * easedProgress;

                if (progress < 1) {
                    needsUpdate = true;
                } else {
                    tween.current = tween.target; // Snap to target
                }
            }
        }

        // Update weight tweens
        for (const [key, tween] of weightTweens.entries()) {
            if (tween.current !== tween.target) {
                const elapsed = timestamp - tween.startTime;
                const progress = Math.min(elapsed / TWEEN_DURATION, 1);
                const easedProgress = cubicOut(progress);

                tween.current =
                    tween.startValue +
                    (tween.target - tween.startValue) * easedProgress;

                if (progress < 1) {
                    needsUpdate = true;
                } else {
                    tween.current = tween.target; // Snap to target
                }
            }
        }

        if (needsUpdate) {
            // Trigger reactivity
            scoreTweens = new Map(scoreTweens);
            weightTweens = new Map(weightTweens);
            animationFrame = requestAnimationFrame(updateTweens);
        } else {
            animationFrame = null;
        }
    }

    // Update tween targets when criterion changes
    $effect(() => {
        const currentCriterion = criterion;
        const timestamp = performance.now();

        const newScoreTweens = new Map(scoreTweens);
        const newWeightTweens = new Map(weightTweens);
        let hasChanges = false;

        for (const party of data) {
            for (const policy of party.policies) {
                const policyKey = getPolicyKey(party.party_name, policy);
                const newScore = policy.scores[currentCriterion]?.score ?? 0;
                const newWeight = policy.scores[currentCriterion]?.weight ?? 0;

                // Update or create score tween
                const scoreTween = newScoreTweens.get(policyKey);
                if (!scoreTween) {
                    newScoreTweens.set(policyKey, {
                        current: newScore,
                        target: newScore,
                        startTime: timestamp,
                        startValue: newScore,
                    });
                    hasChanges = true;
                } else if (scoreTween.target !== newScore) {
                    newScoreTweens.set(policyKey, {
                        ...scoreTween,
                        startValue: scoreTween.current,
                        target: newScore,
                        startTime: timestamp,
                    });
                    hasChanges = true;
                }

                // Update or create weight tween
                const weightTween = newWeightTweens.get(policyKey);
                if (!weightTween) {
                    newWeightTweens.set(policyKey, {
                        current: newWeight,
                        target: newWeight,
                        startTime: timestamp,
                        startValue: newWeight,
                    });
                    hasChanges = true;
                } else if (weightTween.target !== newWeight) {
                    newWeightTweens.set(policyKey, {
                        ...weightTween,
                        startValue: weightTween.current,
                        target: newWeight,
                        startTime: timestamp,
                    });
                    hasChanges = true;
                }
            }
        }

        if (hasChanges) {
            scoreTweens = newScoreTweens;
            weightTweens = newWeightTweens;

            // Start animation if not already running
            if (animationFrame === null) {
                animationFrame = requestAnimationFrame(updateTweens);
            }
        }
    });

    function handlePartyClick(partyName: string) {
        if (clickTimeout) clearTimeout(clickTimeout);
        clickTimeout = setTimeout(() => {
            toggleParty(partyName);
            clickTimeout = null;
        }, 250);
    }

    function handlePartyDoubleClick(partyName: string) {
        if (clickTimeout) {
            clearTimeout(clickTimeout);
            clickTimeout = null;
        }
        isolateParty(partyName);
    }

    function toggleParty(partyName: string) {
        if (visibleParties.has(partyName)) {
            visibleParties.delete(partyName);
        } else {
            visibleParties.add(partyName);
        }
        // Trigger reactivity for set
        visibleParties = new Set(visibleParties);
    }

    function isolateParty(partyName: string) {
        if (visibleParties.size === 1 && visibleParties.has(partyName)) {
            visibleParties = new Set(data.map((d) => d.party_name));
        } else {
            visibleParties = new Set([partyName]);
        }
    }

    // Flatten all policies with party info and tweened scores
    let tweenedPolicies = $derived.by(() => {
        const policies: TweenedPolicy[] = [];

        for (const party of data.filter(
            (party) =>
                visibleParties.has(party.party_name) ||
                hoveredParty === party.party_name,
        )) {
            for (const policy of party.policies) {
                const policyKey = getPolicyKey(party.party_name, policy);
                const scoreTween = scoreTweens.get(policyKey);
                const weightTween = weightTweens.get(policyKey);

                if (scoreTween && weightTween) {
                    policies.push({
                        ...policy,
                        party_name: party.party_name,
                        party_color: party.color,
                        date: new Date(policy.date_announced),
                        tweenedScore: scoreTween.current,
                        tweenedWeight: weightTween.current,
                    });
                }
            }
        }

        return policies;
    });

    function calculateTooltipPosition(
        clientX: number,
        clientY: number,
    ): { x: number; y: number; transform: string; margin: string } {
        // Estimate tooltip size (can be adjusted based on actual content)
        const tooltipWidth = 450; // max-width is 28rem ~ 448px
        const tooltipHeight = 400; // estimated height
        const padding = 20; // padding from edges

        let x = clientX;
        let y = clientY;
        let translateX = "-100%";
        let translateY = "-100%";
        let marginLeft = "-10px";
        let marginTop = "-10px";

        // Check if tooltip would overflow right edge
        if (x + padding > window.innerWidth - tooltipWidth) {
            // Position to the left of cursor
            translateX = "-100%";
            marginLeft = "-10px";
        } else if (x - tooltipWidth - padding < 0) {
            // Position to the right of cursor
            translateX = "0%";
            marginLeft = "10px";
        }

        // Check if tooltip would overflow bottom edge
        if (y + padding > window.innerHeight - tooltipHeight) {
            // Position above cursor
            translateY = "-100%";
            marginTop = "-10px";
        } else if (y - tooltipHeight - padding < 0) {
            // Position below cursor
            translateY = "0%";
            marginTop = "10px";
        }

        return {
            x,
            y,
            transform: `translate(${translateX}, ${translateY})`,
            margin: `${marginTop} 0 0 ${marginLeft}`,
        };
    }

    function handlePolicyClick(policy: TweenedPolicy, event: MouseEvent) {
        event.stopPropagation();
        const key = getPolicyKey(policy.party_name, policy);

        if (lockedTooltipKey === key) {
            lockedTooltipKey = null;
            tooltipPosition = null;
        } else {
            lockedTooltipKey = key;
            hoveredTooltipKey = null;
            tooltipPosition = calculateTooltipPosition(
                event.clientX,
                event.clientY,
            );
        }
    }

    function handlePolicyMouseOver(policy: TweenedPolicy, event: MouseEvent) {
        if (!lockedTooltipKey) {
            if (hoverTimeout) {
                clearTimeout(hoverTimeout);
                hoverTimeout = null;
            }
            hoveredTooltipKey = getPolicyKey(policy.party_name, policy);
            tooltipPosition = calculateTooltipPosition(
                event.clientX,
                event.clientY,
            );
        }
    }

    function handlePolicyMouseLeave() {
        if (!lockedTooltipKey) {
            // Delay clearing to allow mouse to move to tooltip
            hoverTimeout = setTimeout(() => {
                if (!isMouseOverTooltip) {
                    hoveredTooltipKey = null;
                    tooltipPosition = null;
                }
            }, 100);
        }
    }

    function handleTooltipMouseEnter() {
        isMouseOverTooltip = true;
        if (hoverTimeout) {
            clearTimeout(hoverTimeout);
            hoverTimeout = null;
        }
    }

    function handleTooltipMouseLeave() {
        isMouseOverTooltip = false;
        if (!lockedTooltipKey) {
            hoveredTooltipKey = null;
            tooltipPosition = null;
        }
    }

    // Close locked tooltip when clicking outside
    function handleChartClick() {
        if (lockedTooltipKey) {
            lockedTooltipKey = null;
            tooltipPosition = null;
        }
    }

    // Derived state for active tooltip
    let activeTooltip = $derived.by(() => {
        const key = lockedTooltipKey || hoveredTooltipKey;
        if (!key) return null;

        // Find the policy in the current tweenedPolicies list
        // This ensures we get the latest reactive values
        return (
            tweenedPolicies.find(
                (p) => getPolicyKey(p.party_name, p) === key,
            ) || null
        );
    });
    // Chart configuration
    const chartConfig = {
        x: {
            domain: [new Date("2021-01-01"), new Date("2025-12-31")],
            margin: { left: 50, right: 30 },
        },
        y: {
            domain: [0, 10],
            margin: { top: 20, bottom: 40 },
        },
    };

    // Simulation state
    let chartWidth = $state(800);
    let chartHeight = $state(600);
    let useForceSimulation = $state(false);
    let simulationTimeout: ReturnType<typeof setTimeout> | null = null;

    // Reset simulation delay when criterion or visible parties change
    $effect(() => {
        // Track dependencies
        const _ = criterion;
        const __ = visibleParties;
        const ___ = tweenedPolicies; // Also track data changes (e.g., from slider updates)

        // Clear existing timeout
        if (simulationTimeout) {
            clearTimeout(simulationTimeout);
        }

        // Disable force simulation immediately
        useForceSimulation = false;

        // Enable force simulation after 1 second
        simulationTimeout = setTimeout(() => {
            useForceSimulation = true;
        }, 1000);

        return () => {
            if (simulationTimeout) {
                clearTimeout(simulationTimeout);
            }
        };
    });

    // Run force simulation to prevent overlap (only when enabled)
    let simulatedPolicies = $derived.by(() => {
        const policies = [...tweenedPolicies]; // Create a shallow copy to mutate

        if (policies.length === 0) return [];

        // Define scales matching the Plot configuration
        const xScale = scaleTime()
            .domain(chartConfig.x.domain)
            .range([
                chartConfig.x.margin.left,
                chartWidth - chartConfig.x.margin.right,
            ]);

        const yScale = scaleLinear()
            .domain(chartConfig.y.domain)
            .range([
                chartHeight - chartConfig.y.margin.bottom,
                chartConfig.y.margin.top,
            ]);

        // Initialize positions
        const nodes = policies.map((p) => ({
            ...p,
            x: xScale(p.date),
            y: yScale(p.tweenedScore),
            r: 2 ** p.tweenedWeight + 2, // Radius for collision
        }));

        // Only run simulation if enabled
        if (useForceSimulation) {
            // Run simulation synchronously
            const simulation = forceSimulation(nodes)
                .force(
                    "x",
                    forceX((d: TweenedPolicy) => xScale(d.date)).strength(1),
                ) // Strong pull to original X
                .force(
                    "y",
                    forceY((d: TweenedPolicy) =>
                        yScale(d.tweenedScore),
                    ).strength(0.1),
                ) // Weaker pull to original Y
                .force(
                    "collide",
                    forceCollide(
                        (d: TweenedPolicy & { r: number }) => d.r + 1,
                    ).iterations(3),
                ) // Prevent overlap
                .stop();

            // Tick simulation enough times to stabilize
            for (let i = 0; i < 120; ++i) simulation.tick();
        }

        // Map back to data coordinates for Plot
        return nodes.map((node) => ({
            ...node,
            simulatedDate: xScale.invert(node.x!),
            simulatedScore: yScale.invert(node.y!),
        }));
    });
</script>

<div class="relative flex flex-col">
    <!-- Chart Container -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <div
        class="relative bg-white shadow-sm p-4 border border-gray-100 rounded-xl w-full chart-container"
        onclick={handleChartClick}
        bind:clientWidth={chartWidth}
    >
        <!-- Legend -->
        <div
            class="flex flex-wrap justify-center gap-3 mb-4 pb-4 border-gray-200 border-b"
        >
            {#each data as party}
                <button
                    class="flex items-center gap-2 px-3 py-1 border rounded-full transition-all duration-200"
                    style:background-color={visibleParties.has(party.party_name)
                        ? party.color + "20"
                        : "transparent"}
                    style:border-color={party.color}
                    style:opacity={visibleParties.has(party.party_name)
                        ? 1
                        : 0.5}
                    onclick={() => handlePartyClick(party.party_name)}
                    ondblclick={() => handlePartyDoubleClick(party.party_name)}
                    onmouseenter={() => (hoveredParty = party.party_name)}
                    onmouseleave={() => (hoveredParty = null)}
                >
                    <span
                        class="rounded-full w-3 h-3"
                        style:background-color={party.color}
                    ></span>
                    <span class="font-medium text-gray-800 text-sm"
                        >{party.party_name}</span
                    >
                </button>
            {/each}
        </div>
        <Plot
            height={600}
            x={{
                domain: chartConfig.x.domain,
                grid: true,
            }}
            y={{
                domain: chartConfig.y.domain,
                grid: true,
            }}
            marginLeft={chartConfig.x.margin.left}
            marginRight={chartConfig.x.margin.right}
            marginTop={chartConfig.y.margin.top}
            marginBottom={chartConfig.y.margin.bottom}
            class="font-[Inter] [&_h3]:text-xl [&_h2]:text-center [&_h3]:text-center"
            {title}
            subtitle={criterionLabel}
        >
            <!-- Weighted LOESS Regression Lines for each party -->
            {#each data.filter((p) => visibleParties.has(p.party_name) || hoveredParty === p.party_name) as party}
                {@const partyTweenedPolicies = tweenedPolicies.filter(
                    (p) =>
                        p.party_name === party.party_name &&
                        p.scores[criterion],
                )}
                {@const loessData = weightedLoess(
                    partyTweenedPolicies.map((p) => ({
                        x: p.date.getTime(),
                        y: p.tweenedScore,
                        w: 2 ** p.tweenedWeight, // Use exponential weight to make important policies count more
                    })),
                    0.2,
                ).map((d) => ({ date: new Date(d.x), score: d.y }))}
                <Line
                    data={loessData}
                    x="date"
                    y="score"
                    stroke={party.color}
                    strokeWidth={hoveredParty === party.party_name ? 5 : 4}
                    strokeOpacity={hoveredParty &&
                    hoveredParty !== party.party_name
                        ? 0.1
                        : 1}
                    onpointerenter={() => (hoveredParty = party.party_name)}
                    onpointerleave={() => (hoveredParty = null)}
                    curve="monotone-x"
                />
                <!-- <RegressionY
                    data={party.policies.map((p) => ({
                        date: new Date(p.date_announced),
                        score: p.raw_human_rights_score,
                    }))}
                    type="loess"
                    span={0.25}
                    x="date"
                    y="score"
                    stroke={"grey"}
                    strokeWidth={hoveredParty === party.party_name ? 5 : 4}
                    strokeOpacity={hoveredParty &&
                    hoveredParty !== party.party_name
                        ? 0.1
                        : 1}
                    onpointerenter={() => (hoveredParty = party.party_name)}
                    onpointerleave={() => (hoveredParty = null)}
                    curve="basis"
                /> -->

                <!-- Data Points -->
                <!-- We use the simulated positions for the dots to avoid overlap -->
                {@const simulatedPoints = simulatedPolicies.filter(
                    (p: TweenedPolicy) =>
                        p.party_name === party.party_name &&
                        p.scores[criterion],
                )}
                <Dot
                    data={simulatedPoints}
                    x={(d: TweenedPolicy) => d.simulatedDate}
                    y={(d: TweenedPolicy) => d.simulatedScore}
                    r={(d: TweenedPolicy) => 2 ** d.tweenedWeight + 2}
                    fill={party.color}
                    opacity={hoveredParty
                        ? hoveredParty === party.party_name
                            ? 0.5 // hover opacity of selected party
                            : 0.05 // hover opacity of other parties
                        : 0.2}
                    cursor="pointer"
                    onclick={(event: MouseEvent, d: TweenedPolicy) =>
                        handlePolicyClick(d, event)}
                    onmouseover={(event: MouseEvent, d: TweenedPolicy) =>
                        handlePolicyMouseOver(d, event)}
                    onmouseleave={handlePolicyMouseLeave}
                />
            {/each}
        </Plot>
    </div>

    <!-- Custom Tooltip -->
    {#if activeTooltip && tooltipPosition}
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <div
            class="z-50 fixed pointer-events-auto"
            style:left="{tooltipPosition.x}px"
            style:top="{tooltipPosition.y}px"
            style:transform={tooltipPosition.transform}
            style:margin={tooltipPosition.margin}
            onmouseenter={handleTooltipMouseEnter}
            onmouseleave={handleTooltipMouseLeave}
            onclick={(e) => e.stopPropagation()}
        >
            <PolicyTooltip
                datum={activeTooltip}
                {criterion}
                onPolicyClick={(policy) => {
                    lockedTooltipKey = null;
                    tooltipPosition = null;
                }}
            />
        </div>
    {/if}
</div>

<style>
    /* Smooth transitions for chart elements */
    :global(.chart-container path),
    :global(.chart-container circle) {
        transition:
            opacity 0.5s ease,
            stroke-opacity 0.5s ease,
            stroke-width 0.5s ease;
    }
</style>
