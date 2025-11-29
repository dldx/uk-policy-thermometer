<script lang="ts">
    import { Plot, Dot, Line, RegressionY } from "svelteplot";
    import { weightedLoess } from "../utils";
    import PolicyTooltip from "./PolicyTooltip.svelte";

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
    }

    let {
        data,
        criterion = "human_rights",
        title = "Policy Impact",
        criterionLabel = "",
    }: { data: Party[]; criterion?: string; title?: string; criterionLabel?: string } = $props();

    // State for toggling parties
    let visibleParties = $state(new Set(data.map((d) => d.party_name)));

    // State for locked tooltip (for click-to-persist behavior)
    let lockedTooltip = $state<TweenedPolicy | null>(null);

    // State for hovered tooltip
    let hoveredTooltip = $state<TweenedPolicy | null>(null);

    // State for hovered party
    let hoveredParty = $state<string | null>(null);

    // Tooltip position
    let tooltipPosition = $state<{ x: number; y: number; transform: string; margin: string } | null>(null);

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
                const policyKey = `${party.party_name}-${policy.date_announced}-${policy.policy_text.substring(0, 50)}`;
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
                const policyKey = `${party.party_name}-${policy.date_announced}-${policy.policy_text.substring(0, 50)}`;
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

    function calculateTooltipPosition(clientX: number, clientY: number): { x: number; y: number; transform: string; margin: string } {
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
            margin: `${marginTop} 0 0 ${marginLeft}`
        };
    }

    function handlePolicyClick(policy: TweenedPolicy, event: MouseEvent) {
        event.stopPropagation();
        if (lockedTooltip === policy) {
            lockedTooltip = null;
            tooltipPosition = null;
        } else {
            lockedTooltip = policy;
            hoveredTooltip = null;
            tooltipPosition = calculateTooltipPosition(event.clientX, event.clientY);
        }
    }

    function handlePolicyMouseOver(policy: TweenedPolicy, event: MouseEvent) {
        if (!lockedTooltip) {
            if (hoverTimeout) {
                clearTimeout(hoverTimeout);
                hoverTimeout = null;
            }
            hoveredTooltip = policy;
            tooltipPosition = calculateTooltipPosition(event.clientX, event.clientY);
        }
    }

    function handlePolicyMouseLeave() {
        if (!lockedTooltip) {
            // Delay clearing to allow mouse to move to tooltip
            hoverTimeout = setTimeout(() => {
                if (!isMouseOverTooltip) {
                    hoveredTooltip = null;
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
        if (!lockedTooltip) {
            hoveredTooltip = null;
            tooltipPosition = null;
        }
    }

    // Close locked tooltip when clicking outside
    function handleChartClick() {
        if (lockedTooltip) {
            lockedTooltip = null;
            tooltipPosition = null;
        }
    }

    // Derived state for active tooltip
    let activeTooltip = $derived(lockedTooltip || hoveredTooltip);
</script>

<div class="relative flex flex-col">
    <!-- Chart Container -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <div
        class="relative bg-white shadow-sm p-4 border border-gray-100 rounded-xl w-full chart-container"
        onclick={handleChartClick}
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
                    style:opacity={visibleParties.has(party.party_name) ? 1 : 0.5}
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
                domain: [new Date("2021-01-01"), new Date("2025-12-31")],
                grid: true,
            }}
            y={{
                domain: [0, 10],
                grid: true,
            }}
            marginLeft={50}
            marginRight={30}
            marginTop={20}
            marginBottom={40}
            class="font-[Inter] [&_h3]:text-xl [&_h2]:text-center [&_h3]:text-center"
            title={title}
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
                <Dot
                    data={partyTweenedPolicies as any}
                    x={(d: TweenedPolicy) => d.date}
                    y={(d: TweenedPolicy) => d.tweenedScore}
                    r={(d: TweenedPolicy) => 2 ** d.tweenedWeight + 2}
                    fill={party.color}
                    opacity={hoveredParty
                        ? hoveredParty === party.party_name
                            ? 0.5 // hover opacity of selected party
                            : 0.05 // hover opacity of other parties
                        : 0.2}
                    cursor="pointer"
                    onclick={(event: MouseEvent, d: TweenedPolicy) => handlePolicyClick(d, event)}
                    onmouseover={(event: MouseEvent, d: TweenedPolicy) => handlePolicyMouseOver(d, event)}
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
                    lockedTooltip = null;
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
