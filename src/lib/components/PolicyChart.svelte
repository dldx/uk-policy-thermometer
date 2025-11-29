<script lang="ts">
    import { Plot, Dot, Line, RegressionY, HTMLTooltip } from "svelteplot";
    import { weightedLoess } from "../utils";
    import Markdown from "./Markdown.svelte";

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

    // State for hovered party
    let hoveredParty = $state<string | null>(null);

    let clickTimeout: ReturnType<typeof setTimeout> | null = null;

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

    function handlePolicyClick(policy: TweenedPolicy) {
        if (lockedTooltip === policy) {
            lockedTooltip = null;
        } else {
            lockedTooltip = policy;
        }
    }

    function tooltipPosition(node: HTMLElement, _datum: any) {
        const updatePosition = () => {
            const parentRect = node.parentElement?.getBoundingClientRect();
            if (!parentRect) return;

            const { width, height } = node.getBoundingClientRect();
            const { top: anchorY, left: anchorX } = parentRect;

            let translateX = "-100%";
            let translateY = "-100%";
            let marginTop = "-10px";
            let marginLeft = "-10px";

            // Check top overflow
            if (anchorY - height - 20 < 0) {
                translateY = "0%";
                marginTop = "10px";
            }

            // Check left overflow
            if (anchorX - width - 20 < 0) {
                translateX = "0%";
                marginLeft = "10px";
            }

            node.style.transform = `translate(${translateX}, ${translateY})`;
            node.style.marginTop = marginTop;
            node.style.marginLeft = marginLeft;
        };

        updatePosition();

        return {
            update() {
                updatePosition();
            },
        };
    }
</script>

<div class="relative flex flex-col">
    <!-- Chart Container -->
    <div
        class="relative bg-white shadow-sm p-4 border border-gray-100 rounded-xl w-full chart-container"
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
                    data={partyTweenedPolicies}
                    x={(d: TweenedPolicy) => d.date}
                    y={(d: TweenedPolicy) => d.tweenedScore}
                    r={(d: TweenedPolicy) => 2 ** d.tweenedWeight + 2}
                    fill={party.color}
                    opacity={hoveredParty
                        ? hoveredParty === party.party_name
                            ? 0.5 // hover opacity of selected party
                            : 0.05 // hover opacity of other parties
                        : 0.2}
                />
            {/each}

            <!-- Tooltips -->
            {#snippet overlay()}
                <HTMLTooltip
                    data={tweenedPolicies}
                    x="date"
                    y={(d: TweenedPolicy) => d.tweenedScore}
                >
                    {#snippet children({ datum })}
                        <!-- svelte-ignore a11y_no_static_element_interactions -->
                        <!-- svelte-ignore a11y_click_events_have_key_events -->
                        <div
                            class="max-w-lg cursor-pointer tooltip-content"
                            use:tooltipPosition={datum}
                            onclick={(e) => {
                                e.stopPropagation();
                                handlePolicyClick(datum);
                            }}
                        >
                            <!-- Header: Party and Date -->
                            <div class="flex justify-between items-start gap-3 mb-3">
                                <div class="flex items-center gap-2">
                                    <span
                                        class="flex-shrink-0 rounded-full w-3 h-3"
                                        style:background-color={datum.party_color}
                                    ></span>
                                    <span class="font-bold text-gray-900 text-base"
                                        >{datum.party_name}</span
                                    >
                                </div>
                                <span class="text-gray-500 text-sm whitespace-nowrap"
                                    >{new Date(datum.date_announced).toLocaleDateString("en-GB",
                                        {
                                            day: "numeric",
                                            month: "short",
                                            year: "numeric",
                                        }
                                    )}</span
                                >
                            </div>

                            <!-- Policy text -->
                            <div
                                class="bg-gray-50 mb-4 p-3 border border-gray-200 rounded-lg"
                            >
                                <p
                                    class="font-medium text-gray-900 text-sm leading-relaxed"
                                >
                                    <Markdown content={datum.policy_text}></Markdown>
                                </p>
                            </div>

                            <!-- Score and Weight Card -->
                            {#if datum.scores?.[criterion]}
                                <div class="bg-gradient-to-br from-blue-50 to-indigo-50 mb-4 p-4 border border-blue-200 rounded-lg">
                                    <div class="flex justify-between items-center mb-3">
                                        <div class="flex items-center gap-2">
                                            <svg
                                                class="flex-shrink-0 w-5 h-5 text-blue-600"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    stroke-linecap="round"
                                                    stroke-linejoin="round"
                                                    stroke-width="2"
                                                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                                                />
                                            </svg>
                                            <span
                                                class="font-bold text-blue-900 text-sm uppercase tracking-wide"
                                                >Score justification</span
                                            >
                                        </div>
                                        <div class="flex items-center gap-3">
                                            <!-- Weight indicator -->
                                            <div class="flex items-center gap-1.5">
                                                <span class="font-medium text-gray-600 text-xs">Weight:</span>
                                                <div class="flex gap-1">
                                                    {#each Array(3) as _, i}
                                                        <div
                                                            class="rounded-full w-2.5 h-2.5"
                                                            class:bg-gray-300={i >= datum.scores[criterion].weight}
                                                            style:background-color={i < datum.scores[criterion].weight
                                                                ? datum.party_color
                                                                : undefined}
                                                        ></div>
                                                    {/each}
                                                </div>
                                            </div>
                                            <!-- Score badge -->
                                            <div
                                                class="shadow-md px-3 py-1.5 rounded-full font-bold text-white text-lg"
                                                style:background-color={datum.party_color}
                                            >
                                                {datum.scores[criterion].score}<span class="opacity-90 text-sm">/10</span>
                                            </div>
                                        </div>
                                    </div>
                                    <!-- Reasoning -->
                                    <div class="pt-3 border-gray-300 border-t">
                                        <p class="text-blue-900 text-xs leading-relaxed">
                                            {datum.scores[criterion].reasoning}
                                        </p>
                                    </div>
                                </div>
                            {/if}

                            <!-- Source information -->
                            {#if datum.source && (datum.source.url || datum.source.notes)}
                                <details class="group">
                                    <summary class="flex items-center gap-2 bg-gray-100 hover:bg-gray-150 px-3 py-2 border border-gray-200 rounded-lg font-semibold text-gray-700 text-xs transition-colors cursor-pointer">
                                        <svg
                                            class="w-4 h-4 text-gray-500 group-open:rotate-90 transition-transform"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                stroke-linecap="round"
                                                stroke-linejoin="round"
                                                stroke-width="2"
                                                d="M9 5l7 7-7 7"
                                            />
                                        </svg>
                                        View Source
                                    </summary>
                                    <div class="bg-gray-50 mt-2 p-3 border border-gray-200 rounded-lg text-xs">
                                        {#if datum.source.url}
                                            <a
                                                href={datum.source.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                class="flex items-center gap-1.5 mb-2 font-medium text-blue-600 hover:text-blue-800 underline break-all"
                                                onclick={(e) => e.stopPropagation()}
                                            >
                                                <svg class="flex-shrink-0 w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                </svg>
                                                {datum.source.url}
                                            </a>
                                        {/if}
                                        {#if datum.source.notes}
                                            <p class="text-gray-700 leading-relaxed">
                                                {datum.source.notes}
                                            </p>
                                        {/if}
                                    </div>
                                </details>
                            {/if}
                        </div>
                    {/snippet}
                </HTMLTooltip>
            {/snippet}
        </Plot>
    </div>
</div>

<style>
    :global(.tooltip-content) {
        background: white;
        border: 1px solid #e5e7eb;
        font-size: 14px;
        padding: 16px;
        border-radius: 12px;
        line-height: 1.5;
        box-shadow:
            0 10px 15px -3px rgba(0, 0, 0, 0.1),
            0 4px 6px -2px rgba(0, 0, 0, 0.05);
        max-width: 28rem;
        pointer-events: auto;
    }

    :global(.tooltip-content a) {
        word-break: break-word;
    }

    /* Smooth transitions for chart elements */
    :global(.chart-container path),
    :global(.chart-container circle) {
        transition:
            opacity 0.5s ease,
            stroke-opacity 0.5s ease,
            stroke-width 0.5s ease;
    }
</style>
